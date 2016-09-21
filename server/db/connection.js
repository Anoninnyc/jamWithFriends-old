const Sequelize = require('sequelize');
require('dotenv').config();

const db_host = process.env.db_host;
const db_user = process.env.db_user;
const db_password = process.env.db_password;
const db_name = process.env.db_name;

const sequelize = new Sequelize(db_name, db_user, db_password, {
  host: db_host,
  dialect: 'mysql'
});

module.exports = {
  sequelize,
  Sequelize
};
