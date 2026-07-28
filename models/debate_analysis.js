const { DataTypes } = require("sequelize");
const { sequelize } = require("../datasource");

const DebateAnalysis = sequelize.define("DebateAnalysis", {
  caseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  analysis: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {
      version: 1,
      lastProcessedTurn: 0,
      playerA: {
        arguments: [],
      },
      playerB: {
        arguments: [],
      },
    },
  },
  lastProcessedMessageId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "idle",
  },
});

function linkDebateAnalysisModels({ Case }) {
  DebateAnalysis.belongsTo(Case, {foreignKey: "caseId", as: "case"});
}

module.exports = { DebateAnalysis, linkDebateAnalysisModels };