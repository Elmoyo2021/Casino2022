var express = require('express');
const backendRiskController = require("../Controller/backendManagementController")
const { check, validationResult } = require('express-validator')
var router = express.Router();
const { query } = require('../async-db')

router.get('/managementList', backendRiskController.managementList);//管理者列表
router.get('/managementData', [//管理者信息 修改
    check('management_id', '管理者id必須填寫')
        .isLength({ min: 1 })
], backendRiskController.managementData);//管理者列表

module.exports = router;
