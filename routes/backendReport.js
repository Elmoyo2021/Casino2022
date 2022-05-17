var express = require('express');
const backendReportController = require("../Controller/backendReportController")
const { check, validationResult } = require('express-validator')
var router = express.Router();
const { query } = require('../async-db')

router.get('/betHistory', backendReportController.betHistory);//下注紀錄
router.get('/memberReport', backendReportController.memberReport);//會員報表
router.get('/profitReport', backendReportController.profitReport);//損益報表
 
module.exports = router;
