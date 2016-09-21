const Sequelize = require('./connection').Sequelize;
const sequelize = require('./connection').sequelize;

const users = sequelize.define('user', {
  userName: {
    type: Sequelize.STRING
  },
  password: {
    type: Sequelize.STRING
  },
  facebookId: {
    type: Sequelize.STRING
  },
  token: {
    type: Sequelize.STRING
  },
  salt: {
    type: Sequelize.STRING
  }
}, {
  tableName: 'users',
  timestamps: false,
});

sequelize
  .sync({ force: false })
  .then(() => {
    console.log('It worked!');
  }, err => {
    console.log('An error occurred while creating the table:', err);
  });


const PrivateRooms = sequelize.define('privaterooms', {
  url: {
    type: Sequelize.STRING
  },
}, {
  tableName: 'privaterooms',
});

PrivateRooms.belongsTo(users);
users.hasMany(PrivateRooms);

sequelize
  .sync({ force: false })
  .then(() => {
    console.log('It worked!');
  }, err => {
    console.log('An error occurred while creating the table:', err);
  });


const instruments = sequelize.define('instruments', {
  userName: {
    type: Sequelize.STRING
  },
  instrumentName: {
    type: Sequelize.STRING
  },
  A: {
    type: Sequelize.STRING
  },
  S: {
    type: Sequelize.STRING
  },
  D: {
    type: Sequelize.STRING
  },
  F: {
    type: Sequelize.STRING
  },
  G: {
    type: Sequelize.STRING
  },
  H: {
    type: Sequelize.STRING
  },
  J: {
    type: Sequelize.STRING
  },
  K: {
    type: Sequelize.STRING
  },
  L: {
    type: Sequelize.STRING
  }

}, {
  tableName: 'instruments',
  timestamps: false,
});

sequelize
  .authenticate()
  .then(err => {
    console.log('sqlz Connection has been established successfully.');
  })
  .catch(err => {
    console.log('sqlz Unable to connect to the database:', err);
  });

sequelize
  .sync({ force: false })
  .then(err => {
    console.log('It worked!');
  }, err => {
    console.log('An error occurred while creating the table:', err);
  });

module.exports = {
  users,
  PrivateRooms,
  instruments,
};
