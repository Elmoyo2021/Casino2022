const { query } = require('../async-db')
const { check, validationResult } = require('express-validator')
var geoip = require('geoip-lite');
var moment = require('moment'); // require

const MembersController = {
    login: async (req, res) => {//會員列表
        const data = {
            account: req.body.account,
            pwd: req.body.pwd,
        }
        const members = await SelectMembers(data)//查看是否登入成功
        var ip = req.ip//ip
        ip = ip.toString().replace('::ffff:', ''); //
        var geo = geoip.lookup(ip);//ip 分析
        var deviceAgent = req.headers["user-agent"].toLowerCase();
        var agentID = deviceAgent.match(/(iphone|ipod|ipad|android)/);
        var platform = ""
        if (agentID) {
            platforms = "Mobile"
        } else {
            platforms = "PC"
        }
        if (members.length <= 0) {
            const membersStatus = await SelectMembersStatus(data)//查看帳號狀態
            if (membersStatus.length > 0) {
                const dataLog = {
                    account: req.body.account,
                    name: membersStatus[0].name,
                    status: "停用",
                    country: geo.country,
                    ip: ip,
                    platform: platforms,
                    browser: req.headers['user-agent']
                }
                await Login_log(dataLog)
                return res.json({//回傳失敗訊息
                    code: 401,
                    msg: "登入失敗",
                    data: "帳號為停用狀態"
                });
            } else {
                const dataLog = {
                    account: req.body.account,
                    name: "",
                    status: "帳號密碼錯誤",
                    country: geo.country,
                    ip: ip,
                    platform: platforms,
                    browser: req.headers['user-agent']
                }
                await Login_log(dataLog)
                return res.json({//回傳失敗訊息
                    code: 401,
                    msg: "登入失敗",
                    data: "帳號密碼錯誤"
                });
            }
        } else {
            const membersStatus = await SelectMembersStatus(data)//查看帳號狀態
            const dataLog = {
                account: req.body.account,
                name: membersStatus[0].name,
                status: "登入成功",
                country: geo.country,
                ip: ip,
                platform: platforms,
                browser: req.headers['user-agent']
            }
            const dataLog2 = {
                member_id: membersStatus[0].id,
                status: "online",
                country: geo.country,
                ip: ip,
                platform: platforms,
                browser: req.headers['user-agent']
            }
            await Login_log(dataLog)
            await Login_success(dataLog2)
            req.session.member_id = membersStatus[0].id
            req.session.account = req.body.account
            return res.json({//回傳成功
                code: 200,
                msg: "登入成功",
                data: members
            });
        }

    },
    deposit: async (req, res) => {//充值
        const postscriptCodes=await postscriptCode(req.session.account)
        console.log("code=",postscriptCodes)
        const depositData = {
            member_id: req.session.member_id,//會員id
            deposit_type: req.body.deposit_type,//存款方式
            aisle: req.body.aisle,//支付通道
            bank_account_name: req.body.bank_account_name,//收款姓名
            bank_account: req.body.bank_account,//收款帳號
            bank: req.body.bank,//收款銀行 
            bank_branch: req.body.bank_branch,//收款分行
            amount: req.body.amount,//存款金額
            pay_amount: req.body.amount,//實際支付金額
            deposit_name: req.body.deposit_name,//存款姓名
            transfer_bank: req.body.transfer_bank,//轉出銀行
            remark: req.body.remark,//備註
            postscript: postscriptCodes[0].code,//附言
        }


        const depositAdd = await depositInsert(depositData)
        const depositRts = await depositRt(depositAdd.insertId)//回傳成功表
        return res.json({//回傳成功
            code: 200,
            msg: "提交存款申請成功",
            data: depositRts
        });


    },
    withdraw: async (req, res) => {//提款申請
        const memberData = {
            id: req.session.member_id,
            account: req.session.account
        }
        const checkCards = await checkCard(req.session.member_id)//寫入資料庫
        if (checkCards.length <= 0) {
            return res.json({//回傳失敗
                code: 200,
                msg: "提交提款申請失敗，請先綁定銀行卡"
            });
        }
        const memberDatas = await withdrawMembers(memberData)
        var ip = req.ip//ip
        ip = ip.toString().replace('::ffff:', ''); //
        const Data = {
            member_id: req.session.member_id,
            member_account: req.session.account,
            bank: memberDatas[0].bank,
            amount: req.body.amount,
            ip: ip
        }
        const withdrawAdd = await withdrawInsert(Data)//寫入資料庫
        const withdrawRts = await withdrawRt(withdrawAdd.insertId)//回傳成功表
        return res.json({//回傳成功
            code: 200,
            msg: "提交提款申請成功",
            data: withdrawRts
        });
    },
    bindCard: async (req, res) => {//銀行卡綁定
        const errors = validationResult(req)
        if (!errors.isEmpty()) {//是否有正確填寫欄位值
            const error_msg = errorMessage(errors)//取得錯誤訊息
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "新增失敗",
                data: error_msg
            });
        }
        const checkCards = await checkCard(req.session.member_id)//寫入資料庫
        if (checkCards.length > 0 || req.session.member_id == "") {
            if (req.session.member_id == "") {
                return res.json({//回傳成功
                    code: 200,
                    msg: "請先登入會員",
                });
            } else {
                return res.json({//回傳成功
                    code: 200,
                    msg: "銀行卡綁定失敗，此會員以綁定過銀行卡",
                });
            }
        } else {
            const bindData = {
                member_id: req.session.member_id,
                name: req.body.name,
                bank: req.body.bank,
                branch: req.body.branch,
                account: req.body.account,
                country: req.body.country,
                city: req.body.city,
                phone: req.body.phone,
                id_number: req.body.id_number
            }
            const bindCardAdd = await bindCardInsert(bindData)//寫入資料庫
            const bindCardRts = await bindCardRt(bindCardAdd.insertId)//回傳成功表
            return res.json({//回傳成功
                code: 200,
                msg: "銀行卡綁定成功",
                data: bindCardRts
            });
        }
    },
    aisleList: async (req, res) => {//支付通道列表
        const errors = validationResult(req)
        if (!errors.isEmpty()) {//是否有正確填寫欄位值
            const error_msg = errorMessage(errors)//取得錯誤訊息
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "失敗",
                data: error_msg
            });
        }
        const hierarchyData = await selectMembers(req.session.member_id)
        const deposit_type = await changeToType(req.query.deposit_type)
        if (deposit_type == "ERROR") {
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "失敗存款方式有誤"
            });
        }
        const searchData = {
            hierarchy_detail_id: hierarchyData[0].hierarchy_detail_id,
            deposit_type:deposit_type,
        }
        return res.json({//回傳失敗訊息
            code: 200,
            msg: searchData
        });
    },
    agencyApply:async (req, res) => {//支付通道列表
        const errors = validationResult(req)
        if (!errors.isEmpty()) {//是否有正確填寫欄位值
            const error_msg = errorMessage(errors)//取得錯誤訊息
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "失敗",
                data: error_msg
            });
        }
        const InserData = {
            account: req.body.account,
            name:req.body.name,
            phone:req.body.phone
        }
        const agencyApplyAdd = await agencyApplyInsert(InserData)//寫入資料庫
        const agencyApplyRts = await agencyApplyRt(agencyApplyAdd.insertId)//回傳成功表
        return res.json({//回傳失敗訊息
            code: 200,
            msg: agencyApplyRts
        });
    }

}



function errorMessage(errors) {//錯誤訊息回傳
    let errorrmsg = errors.array();
    let emsg = "";
    errorrmsg.forEach(function (erow, i) {//錯誤訊息
        emsg = emsg + erow.msg + " ";
    })
    return emsg
}

function SelectMembers(data) {//找尋Member
    let sql = 'select * from members where account=? and pwd=? and status="enable"'
    let dataList = query(sql, [data.account, data.pwd])
    return dataList
}
function SelectMembersStatus(data) {//找尋Member
    let sql = 'select id,name,status from members where account=? and pwd=? '
    let dataList = query(sql, [data.account, data.pwd])
    return dataList
}
function Login_log(data) {//登入失敗紀錄LOG
    let sql = 'INSERT INTO login_log SET ?'
    let dataList = query(sql, data)
    return dataList
}
async function Login_success(data) {//登入成功
    let sql = 'INSERT INTO members_state SET ?'
    let dataList = query(sql, data)

    let sql2 = 'update members SET ip=?,Lasttime=? where id=?'
    let dataList2 = query(sql2, [data.ip, moment().format('YYYY-MM-DD HH:mm:ss'), data.member_id])
    return dataList
}


function withdrawMembers(data) {//找尋Member
    let sql = 'select a.id,a.account,b.name,b.bank,b.branch,b.country,b.city,b.phone from members a left join members_card b on a.id=b.member_id where a.id=? and a.account=?'
    let dataList = query(sql, [data.id, data.account])
    return dataList
}
function withdrawInsert(data) {//寫入withdraw_order資料庫
    let sql = 'INSERT INTO withdraw_order SET ?'
    let dataList = query(sql, data)
    return dataList
}
function withdrawRt(data) {//查看withdraw_order
    let sql = 'SELECT * FROM `withdraw_order` where id=?'
    let dataList = query(sql, [data])
    return dataList
}




function agencyApplyInsert(data) {//寫入agency_apply資料庫
    let sql = 'INSERT INTO agency_apply SET ?'
    let dataList = query(sql, data)
    return dataList
}
function agencyApplyRt(data) {//查看agency_apply
    let sql = 'SELECT * FROM `agency_apply` where id=?'
    let dataList = query(sql, [data])
    return dataList
}


function depositInsert(data) {//寫入deposit_order資料庫
    let sql = 'INSERT INTO deposit_order SET ?'
    let dataList = query(sql, data)
    return dataList
}
function depositRt(data) {//查看deposit_order
    let sql = 'SELECT * FROM `deposit_order` where id=?'
    let dataList = query(sql, [data])
    return dataList
}

function bindCardInsert(data) {//寫入withdraw_order資料庫
    let sql = 'INSERT INTO members_card SET ?'
    let dataList = query(sql, data)
    return dataList
}
function bindCardRt(data) {//查看withdraw_order
    let sql = 'SELECT * FROM `members_card` where id=?'
    let dataList = query(sql, [data])
    return dataList
}

function checkCard(data) {//查看是否有綁定銀行卡
    let sql = 'SELECT * FROM `members_card` where member_id=?'
    let dataList = query(sql, [data])
    return dataList
}

function changeToType(data) {
    if (data == "ZALOPAY") {
        return "zalo_pay"
    } else if (data == "MOMOPAY") {//MOMO
        return "momo_pay"
    } else if (data == "bank_qr") {//銀行掃碼
        return "QRCode"
    } else if (data = "debit_card") {//借記卡
        return "debit_card"
    } else if (data == "ViettelPay") {
        return "viettel_pay"
    } else if (data == "onlinebank") {//網銀
        return "onlinebank"
    } else if (data == "scratchcard") {//刮刮卡
        return "scratchcard"
    } else {
        return "ERROR"
    }
}

function postscriptCode(data) {
    let sql = 'select CONCAT("'+data+'",substring(md5(rand()),1,5)) as code FROM deposit_order WHERE "postscript" NOT IN (SELECT postscript FROM deposit_order) LIMIT 1'
    let dataList = query(sql)
    return dataList
}


module.exports = MembersController;