const { DataTypes } = require("sequelize");
const { sequelize } = require('../datasource');

const User = sequelize.define("User", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  stripeCustomerId: {
    type: DataTypes.STRING,
    unique: true,
  },
  stripeSubscriptionId: {
    type: DataTypes.STRING,
    unique: true,
  },
  subscriptionStatus: DataTypes.STRING, // "active", "past_due", "canceled", "incomplete", etc.
  subscriptionPlan: DataTypes.STRING,   // "basic" or "premium"
  currentPeriodEnd: DataTypes.DATE,
});

module.exports = { User };