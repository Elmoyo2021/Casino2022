const { query } = require('../async-db')
const { check, validationResult } = require('express-validator')
var geoip = require('geoip-lite');
var moment = require('moment'); // require

const backendReportController = {
    topDeposit: async (req, res) => {//投注紀錄列表
        const topDeposits = await topDepositMembers()//10大存款
        return res.json({//回傳成功
            code: 200,
            msg: "回傳成功",
            data: topDeposits
        });

    },
    recentWithdrawal: async (req, res) => {//投注紀錄列表
        const topWithdrawals = await topWithdrawalMembers()//10大存款
        return res.json({//回傳成功
            code: 200,
            msg: "回傳成功",
            data: topWithdrawals
        });

    },
    topDepositToday: async (req, res) => {//投注紀錄列表
        const topDepositTodays = await topDepositToday()//10大存款
        return res.json({//回傳成功
            code: 200,
            msg: "回傳成功",
            data: topDepositTodays
        });

    },
    recentRegister: async (req, res) => {//投注紀錄列表
        const topDeposits = await topDepositMembers()//10大存款
        return res.json({//回傳成功
            code: 200,
            msg: "回傳成功",
            data: topDepositMembers
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
function pagination(data) {//分頁設定
    let skip = 0
    let limit = 20
    let orderBy = "id"
    let order = "ASC"

    if (data.query.skip) {
        skip = data.query.skip
    }
    if (data.query.limit) {
        limit = data.query.limit
    }
    if (data.query.orderBy) {
        orderBy = data.query.orderBy
    }
    if (data.query.order) {
        order = data.query.order
    }
    const conditionData = {
        skip: skip,
        limit: limit,
        orderBy: orderBy,
        order: order //排序類型
    }
    return conditionData
}


function topDepositMembers(data) {
    let sql = 'select * from (SELECT a.member_id,b.account, COUNT(*) as total,sum(a.pay_amount) as amount FROM deposit_order a left join members b on a.member_id=b.id WHERE a.status = "1" GROUP BY a.member_id HAVING COUNT(*) > 0 limit 0,10) as a order by total DESC'
    let dataList = query(sql)
    return dataList
}
function topDepositToday(data) {
    today = moment().format('YYYY-MM-DD');
    let sql = 'select * from (SELECT a.member_id,b.account, COUNT(*) as total,sum(a.pay_amount) as amount FROM deposit_order a left join members b on a.member_id=b.id WHERE a.status = "1" and a.Createtime between "'+today+' 00:00:00" and "'+today+' 23:59:59" GROUP BY a.member_id HAVING COUNT(*) > 0 limit 0,10) as a order by total DESC'
    let dataList = query(sql)
    return dataList
}
function topWithdrawalMembers(data) {
    let sql = 'select * from (SELECT a.member_id,b.account, COUNT(*) as total,sum(a.actual_amount) as amount FROM withdraw_order a left join members b on a.member_id=b.id WHERE a.status = "finish" GROUP BY a.member_id HAVING COUNT(*) > 0 limit 0,10) as a order by total DESC'
    let dataList = query(sql)
    return dataList
}

function countGameBet(data) {
    let sql = 'select count(*) as total from `baccarat_bet` where sdate BETWEEN ? AND ?'
    let dataList = query(sql, [data + " 00:00:00", data + " 23:59:59"])
    return dataList
}
function countGameBetAmount(data) {
    let sql = 'select sum(bet_amount) as total from `baccarat_bet` where sdate BETWEEN ? AND ?'
    let dataList = query(sql, [data + " 00:00:00", data + " 23:59:59"])
    return dataList
}
function countGameBetProfit(data) {
    let sql = 'select sum(profit) as total from `baccarat_bet` where sdate BETWEEN ? AND ?'
    let dataList = query(sql, [data + " 00:00:00", data + " 23:59:59"])
    return dataList
}

function countRegisterMember(data) {
    let sql = 'select count(*) as total from `members` where  Createtime BETWEEN ? AND ?'
    let dataList = query(sql, [data + " 00:00:00", data + " 23:59:59"])
    return dataList
}
function profitBetAmounts(data) {
    let sql = 'select sum(bet_amount) as total from `baccarat_bet` where status="finish" and sdate BETWEEN ? AND ?'
    let dataList = query(sql, [data + " 00:00:00", data + " 23:59:59"])
    return dataList
}
function profitBetProfits(data) {
    let sql = 'select sum(profit) as total from `baccarat_bet` where status="finish" and sdate BETWEEN ? AND ?'
    let dataList = query(sql, [data + " 00:00:00", data + " 23:59:59"])
    return dataList
}


function countProfitDeposit(data) {
    let sql = 'select count(*) as total from `deposit_order` where status=1 and Createtime BETWEEN ? AND ?'
    let dataList = query(sql, [data + " 00:00:00", data + " 23:59:59"])
    return dataList
}
function countProfitDepositAmount(data) {
    let sql = 'select sum(pay_amount) as total from `deposit_order` where status=1 and Createtime BETWEEN ? AND ?'
    let dataList = query(sql, [data + " 00:00:00", data + " 23:59:59"])
    return dataList
}




















module.exports = backendReportController;