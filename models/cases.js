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
    type: DataTypes.UUID,
    allowNull: false,
  },
  userTwoId: {
    type: DataTypes.UUID,
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
    type: DataTypes.UUID,
    allowNull: true,
  },
  verdictSummary: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  userOneScore: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  userTwoScore: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  ruling: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

function linkCaseModels({ User, Message, DebateAnalysis}) {
  Case.belongsTo(User, { foreignKey: "userOneId", as: "userOne" });
  Case.belongsTo(User, { foreignKey: "userTwoId", as: "userTwo" });
  Case.belongsTo(User, { foreignKey: "winnerUserId", as: "winner" });
  Case.hasMany(Message, { foreignKey: "caseId", as: "messages" });
  Case.hasOne(DebateAnalysis, { foreignKey: "caseId", as: "debateAnalysis"});
}

module.exports = { Case, linkCaseModels };
