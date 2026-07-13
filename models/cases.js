const { DataTypes } = require("sequelize");
const { sequelize } = require("../datasource");

const Case = sequelize.define("Case", {
  topic: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  roomCode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  userOneId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  userTwoId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  userOneSide: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  userTwoSide: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "waiting",
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

function linkCaseStuff({ User, Message }) {
  Case.belongsTo(User, { foreignKey: "userOneId", as: "userOne" });
  Case.belongsTo(User, { foreignKey: "userTwoId", as: "userTwo" });
  Case.belongsTo(User, { foreignKey: "winnerUserId", as: "winner" });
  Case.hasMany(Message, { foreignKey: "caseId", as: "messages" });
}

module.exports = { Case, linkCaseStuff };
