const SimplePeer = require('simple-peer');
const EventEmitter = require('events').EventEmitter;
const io = require('socket.io-client');

// peer connections options
const options = {
  trickle: true,
  config: {
    iceServers: [
      { url: "stun:stun.l.google.com:19302" },
      { url: "stun:stun1.l.google.com:19302" },
      { url: "stun:stun2.l.google.com:19302" },
      { url: "stun:stun3.l.google.com:19302" },
      { url: "stun:stun4.l.google.com:19302" },
    ]
  }
};

export default function (room) {
  const socket = io();
  const peers = {};
  const emitter = new EventEmitter();

  let selfId;
  socket.emit('join', room);

  // socket joined a room, start making connections
  socket.on('joined', data => {
    const sockets = JSON.parse(data);
    selfId = sockets.pop().peerId;
    // if first one in room, done
    if (sockets.length === 0) {
      console.log("first in room");
      emitter.emit('connected');
    } else {
      console.log("not first in room");
      startConnection(sockets, 0);
    }
  });

  // new socket joined, receive the connection
  socket.on('new peer', () => {
    console.log("recieve connection");
    receiveConnection();
  });

  // another client is leaving, remove this connection from peers
  socket.on('remove connection', id => {
    delete peers[id];
  });

  return {
    // called when peer connections are established
    onReady: cb => {
      emitter.on('connected', cb);
    },

    // sends a message through data channel
    send: message => {
      each(peers, peer => { peer.send(message); });
    },

    // called when message is received through data channel
    onMessage: cb => {
      emitter.on('message', cb);
    },

    // called when this client is leaving, destroy and remove all connections
    close: () => {
      socket.emit('exit room', { roomId: room, id: selfId });
      each(peers, (peer, key) => {
        peer.destroy();
        delete peers[key];
      });
    },

    id: () => selfId
  };
  /* ------------ Helper functions ------------ */

  function startConnection(sockets, number) {
    console.log("running startConnection function");
    const peer = new SimplePeer(Object.assign(options, { initiator: true }));
    const remote = sockets[number].peerId;
    peer.on('signal', data => {
      socket.emit('offer', { offer: data, by: socket.id, to: remote });
    });

    socket.on('answer', data => {
      // bad fix for preventing signalling multiple times and with destroyed connections
      if (data.to === selfId && data.by === remote && !peer.connected && !peer.destroyed) {
        peer.signal(data.answer);
      }
    });

    peer.on('connect', () => {
      console.log('peer.on(connect');
      peers[remote] = peer;
      if (number < sockets.length - 1) {
        startConnection(sockets, ++number, selfId);
      } else {
        emitter.emit('connected');
      }
    });
     peer.on('connection', () => {
      console.log('peer.on(connect');
      peers[remote] = peer;
      if (number < sockets.length - 1) {
        startConnection(sockets, ++number, selfId);
      } else {
        emitter.emit('connected');
      }
    });

    peer.on('data', message => {
      emitter.emit('message', message);
    });
  }

  function receiveConnection() {
    const peer = new SimplePeer(Object.assign(options, { initiator: false }));
    let remote;

    socket.on('offer', data => {
      // bad fix for preventing signalling multiple times and with destroyed connections
      if (data.to === selfId && !peer.connected && !peer.destroyed) {
        remote = data.by;
        peer.signal(data.offer);
      }
    });

    peer.on('signal', data => {
      socket.emit('answer', { answer: data, by: socket.id, to: remote });
    });

    peer.on('connect', () => {
      console.log('second peer on connect');
      peers[remote] = peer;
    });

    peer.on('data', message => {
      emitter.emit('message', message);
    });
  }
}

// each function for object
function each(obj, cb) {
  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++) {
    cb(obj[keys[i]], keys[i]);
  }
}
