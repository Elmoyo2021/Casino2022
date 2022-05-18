var express = require('express');
const backendReportController = require("../Controller/backendPageController")
const { check, validationResult } = require('express-validator')
var router = express.Router();
const { query } = require('../async-db')

router.get('/betHistory', backendReportController.betHistory);//下注紀錄
 
module.exports = router;
