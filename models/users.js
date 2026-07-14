const { DataTypes } = require("sequelize");
const { sequelize } = require("../datasource");

const User = sequelize.define("User", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, 
  },
  stripeCustomerId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  stripeSubscriptionId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  subscriptionStatus: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  subscriptionPlan: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  currentPeriodEnd: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

function linkUserModels({ Case, Message }) {
  User.hasMany(Case, { foreignKey: "userOneId", as: "casesAsUserOne" });
  User.hasMany(Case, { foreignKey: "userTwoId", as: "casesAsUserTwo" });
  User.hasMany(Case, { foreignKey: "winnerUserId", as: "wonCases" });
  User.hasMany(Message, { foreignKey: "userId", as: "debateMessages" });
}

module.exports = { User, linkUserModels };
