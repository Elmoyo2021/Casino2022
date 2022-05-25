var express = require('express');
const backendRiskController = require("../Controller/backendRiskController")
const { check, validationResult } = require('express-validator')
var router = express.Router();
const { query } = require('../async-db')

router.get('/whiteList', backendRiskController.whiteList);//黑白名單列表
router.post('/whiteListAdd', backendRiskController.whiteListAdd);//黑白名單列表 新增
router.post('/whiteListUpdate', backendRiskController.whiteListUpdate);//黑白名單列表 修改
router.post('/whiteListDel', backendRiskController.whiteListDel);//黑白名單列表 刪除

module.exports = router;
