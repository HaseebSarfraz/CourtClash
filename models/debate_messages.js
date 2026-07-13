const { DataTypes } = require("sequelize");
const { sequelize } = require("../datasource");

const Message = sequelize.define("DebateMessage", {
  caseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

function linkMessageModels({ Case, User }) {
  Message.belongsTo(Case, { foreignKey: "caseId", as: "case" });
  Message.belongsTo(User, { foreignKey: "userId", as: "user" });
}

module.exports = { Message, linkMessageModels };
