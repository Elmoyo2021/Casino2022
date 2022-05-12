var express = require('express');
const backendAgencyController = require("../Controller/backendAgencyController")
const { check, validationResult } = require('express-validator')
var router = express.Router();
const { query } = require('../async-db')

router.get('/agencyList', backendAgencyController.agencyList);//代理團隊
router.post('/agencyList_add', backendAgencyController.agencyListAdd);//代理團隊
router.post('/agencyListMember_add', backendAgencyController.agencyListMemberAdd);//代理團隊

router.post('/agencyList_update', backendAgencyController.agencyListUpdate);//代理團隊
router.post('/agencyList_updatePoint', backendAgencyController.agencyListUpdatePoint);//代理團隊
router.post('/agencyList_updateStatus', backendAgencyController.agencyListUpdateStatus);//代理團隊
router.post('/agencyList_updateStatus', backendAgencyController.agencyListUpdateStatus);//代理團隊


router.get('/agencyPoingLog', backendAgencyController.agencyPoingLog);//團隊點數交易紀錄
router.get('/agencyApplyList', backendAgencyController.agencyApplyList);//團隊申請列表


/*
router.post('/members_add', [//會員列表 新增
    check('account', '帳號必須填寫')
        .isLength({ min: 1 }),
    check('pwd', '密碼必須填寫')
        .isLength({ min: 1 }),
    check('name', '姓名必須填寫')
        .isLength({ min: 1 }),
    check('currency', '幣別必須填寫')
        .isLength({ min: 1 }),
], backendFinanceController.postAdd);*/
module.exports = router;
