const { DataTypes } = require("sequelize");
const { sequelize } = require("../datasource");

const DebateMessage = sequelize.define("DebateMessage", {
  caseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

function associateDebateMessageModels({ Case, User }) {
  DebateMessage.belongsTo(Case, { foreignKey: "caseId", as: "case" });
  DebateMessage.belongsTo(User, { foreignKey: "userId", as: "user" });
}

module.exports = { DebateMessage, associateDebateMessageModels };
