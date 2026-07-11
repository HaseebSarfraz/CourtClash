const { DataTypes } = require("sequelize");
const { sequelize } = require("../datasource");

const User = sequelize.define("User", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  subscriptionStatus: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});


module.exports = { User };