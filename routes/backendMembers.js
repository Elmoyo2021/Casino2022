var express = require('express');
const backendMembersController = require("../Controller/backendMembersController")
const { check, validationResult } = require('express-validator')
var router = express.Router();

const { query } = require('../async-db')


const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.filename + '-' + Date.now())
    }
})
const upload = multer({ storage: storage })


router.get('/memberTest', backendMembersController.memberTest);//會員列表查詢
router.get('/members', backendMembersController.membersList);//會員列表查詢
router.get('/members_data', backendMembersController.membersData);//會員列表查詢
router.get('/members_state', backendMembersController.membersSate);//會員在線狀態

router.get('/members_deposit', backendMembersController.membersDeposit);//會員總存款列表查詢
router.get('/members_withdraw', backendMembersController.membersWithdraw);//會員總取款列表查詢
router.get('/members_teacherList', backendMembersController.teacherList);//會員總取款列表查詢


router.get('/members_walletList', backendMembersController.walletList);//會員錢包資料名單

router.get('/members_vipList', backendMembersController.members_vipList);//會員總取款列表查詢

router.post('/members_pwdReset', [//會員資料 重置密碼上傳
    check('member_id', '會員ID尚未填寫')
        .isLength({ min: 1 }),
    check('pwd')
        .isLength({ min: 6, max: 12 }).withMessage('密碼必須大於8碼並且小於12碼')
        .matches(/^[A-Za-z0-9]+$/).withMessage('密碼只能為半形並含有大小寫英文字母與數字')
        ,
], backendMembersController.membersPwdReset);

router.post('/members_pic1', upload.single('img'), [//會員資料 pic1上傳
    check('member_id', '會員ID尚未填寫')
        .isLength({ min: 1 }),
], backendMembersController.membersPic1);
router.post('/members_pic2', upload.single('img'), [//會員資料 pic2上傳
    check('member_id', '會員ID尚未填寫')
        .isLength({ min: 1 }),
], backendMembersController.membersPic2);

router.post('/members_stateDel', [//會員在線狀態 剔除
    check('member_id', '會員id異常')
        .isLength({ min: 1 }),
], backendMembersController.membersSateDel);

router.post('/members_add', [//會員列表 新增
    check('account', '會員帳號異常')
        .isLength({ min: 1 }),
    check('pwd', '密碼必須填寫')
        .isLength({ min: 1 }),
    check('name', '姓名必須填寫')
        .isLength({ min: 1 }),
    check('currency', '幣別必須填寫')
        .isLength({ min: 1 }),
], backendMembersController.memberAdd);


router.get('/membersBankCard', backendMembersController.membersBankCardList);//會員銀行卡列表查詢
router.post('/membersBankCard_add', [//會員列表 銀行卡新增
    check('member_id', '會員帳號異常')
        .isLength({ min: 1 }),
    check('name', '卡號名稱必須填寫')
        .isLength({ min: 1 }),
    check('branch', '分行名稱必須填寫')
        .isLength({ min: 1 }),
    check('account', '銀行帳號必須填寫')
        .isLength({ min: 1 }),
    check('open_province', '開戶省分必須填寫')
        .isLength({ min: 1 }),
    check('open_city', '開戶城市必須填寫')
        .isLength({ min: 1 }),
    check('phone', '銀行預留手機號碼必須填寫')
        .isLength({ min: 1 }),
    check('activationid', '銀行開戶證件號必須填寫')
        .isLength({ min: 1 }),
    check('account', '銀行帳號必須填寫')
        .isLength({ min: 1 }),
], backendMembersController.membersBankCardAdd);
router.post('/membersBankCard_Del', [//會員列表 銀行卡新增
    check('id', '銀行卡id必須填寫')
        .isLength({ min: 1 })
], backendMembersController.membersBankCardDel);

router.post('/members_update', [//會員列表 編輯
    check('id', '會員id必須填寫')
        .isLength({ min: 1 }),
    check('name', '姓名必須填寫')
        .isLength({ min: 1 })
], backendMembersController.memberUpdate);

router.post('/members_layer', [//會員列表 老待新上線 編輯
    check('member_id', '會員id必須填寫')
        .isLength({ min: 1 })
], backendMembersController.membersLayer);
router.post('/members_layeStart', [//會員列表 老帶新 激活
    check('member_id', '會員id必須填寫')
        .isLength({ min: 1 })
], backendMembersController.membersLayerStart);

router.get('/members_Remark', [//會員列表 備註新增
    check('member_id', '會員id不得為空')
        .isLength({ min: 1 })], backendMembersController.remarkList);//會員列表查詢
router.post('/members_RemarkAdd', [//會員列表 備註新增
    check('remark', '備註必須填寫')
        .isLength({ min: 1 }),
    check('member_id', '會員id必須填寫')
        .isLength({ min: 1 })
], backendMembersController.remarkAdd);
router.post('/members_RemarkDel', [//會員列表 備註刪除
    check('id', '備註id必須填寫')
        .isLength({ min: 1 })
], backendMembersController.remarkDel);

router.get('/group_list', backendMembersController.groupList);//會員列表查詢


router.get('/group_log', backendMembersController.group_log);//組別層級調整紀錄LOG
router.get('/groupDetail_list', backendMembersController.groupDetailList);//會員列表查詢
router.post('/group_add', [//組列表 新增
    check('group_name', '組名稱必須填寫')
        .isLength({ min: 1 }),
    check('currency', '幣別必須填寫')
        .isLength({ min: 1 }),
    check('status', '狀態必須填寫')
        .isLength({ min: 1 }),
    check('auto_rank', '自動配置層級必須填寫')
        .isLength({ min: 1 }),
], backendMembersController.groupAdd);
router.post('/group_update', [//組列表 編輯
    check('group_name', '組名稱必須填寫')
        .isLength({ min: 1 }),
    check('currency', '幣別必須填寫')
        .isLength({ min: 1 }),
    check('status', '狀態必須填寫')
        .isLength({ min: 1 }),
    check('auto_rank', '自動配置層級必須填寫')
        .isLength({ min: 1 }),
], backendMembersController.groupUpdate);

router.post('/group_adjust', [//調整層級
    check('account', '會員帳號必須填寫')
        .isLength({ min: 1 }),
    check('group_id', '層級id必須填寫')
        .isLength({ min: 1 }),
    check('currency', '幣別必須填寫')
        .isLength({ min: 1 }),
], backendMembersController.group_adjust);
router.post('/group_adjust_plural', [//調整層級_多筆
    check('account', '會員帳號必須填寫')
        .isLength({ min: 1 }),
    check('group_id', '層級id必須填寫')
        .isLength({ min: 1 }),
    check('currency', '幣別必須填寫')
        .isLength({ min: 1 }),
], backendMembersController.group_adjust_plural);

router.get('/groupDetail_info', backendMembersController.groupDetail_info);
router.post('/groupDetail_add', [//層級列表 新增
    check('name', '層級名稱必須填寫')
        .isLength({ min: 1 }),
    check('name_show', '會員層級顯示必須填寫')
        .isLength({ min: 1 }),
    check('upgrade_deposit', '升級條件(存款總額)必須填寫')
        .isLength({ min: 1 }),
    check('upgrade_bet', '升級條件(有效投注額)必須填寫')
        .isLength({ min: 1 }),
    check('reserve_deposit', '保級條件(存款總額)必須填寫')
        .isLength({ min: 1 }),
    check('reserve_bet', '保級條件(有效投注額)必須填寫')
        .isLength({ min: 1 }),
    check('deposit_min', '單筆存款最低必須填寫')
        .isLength({ min: 1 }),
    check('deposit_max', '單筆存款最高必須填寫')
        .isLength({ min: 1 }),
    check('withdraw_max', '單筆取款最低必須填寫')
        .isLength({ min: 1 }),
    check('withdraw_min', '單筆取款最高必須填寫')
        .isLength({ min: 1 }),
    check('withdraw_max_day', '單日取款最高總額必須填寫')
        .isLength({ min: 1 }),
    check('withdraw_remind', '提款次數提醒必須填寫')
        .isLength({ min: 1 }),
    check('withdraw_remind_day', '單日最高提款次數必須填寫')
        .isLength({ min: 1 }),
], backendMembersController.groupDetailAdd);

router.post('/groupDetail_update', [//層級列表 編輯
    check('name', '層級名稱必須填寫')
        .isLength({ min: 1 }),
    check('name_show', '會員層級顯示必須填寫')
        .isLength({ min: 1 }),
    check('upgrade_deposit', '升級條件(存款總額)必須填寫')
        .isLength({ min: 1 }),
    check('upgrade_bet', '升級條件(有效投注額)必須填寫')
        .isLength({ min: 1 }),
    check('reserve_deposit', '保級條件(存款總額)必須填寫')
        .isLength({ min: 1 }),
    check('reserve_bet', '保級條件(有效投注額)必須填寫')
        .isLength({ min: 1 }),
    check('deposit_min', '單筆存款最低必須填寫')
        .isLength({ min: 1 }),
    check('deposit_max', '單筆存款最高必須填寫')
        .isLength({ min: 1 }),
    check('withdraw_max', '單筆取款最低必須填寫')
        .isLength({ min: 1 }),
    check('withdraw_min', '單筆取款最高必須填寫')
        .isLength({ min: 1 }),
    check('withdraw_max_day', '單日取款最高總額必須填寫')
        .isLength({ min: 1 }),
    check('withdraw_remind', '提款次數提醒必須填寫')
        .isLength({ min: 1 }),
    check('withdraw_remind_day', '單日最高提款次數必須填寫')
        .isLength({ min: 1 }),
], backendMembersController.groupDetailUpdates);

router.post('/members_status', [//會員列表查詢
    check('id', '會員id必需填寫')
        .isLength({ min: 1 }),
    check('status', '更改狀態必需填寫')
        .isLength({ min: 1 })
], backendMembersController.pathMemberStatus);
router.post('/members_tags', [//會員標籤編輯
    check('id', '會員id不得為空')
        .isLength({ min: 1 }),
    check('tags', '標籤必須填寫')
        .isLength({ min: 1 })
], backendMembersController.pathMemberTags);
router.post('/members_team', [//會員代理團隊編輯
    check('member_id', 'Members ID不得為空')
        .isLength({ min: 1 }),
    check('agency_team_id', '代理團隊必須填寫')
        .isLength({ min: 1 })
], backendMembersController.pathMemberTeam);

router.get('/agencyTeam',backendMembersController.teamList);
router.post('/members_vip', [//會員VIP編輯
    check('member_id', '會員id不得為空')
        .isLength({ min: 1 }),
    check('vip_id', 'Vid_id必須填寫')
        .isLength({ min: 1 })
], backendMembersController.pathMemberVip);

router.get('/new_members', backendMembersController.membersNew);//新註冊玩家
router.get('/new_membersList', backendMembersController.membersNewList);//新註冊玩家

router.get('/login_Log', backendMembersController.loginLog);//登入失敗名單


router.get('/tags', backendMembersController.tagsList);//標籤列表 查詢
router.post('/tags_add', [//標籤列表 新增
    check('title', '標籤必須填寫')
        .isLength({ min: 1 }),
    check('content', '描述必須填寫')
        .isLength({ min: 1 }),
    check('domain', '域名綁定必須填寫')
        .isLength({ min: 1 })
], backendMembersController.tagsAdd);


router.post('/tags_update', [//標籤列表 修改
    check('id', '修改標籤id必須填寫')
        .isLength({ min: 1 }),
    check('title', '標籤必須填寫')
        .isLength({ min: 1 }),
    check('content', '描述必須填寫')
        .isLength({ min: 1 }),
    check('domain', '域名綁定必須填寫')
        .isLength({ min: 1 })
], backendMembersController.tagsUpdate);
module.exports = router;
