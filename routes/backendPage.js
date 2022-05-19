var express = require('express');
const backendReportController = require("../Controller/backendPageController")
const { check, validationResult } = require('express-validator')
var router = express.Router();
const { query } = require('../async-db')

router.get('/topDeposit', backendReportController.topDeposit);//10大存款
router.get('/topDepositToday', backendReportController.topDepositToday);//近7日取款款
router.get('/recentWithdrawal', backendReportController.recentWithdrawal);//近7日取款款
router.get('/recentRegister', backendReportController.recentRegister);//近7日取款款

module.exports = router;
