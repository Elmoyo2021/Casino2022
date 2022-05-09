var express = require('express');
const backendReportController = require("../Controller/backendReportController")
const { check, validationResult } = require('express-validator')
var router = express.Router();
const { query } = require('../async-db')

router.get('/betHistory', backendReportController.betHistory);//黑白名單列表

module.exports = router;
