const { query } = require('../async-db')
const { check, validationResult } = require('express-validator')
var geoip = require('geoip-lite');

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

    },
    memberReport: async(req, res) => {//會員列表

        const memberReportLists = await memberReportList()
        console.log(memberReportLists.length)
        let finalRt = []
        let reportData = {}
        for (i = 0; i < memberReportLists.length; i++) {
            members = await countMembers(memberReportLists[i].teacher_id)
            if(members.length<=0){
                teachers=""
            }else{
                teachers=members[0].name
            }
            depositCount = await countDepositCount(memberReportLists[i].member_id)
            depositAmount = await countDepositAmount(memberReportLists[i].member_id)
            withdrawalCount = await countWithdrawalCount(memberReportLists[i].member_id)
            withdrawalAmount = await countWithdrawalAmount(memberReportLists[i].member_id)
            betAmounts = await countBetAmounts(memberReportLists[i].member_id)
            betProfits = await countProfits(memberReportLists[i].member_id)
            var accounteds=0,totals=0
            accounteds=Number(betProfits[0].total)*0.1
            totals=accounteds
            reportData = {
                agency_team: memberReportLists[i].agency_team,
                teacher_id: teachers,
                account: memberReportLists[i].account,
                name: memberReportLists[i].name,
                hierarchy: memberReportLists[i].hierarchy,
                tags: memberReportLists[i].tags,
                depositCount:depositCount[0].total,//存款次數
                depositAmount:depositAmount[0].total,//存款金額
                withdrawalCount:withdrawalCount[0].total,//提款次數
                withdrawalAmount:withdrawalAmount[0].total,//提款次數
                betAmounts:betAmounts[0].total,
                valid_bet:betAmounts[0].total,
                profit:betProfits[0].total
            }
            finalRt.push(reportData)
            //console.log(agencyLists[i].account)
        }
        return res.json({//回傳成功
            code: 200,
            msg: "成功",
            data: finalRt
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

function memberReportList(data){//會員報表列表
    let sql = "select b.name as agency_team,a.teacher_id,a.account,a.name,c.name as hierarchy,d.title as tags,a.id as member_id from members a left join agency_team b on a.agency_team_id=b.id left join hierarchy_detail c on a.hierarchy_detail_id=c.id left join tags d on a.tags=d.id"
    let dataList = query(sql)
    return dataList
}

function countDepositCount(data) {//
    let sql = 'select count(*) as total from `deposit_order` where member_id=? and status=1'
    let dataList = query(sql,[data])
    return dataList
}
function countDepositAmount(data) {//
    let sql = 'select sum(pay_amount) as total from `deposit_order` where member_id=? and status=1'
    let dataList = query(sql,[data])
    return dataList
}
function countWithdrawalCount(data) {//
    let sql = 'select count(*) as total from `withdraw_order` where member_id=? and status="finish"'
    let dataList = query(sql,[data])
    return dataList
}
function countWithdrawalAmount(data) {//
    let sql = 'select sum(actual_amount) as total from `withdraw_order` where member_id=? and status="finish"'
    let dataList = query(sql,[data])
    return dataList
}
function countMembers(data) {//
    let sql = 'SELECT name FROM `members` where id=?'
    let dataList = query(sql, [data])
    return dataList
}
function countBets(data) {//
    let sql = 'select count(*) as total from `baccarat_bet` where member_id=?'
    let dataList = query(sql, [data])
    return dataList
}
function countBetAmounts(data) {//
    let sql = 'SELECT sum(bet_amount) as total from `baccarat_bet` where member_id=?'
    let dataList = query(sql, [data])
    return dataList
}
function countProfits(data) {//
    let sql = 'SELECT sum(profit) as total FROM `baccarat_bet`  where member_id=?'
    let dataList = query(sql, [data])
    return dataList
}

function countProfit(data) {//
    let sql = 'SELECT sum(a.profit) as total FROM `baccarat_bet` a left join members b on a.member_id=b.id where b.agency_team_id=?'
    let dataList = query(sql, [data])
    return dataList
}
function countDeposits(data) {//
    let sql = 'SELECT count(*) as total FROM `deposit_order` a left join members b on a.member_id=b.id where b.agency_team_id=?'
    let dataList = query(sql, [data])
    return dataList
}
function countDepositMembers(data) {//
    let sql = 'select count(*) as total from (SELECT member_id FROM `deposit_order` a left join members b on a.member_id=b.id  where b.agency_team_id=? group by a.member_id) as a'
    let dataList = query(sql, [data])
    return dataList
}
function countDepositAmounts(data) {//
    let sql = 'SELECT sum(a.amount) as total FROM `deposit_order` a left join members b on a.member_id=b.id where b.agency_team_id=?'
    let dataList = query(sql, [data])
    return dataList
}
function countWithdrawalAmounts(data) {//
    let sql = 'SELECT sum(a.amount) as total FROM `withdraw_order` a left join members b on a.member_id=b.id where b.agency_team_id=?'
    let dataList = query(sql, [data])
    return dataList
}



function betHistoryList(data) {//有效投注列表
    let sql = "select a.sdate,a.finishtime,a.order_id,a.game_id,d.name as game_name,e.name as systeam,c.name as hierarchy,b.teacher_id,b.account,a.bet_amount,a.bet_amount,a.profit from baccarat_bet a left join members b on a.member_id=b.id  left join hierarchy_detail c on b.hierarchy_detail_id=c.id left join game_list d on a.game=d.id left join game_system e on d.game_system_id=e.id order by a." + data.orderBy + " " + data.order + " limit ?,?"
    let dataList = query(sql, [Number(data.skip), Number(data.limit)])
    return dataList
}
function betHistoryTotal(data) {//有效投注總數
    let sql = 'select count(*) as total from baccarat_bet a left join members b on a.member_id=b.id  left join hierarchy_detail c on b.hierarchy_detail_id=c.id left join game_list d on a.game=d.id left join game_system e on d.game_system_id=e.id '
    let dataList = query(sql)
    return dataList
}


function whiteListInsert(data) {//寫入backend_whitelist資料庫
    let sql = 'INSERT INTO backend_whitelist SET ?'
    let dataList = query(sql, data)
    return dataList
}

function whiteListUpdate(data, id) {//更新backend_whitelist資料庫
    let sql = 'update backend_whitelist SET ? where id=?'
    let dataList = query(sql, [data, id])
    return dataList
}
function whiteListDel(id) {//刪除backend_whitelist資料庫
    let sql = 'delete from backend_whitelist  where id=?'
    let dataList = query(sql, [id])
    return dataList
}
function whiteListInsertRt(data) {//查看backend_whitelist
    let sql = 'SELECT * FROM `backend_whitelist` where id=?'
    let dataList = query(sql, [data])
    return dataList
}

function SelectListCheck(data) {//查看backend_whitelist
    let sql = 'SELECT * FROM `backend_whitelist` where ip=?'
    let dataList = query(sql, [data])
    return dataList
}
















function whiteListInsert(data) {//寫入backend_whitelist資料庫
    let sql = 'INSERT INTO backend_whitelist SET ?'
    let dataList = query(sql, data)
    return dataList
}

function whiteListUpdate(data,id) {//更新backend_whitelist資料庫
    let sql = 'update backend_whitelist SET ? where id=?'
    let dataList = query(sql, [data,id])
    return dataList
}
function whiteListDel(id) {//刪除backend_whitelist資料庫
    let sql = 'delete from backend_whitelist  where id=?'
    let dataList = query(sql, [id])
    return dataList
}
function whiteListInsertRt(data) {//查看backend_whitelist
    let sql = 'SELECT * FROM `backend_whitelist` where id=?'
    let dataList = query(sql, [data])
    return dataList
}

function SelectListCheck(data) {//查看backend_whitelist
    let sql = 'SELECT * FROM `backend_whitelist` where ip=?'
    let dataList = query(sql, [data])
    return dataList
}








module.exports = backendReportController;