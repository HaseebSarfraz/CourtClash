// sync.js
const { sequelize } = require('./datasource');
require('./models/users');

sequelize.sync({ alter: true }).then(() => {
  console.log('Database synced');
});

