const express = require('express');
const bodyParser = require('body-parser');
const {sequelize} = require('./model')
const app = express();
app.use(bodyParser.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)

const contractsController = require('./contracts/contracts.controller');
app.use('/contracts', contractsController);

const jobsController = require('./jobs/jobs.controller');
app.use('/jobs', jobsController);

const balancesController = require('./balances/balances.controller');
app.use('/balances', balancesController);

const adminController = require('./admin/admin.controller');
app.use('/admin', adminController);

module.exports = app;
