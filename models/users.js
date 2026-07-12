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

function associateUserModels({ Case, DebateMessage }) {
  User.hasMany(Case, { foreignKey: "userOneId", as: "casesAsUserOne" });
  User.hasMany(Case, { foreignKey: "userTwoId", as: "casesAsUserTwo" });
  User.hasMany(Case, { foreignKey: "winnerUserId", as: "wonCases" });
  User.hasMany(DebateMessage, { foreignKey: "userId", as: "debateMessages" });
}

module.exports = { User, associateUserModels };
