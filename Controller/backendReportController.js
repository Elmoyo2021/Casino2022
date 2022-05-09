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