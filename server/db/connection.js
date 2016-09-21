const Sequelize = require('sequelize');
require('dotenv').config();

const db_host = 'localhost';
const db_user = 'root';
const db_password = '12345';
const db_name = 'tbd';

const sequelize = new Sequelize(db_name, db_user, db_password, {
  host: db_host,
  dialect: 'mysql'
});

module.exports = {
  sequelize,
  Sequelize
};
