const { query } = require('../async-db')
const { check, validationResult } = require('express-validator')
var geoip = require('geoip-lite');

const backendManagementController = {
    managementList: async (req, res) => {//管理者列表
        const errors = validationResult(req)
        if (!errors.isEmpty()) {//是否有正確填寫欄位值
            const error_msg = errorMessage(errors)//取得錯誤訊息
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "查看失敗",
                data: error_msg
            });
        } else {
            const conditionData = pagination(req) //分頁設定
            const managementLists = await managementList(conditionData)//呼叫會員列表 傳入排序分頁等設定
            const managementTotals = await managementTotal(req.query.member_id)//資料總筆數
            const total = Math.ceil(Number(managementTotals[0].total) / Number(conditionData.limit))//最大頁數
            return res.json({//回傳成功
                code: 200,
                msg: "回傳成功",
                data: {
                    total: total,//最大頁數
                    list: managementLists
                }
            });
        }
    },
    managementData: async (req, res) => {//管理者信息列表
        const errors = validationResult(req)
        if (!errors.isEmpty()) {//是否有正確填寫欄位值
            const error_msg = errorMessage(errors)//取得錯誤訊息
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "查看失敗",
                data: error_msg
            });
        } else {
            const managementDatas = await managementData(req.query.management_id)//呼叫會員列表 傳入排序分頁等設定
            //if()
            return res.json({//回傳成功
                code: 200,
                msg: "回傳成功",
                data: managementDatas
            });
        }
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

function managementList(data) {//管理員列表
    let sql = "select a.id,a.account,a.name,b.name as group_name,last_time,last_ip,a.status,a.online_status from backend_admin a left join backend_admin_group b on a.group_id=b.id order by a." + data.orderBy + " " + data.order + " limit ?,?"
    let dataList = query(sql, [Number(data.skip), Number(data.limit)])
    return dataList
}
function managementTotal(data) {//管理員總數
    let sql = 'SELECT count(*) as total FROM `backend_admin`'
    let dataList = query(sql)
    return dataList
}

function managementData(data) {//管理員列表
    let sql = "select a.*,b.name as group_name from backend_admin a left join backend_admin_group b on a.group_id=b.id  where a.id=?"
    let dataList = query(sql, [data])
    console.log(data)
    return dataList
}


module.exports = backendManagementController;