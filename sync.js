const { sequelize } = require("./datasource");
const { User, linkUserModels } = require("./models/users");
const { Case, linkCaseModels } = require("./models/cases");
const { Message, linkMessageModels } = require("./models/debate_messages");
const {DebateAnalysis, linkDebateAnalysisModels} = require("./models/debate_analysis");

const models = { User, Case, Message, DebateAnalysis};
linkUserModels(models);
linkCaseModels(models);
linkMessageModels(models);
linkDebateAnalysisModels(models);

sequelize.sync().then(() => {
  console.log("Database synced");
});
