var express = require('express');
const backendRebateController = require("../Controller/backendRebateController")
const { check, validationResult } = require('express-validator')
var router = express.Router();
const { query } = require('../async-db')

router.get('/rebateSet', backendRebateController.rebateSet);//反水設置


module.exports = router;
