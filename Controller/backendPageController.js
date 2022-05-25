const { query } = require('../async-db')
const { check, validationResult } = require('express-validator')
var geoip = require('geoip-lite');
var moment = require('moment'); // require

const backendReportController = {
    topDeposit: async (req, res) => {//前10大存款列表列表
        const topDeposits = await topDepositMembers()//前10大存款
        return res.json({//回傳成功
            code: 200,
            msg: "回傳成功",
            data: topDeposits
        });

    },
    recentWithdrawal: async (req, res) => {//過去7日取款列表
        const topWithdrawals = await topWithdrawalMembers()//過去7日取款列表
        var finalRt = []
        for (i = 0; i <= 7; i++) {
            nextday = moment().add(-i, 'days').format('YYYY-MM-DD');
            //members = await countGameMember(nextday)
            amounts = await countAmountWithdrawal(nextday)
            totals = await countWithdrawal(nextday)
            avg=Number(amounts[0].total)/Number(totals[0].total)
            AddData = {
                date: nextday,
                amount: amounts[0].total,
                total: totals[0].total,
                average: avg
            }
            finalRt.push(AddData)
        }
        return res.json({//回傳成功
            code: 200,
            msg: "回傳成功",
            data: finalRt
        });

    },
    topDepositToday: async (req, res) => {//今日存款列表
        const topDepositTodays = await topDepositToday()//今日存款列表
        return res.json({//回傳成功

            code: 200,
            msg: "回傳成功",
            data: topDepositTodays
        });

    },
    recentRegister: async (req, res) => {//進7日註冊會員
        const topWithdrawals = await topWithdrawalMembers()//印日取款列表
        var finalRt = []
        for (i = 0; i <= 7; i++) {
            nextday = moment().add(-i, 'days').format('YYYY-MM-DD');
            //members = await countGameMember(nextday)
            registerTotal = await countRegister(nextday)
            depositTotals = await countRegisterDeposit(nextday)
            AddData = {
                date: nextday,
                registerTotal: registerTotal[0].total,
                depositTotal: depositTotals[0].total
            }
            finalRt.push(AddData)
        }
        return res.json({//回傳成功
            code: 200,
            msg: "回傳成功",
            data: finalRt
        });
    },
    pageTopData: async (req, res) => {//上方數據
        today = moment().format('YYYY-MM-DD');
        const totalProfits= await countProfitToday(today)
        firstDay = moment().add(-7,'days').format('YYYY-MM-DD');
        const recentRegisterMembers= await countRegisterTopData(firstDay,today)
        return res.json({//回傳成功
            code: 200,
            msg: "回傳成功",
            data:{
                totalProfit:totalProfits[0].total,
                recentRegisterMember:recentRegisterMembers[0].total,
            }
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


function countProfitToday(data) {
    let sql = 'select sum(profit) as total from baccarat_bet where status="finish" and Createtime BETWEEN ? AND ?'
    let dataList = query(sql, [data + " 00:00:00", data + " 23:59:59"])
    return dataList
}
function countRegisterTopData(firstDay,today) {
    let sql = 'select count(*) as total from members where Createtime BETWEEN ? AND ?'
    let dataList = query(sql, [firstDay + " 00:00:00", today + " 23:59:59"])
    return dataList
}

function countRegister(data) {
    let sql = 'select count(*) as total from members where Createtime BETWEEN ? AND ?'
    let dataList = query(sql, [data + " 00:00:00", data + " 23:59:59"])
    return dataList
}
function countRegisterDeposit(data) {
    let sql = 'select sum(pay_amount) as total from `deposit_order` where status="finish" and Createtime BETWEEN ? AND ?'
    let dataList = query(sql, [data + " 00:00:00", data + " 23:59:59"])
    return dataList
}
function countAmountWithdrawal(data) {
    let sql = 'select count(*) as total from (select member_id from `withdraw_order` where status="finish" and Createtime BETWEEN ? AND ? group by member_id) as a'
    let dataList = query(sql, [data + " 00:00:00", data + " 23:59:59"])
    return dataList
}
function countWithdrawal(data) {
    let sql = 'select sum(actual_amount) as total from `withdraw_order` where status="finish" and Createtime BETWEEN ? AND ?'
    let dataList = query(sql, [data + " 00:00:00", data + " 23:59:59"])
    return dataList
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
function recentRegisterMember(data){
    today = moment().format('YYYY-MM-DD');
    let sql = 'SELECT count(*) as total from members where Createtime between "'+today+' 00:00:00" and "'+today+' 23:59:59" GROUP BY a.member_id HAVING COUNT(*) > 0 limit 0,10) as a order by total DESC'
    let dataList = query(sql)
    return dataList
}
function topWithdrawalMembers(data) {
    let sql = 'select * from (SELECT a.member_id,b.account, COUNT(*) as total,sum(a.actual_amount) as amount FROM withdraw_order a left join members b on a.member_id=b.id WHERE a.status = "finish" GROUP BY a.member_id HAVING COUNT(*) > 0 limit 0,10) as a order by total DESC'
    let dataList = query(sql)
    return dataList
}
module.exports = backendReportController;