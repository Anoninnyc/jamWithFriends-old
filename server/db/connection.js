const Sequelize = require('sequelize');
require('dotenv').config();

const db_host = 'ec2-50-17-227-146.compute-1.amazonaws.com';
const db_user = 'nyequiyuwwajvb';
const db_password = 'IjaYhRDw_jDRmKZyKDqvu4cp-q';
const db_name = 'd4enm3kji12t97';

const sequelize = new Sequelize(db_name, db_user, db_password, {
  host: db_host,
  dialect: 'postgres' /*'mysql'*/
});

module.exports = {
  sequelize,
  Sequelize
};
