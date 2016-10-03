"use strict"
/* Requires */
const express = require('express');
const path = require('path');
const logger = require('morgan');
const http = require('http');
const socketIO = require('socket.io');
const shortid = require('shortid');
const bodyParser = require('body-parser');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const expressSession=require('express-session');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
require("dotenv").config();
///////////////////////////////////////////
const renderToString= require('react-dom/server').renderToString;
const match= require('react-router').match;
const RouterContext= require('react-router').RouterContext;

/* Init */
const app = express();
const server = http.createServer(app);
const io = socketIO.listen(server);

/* DB  */

 
const users = require('./db/models').users;
const instruments = require('./db/models').instruments;
const PrivateRooms = require('./db/models').PrivateRooms;

//
/* Middleware */
app.use(cookieParser());
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//app.use('/public', express.static(__dirname + '/../client/public'/*, {maxAge:'1d'}*/));
//app.use(express.static(__dirname + '/client/public'));

const pathToStaticDir = path.resolve(__dirname, '..', 'client/public');

app.use(express.static(pathToStaticDir/*, {maxAge:"1d"}*/));
app.use(express.static(pathToStaticDir, { redirect: false }));
//
/* Auth */
app.use(expressSession({
  secret: 'keyboardCat',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

const fbConfig = {
  clientID: '1014211832028342',
  clientSecret: 'ac6ae8a72885b86270805337f66e83e6',
  callbackURL: 'https://jamwithfriendz.herokuapp.com/auth/facebook/callback'
};

passport.use(new FacebookStrategy(fbConfig, (accessToken, refreshToken, profile, done) => {
  //console.log('this is the profile', profile);
  users.findAll({ where: { facebookId: profile.id } })
    .then(user => {
      if (user.length > 0) {
        //console.log('user already exists', user[0]);
        return done(null, user);
      } else {
        return users.create({
          userName: `${profile.displayName}`,
          password: "N/A",
          facebookId: profile.id,
          token: accessToken,
        }).then(entry => {
          console.log('this is entry for a newly added user', entry.dataValues.id);
          console.log(entry.dataValues, ' got entered', entry);
          return done(null, entry.dataValues.id);
        });
      }
    });
}
));

// serialize and deserialize
passport.serializeUser((user, done) => {
  const final = typeof user==="number"?user:user[0].dataValues.id;
  //console.log('this is the user param serializing', user);
  done(null, final);
});

passport.deserializeUser((id, done) => {
  console.log('this is id in deserialize', id);
  users.findAll({ where: { id } })
    .then(found => {
      const values = found[0].dataValues;
      //console.log('Trying to "deserialize" this user', values);
      done(null, id);
    });
});

/* Sockets */
// rooms for peer connection sockets
const rooms = {};
// keep track of private rooms
const privRooms = {};
// map actual rooms to another room which contains peer info sockets
const listenerRooms = {};

io.on('connection', socket => {
  console.log('Socket connected with ID: ', socket.id);

  io.to(socket.id).emit('connected');

  socket.on('create room', data => {
    const roomId = data.roomId;
    const isPrivate = data.isPrivate || false;
    // const socketId = socket.id;
    if (rooms[roomId]) {
      io.to(socket.id).emit('room name taken');
    } else {
      rooms[roomId] = [];
      if (isPrivate) {
        // value as username?
        privRooms[roomId] = true;
      }
      io.to(socket.id).emit('room created', roomId);
    }
  });

  socket.on('join', roomId => {
    console.log(socket.id, 'joining', roomId);
    // does room exist?
    if (!rooms[roomId]) {
      io.to(socket.id).emit('invalid room');
    // is room full?
    } else if (rooms[roomId].length >= 4) {
      socket.emit('full', roomId);
    } else {
      socket.join(roomId);
      rooms[roomId].push({ peerId: socket.id.slice(2), instrument: 'piano' });
      console.log('room is', rooms[roomId]);

      // update open rooms table
      io.emit('give rooms info', getRoomsInfo(rooms));

      // emit message to socket which just joined
      io.to(socket.id).emit('joined', JSON.stringify(rooms[roomId]));
      // emit message to other sockets in room
      socket.broadcast.to(roomId).emit('new peer');

      socket.on('disconnect', () => {
        const socketsInRoom = rooms[roomId];
        const id = socket.id.slice(2);
        // check to make sure peer is in room and get index of peer
        for (var i = 0; i < socketsInRoom.length; i++) {
          if (socketsInRoom[i].peerId === id) {
            socketsInRoom.splice(i, 1);
            socket.leave(roomId);
            socket.broadcast.to(roomId).emit('remove connection', id);

            if (socketsInRoom.length === 0) {
              delete rooms[roomId];
              delete listenerRooms[roomId];
              delete privRooms[roomId];
            } else {
              // give updated list of peer info
              io.to(listenerRooms[roomId]).emit('receive peer info', JSON.stringify(rooms[roomId]));
            }
            // update open rooms table
            io.emit('give rooms info', getRoomsInfo(rooms));

            break;
          }
        }
      });
    }
  });

  socket.on('exit room', data => {
    const room = rooms[data.roomId];
    if (room !== undefined) {
      // check to make sure peer is in room and get index of peer
      for (var i = 0; i < room.length; i++) {
        if (room[i].peerId === data.id) {
          room.splice(i, 1);
          socket.leave(data.roomId);
          console.log(rooms[data.roomId]);
          socket.broadcast.to(data.roomId).emit('remove connection', data.id);

          // delete room if empty
          if (room.length === 0) {
            delete rooms[data.roomId];
            delete listenerRooms[data.roomId];
            delete privRooms[data.roomId];
          } else {
            // give updated list of peer info
            io.to(listenerRooms[data.roomId]).emit('receive peer info', JSON.stringify(room));
          }
          // update open rooms table
          io.emit('give rooms info', getRoomsInfo(rooms));

          // disconnect socket, client will create new socket when it starts
          // peer connection process again
          socket.disconnect(0);
          break;
        }
      }
    }
  });

  socket.on('offer', offer => {
    io.to(`/#${offer.to}`).emit('offer', offer);
  });

  socket.on('answer', answer => {
    io.to(`/#${answer.to}`).emit('answer', answer);
  });

  socket.on('newInstCreated', i => {
    console.log('this is a brand new instrument', i, i.A);
    instruments.create(i).then(instrumentEntry => {
      console.log(instrumentEntry.dataValues, ' got entered');
    });
  });

  socket.on('get rooms info', id => {
    // send info to populate creaorjoin open room table
    io.to(`/#${id}`).emit('give rooms info', getRoomsInfo(rooms));
  });

  // add this socket as listener to a room mapped from client room
  // need to do this because using a different socket from one used
  // to establish rtc connections
  socket.on('add as listener', room => {
    listenerRooms[room] = listenerRooms[room] || shortid.generate();
    socket.join(listenerRooms[room]);
  });

  socket.on('select instrument', data => {
    const room = rooms[data.roomId];
    // update instrument of user
    for (var i = 0; i < room.length; i++) {
      if (room[i].peerId === data.id) {
        room[i].instrument = data.instrument;
        const updateRoom = JSON.stringify(room);

        // send out updated info of user instruments
        io.to(listenerRooms[data.roomId]).emit('receive peer info', updateRoom);

        // update open rooms table
        io.emit('give rooms info', getRoomsInfo(rooms));
        break;
      }
    }
  });

  socket.on('request peer info', data => {
    io.to(`/#${data.socketId}`).emit('receive peer info', JSON.stringify(rooms[data.roomId]));
  });

  function getRoomsInfo(roomObj) {
    const roomNames = Object.keys(roomObj);
    const container = [];
    for (var i = 0; i < roomNames.length; i++) {
      if (!privRooms[roomNames[i]]) {
        container.push({
          roomName: roomNames[i],
          numPeople: roomObj[roomNames[i]].length,
          instruments: roomObj[roomNames[i]].map(peer => peer.instrument),
        });
      }
    }
    return container;
  }
});

/* Routes */
app.get('/logout', (req, res) => {
  console.log('mysession', req.session);
  if (req.session.userName) {
    delete req.session.userName;
  }
  req.logout();
  console.log('mysession after logout', req.session);
  res.sendStatus(200);
});

app.get("/makeInstrument",(req,res)=>{
  let passport=req.session.passport?req.session.passport.user:req.session.passport;
  if (passport===undefined && req.session.userName===undefined) {
    res.redirect("/login");
  } else {
    res.end();
  }
});


app.post('/login', (req, res) => {
  console.log('req.body.pass', req.body.pass);
  users.findAll({
    where: {
      userName: req.body.user,
    }
  }).then(person => {
    if (person[0]===undefined) {
      console.log('BadLogin');
      res.status(401).send("");
    } else {
      console.log(person[0], 'Person[0]!!!');
      const hash = bcrypt.hashSync(req.body.pass, person[0].dataValues.salt);

      users.findAll({
        where: {
          userName: req.body.user,
          password: hash
        }
      }).then(user => {
        if (user.length > 0) {
          instruments.findAll({
            where: {
              userName: req.body.user
            }
          }).then(
            userInstruments => (
               userInstruments.map(a => a.dataValues)
            )).then(userInstrumentsList => {
              console.log("succ logged in", userInstrumentsList);
              req.session.userName = req.body.user;
              res.send(userInstrumentsList);
            });
        } else {
          console.log('BadLogin');
          res.status(401).send("");
        }
      });
    }
  });
});

app.post('/signup', (req, res) => {
  users.findAll({
    where: {
      userName: req.body.user
    }
  }).then(user => {
    if (user.length > 0) {
      console.log('this is req.sesion', req.session);
      res.send('UserAlreadyExists');
    } else {
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(req.body.pass, salt);
      users.create({
        userName: req.body.user,
        password: hash,
        salt,
      }).then(entry => {
        console.log(entry.dataValues, ' got entered');
        req.session.userName = req.body.user;
        res.status(200).send('SuccessSignup');
      });
    }
  });
});

app.get('/auth/facebook', passport.authenticate('facebook'));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', {
    successReturnToOrRedirect: '/',
    failureRedirect: '/login'
  })
);

app.get("/getUserInfo", (req, res) => {
  const person=req.session.userName||req.session.passport;
  console.log("person:",person,"req.session:", req.session);
let passport=req.session.passport!==undefined?req.session.passport.user:req.session.passport;
  if (passport) {
    users.findOne({ where: { id: person.user } }).then(fbUser => {
      console.log('tryingtoFind', fbUser);
      const fbUserName= fbUser.dataValues.userName;
      instruments.findAll({ where: { userName: fbUserName } }).then(
        userInstruments => (
           userInstruments.map(a => a.dataValues)
        )).then(userInstrumentsList => {
          //console.log(person, userInstrumentsList, 'userInsts');
          res.status(200).send([person, userInstrumentsList]);
        });
    });
  } else {
    instruments.findAll({ where: { userName: person } }).then(
        userInstruments => (
           userInstruments.map(a => a.dataValues)
        )).then(userInstrumentsList => {
          //console.log(person, userInstrumentsList, 'userInsts');
          res.status(200).send([person, userInstrumentsList]);
        });
  }
});

app.get('/isLoggedIn', (req,res)=> {
console.log(req.session, "REQ.SESSION!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
let passport=req.session.passport?req.session.passport.user:req.session.passport;
  if (passport===undefined && req.session.userName===undefined) {
    console.log('*********************** this person should not be able to acces UMI');
    res.send(null);
  } else {
    console.log('*********************** this person should be able to acces UMI');
    res.send("continue");
  }
})

app.get("/fbLoggedIn", (req, res) => {
  console.log("****************************** req.session.passport FROM fbLoggedIn");
  if (req.session.passport) {
    console.log('rsp', req.session.passport);
    users.findOne({
      where: {
        id: req.session.passport.user
      }
    }).then(
      people => {
        const person = people.dataValues.userName;
        instruments.findAll({
          where: {
            userName: person
          }
        }).then(
          userInstruments => (
            userInstruments.map(a => a.dataValues)
          )).then(userInstrumentsList => {
            res.status(200).send([person, userInstrumentsList]);
          });
      });
  } else {
    res.send("false");
  }
});

app.post('/makeprivateroom', (req, res) => {
  if (!req.session.userName && !req.session.passport) {
    res.send('you must be logged in');
    console.log('User must be logged in to make private room');
  } else {
    console.log('making private rooms');
    users.findOne({
      where: {
        userName: req.session.userName,
      }
    })
    .then((user) => {
      // if query came back empty handed then user must be logged in via facebook, and their id in schema is stored in passport
      const userId = user ? user.id : req.session.passport.user;
      return PrivateRooms.create({
        url: req.body.roomName,
        userId,
      });
    })
    .then(() => {
      res.sendStatus(200);
    });
  }
});

app.get('/getprivaterooms', (req, res) => {
  // is it not a facebook user?
  users.findOne({
    where: {
      userName: req.session.userName,
    }
  })
  .then(user => {
    // if query came back empty handed then user must be logged in via facebook, and their id in schema is stored in passport
    const userId = user ? user.id : req.session.passport.user;
    return PrivateRooms.findAll({
      where: {
        userId,
      }
    });
  })
  .then(privateRooms => {
    // get url
    res.send(privateRooms.map(room => room.url));
  });
});
//
app.get('*', (req, res) => {
  console.log('req.session', req.session);
  const pathToIndex = path.join(pathToStaticDir, 'index.html');
  res.status(200).sendFile(pathToIndex);
});

/* Kick off server */
const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log('Listening on port', port);
});
