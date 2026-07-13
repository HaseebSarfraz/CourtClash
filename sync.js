const { sequelize } = require("./datasource");
const { User, linkUserModels } = require("./models/users");
const { Case, linkCaseModels } = require("./models/cases");
const { Message, linkMessageModels } = require("./models/debate_messages");

const models = { User, Case, Message };
linkUserModels(models);
linkCaseModels(models);
linkMessageModels(models);

sequelize.sync({ alter: true }).then(() => {
  console.log("Database synced");
});
