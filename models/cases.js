const { DataTypes } = require("sequelize");
const { sequelize } = require("../datasource");

const Case = sequelize.define("Case", {
  topic: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userOneId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  userTwoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  winnerUserId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  verdictSummary: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});


module.exports = { Case };