var express = require('express');
const MembersController = require("../Controller/MembersController")
const { check, validationResult } = require('express-validator')
var router = express.Router();

const { query } = require('../async-db')

router.post('/login', MembersController.login);//會員登入
router.post('/deposit', MembersController.deposit);//充值申請
router.post('/withdraw', MembersController.withdraw);//提款申請
router.post('/agencyApply', MembersController.agencyApply);//代理申請
router.get('/aisleList',MembersController.aisleList)//支付通道列表
router.post('/bindCard', [//標籤列表 新增
    check('name', '卡號名稱必須填寫')
        .isLength({ min: 1 }),
    check('bank', '銀行名稱必須填寫')
        .isLength({ min: 1 }),
    check('branch', '支行名稱必須填寫')
        .isLength({ min: 1 }),
    check('account', '銀行帳號必須填寫')
        .isLength({ min: 1 }),
    check('country', '開戶省分必須填寫')
        .isLength({ min: 1 }),
    check('city', '開戶城市必須填寫')
        .isLength({ min: 1 }),
    check('phone', '銀行預留手機號碼必須填寫')
        .isLength({ min: 1 })
], MembersController.bindCard);//銀行卡榜定

module.exports = router;
