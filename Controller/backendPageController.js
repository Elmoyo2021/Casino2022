const { query } = require('../async-db')
const { check, validationResult } = require('express-validator')
var geoip = require('geoip-lite');
var moment = require('moment'); // require

const backendReportController = {
    betHistory: async (req, res) => {//投注紀錄列表
        const conditionData = pagination(req) //分頁設定
        const betHistoryLists = await betHistoryList(conditionData)//呼叫投注紀錄列表 傳入排序分頁等設定
        const betHistorysTotal = await betHistoryTotal(req.query.member_id)//資料總筆數
        const total = Math.ceil(Number(betHistorysTotal[0].total) / Number(conditionData.limit))//最大頁數
        return res.json({//回傳成功
            code: 200,
            msg: "回傳成功",
            data: {
                total: total,//最大頁數
                list: betHistoryLists
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


function countGameMember(data) {
    let sql = 'select count(*) as total from `baccarat_bet` where sdate BETWEEN ? AND ? group by member_id'
    let dataList = query(sql, [data + " 00:00:00", data + " 23:59:59"])
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