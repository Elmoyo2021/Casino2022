const { query } = require('../async-db')
const { check, validationResult } = require('express-validator')
var geoip = require('geoip-lite');

const backendRiskController = {
    whiteList: async (req, res) => {//後臺黑白名單列表
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
            const whiteLists = await whiteList(conditionData)//呼叫會員列表 傳入排序分頁等設定
            const whiteListTotals = await whiteListTotal(req.query.member_id)//資料總筆數
            const total = Math.ceil(Number(whiteListTotals[0].total) / Number(conditionData.limit))//最大頁數
            return res.json({//回傳成功
                code: 200,
                msg: "回傳成功",
                data: {
                    total: total,//最大頁數
                    list: whiteLists
                }
            });
        }
    },
    whiteListAdd: async (req, res) => {//後臺黑白名單 新增
        const checkGroup = await SelectListCheck(req.body.ip)
        if (checkGroup.length > 0) {
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "修改失敗",
                data: "ip 已存在"
            });
        }
        const errors = validationResult(req)
        if (!errors.isEmpty()) {//是否有正確填寫欄位值
            const error_msg = errorMessage(errors)//取得錯誤訊息
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "新增失敗",
                data: error_msg
            });
        } else {
            const Data = {
                status: req.body.status,
                ip: req.body.ip,
                remark: req.body.remark
            }
            const whiteListAdd = await whiteListInsert(Data)//寫入資料庫
            const whiteListRt = await whiteListInsertRt(whiteListAdd.insertId)//回傳成功表

            return res.json({//回傳成功
                code: 200,
                msg: "新增成功",
                data: whiteListRt
            });
        }//檢查是否正確欄位填寫END

    },
    whiteListUpdate: async (req, res) => {//後臺黑白名單 修改
        const checkList = await whiteListInsertRt(req.body.id)
        if (checkList.length <= 0) {
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "修改失敗",
                data: "id 有誤"
            });
        }

        const checkList2 = await SelectListCheck(req.body.ip)
        if (checkList[0].ip!=req.body.ip &&checkList2.length > 0) {
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "修改失敗",
                data: "該ip已存在"
            });
        }

        const errors = validationResult(req)
        if (!errors.isEmpty()) {//是否有正確填寫欄位值
            const error_msg = errorMessage(errors)//取得錯誤訊息
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "修改失敗",
                data: error_msg
            });
        } else {
            const Data = {
                status: req.body.status,
                ip: req.body.ip,
                remark: req.body.remark
            }
            
            const whiteListAdd = await whiteListUpdate(Data,req.body.id)//寫入資料庫
            const whiteListRt = await whiteListInsertRt(req.body.id)//回傳成功表

            return res.json({//回傳成功
                code: 200,
                msg: "修改成功",
                data: whiteListRt
            });
        }//檢查是否正確欄位填寫END

    },
    whiteListDel: async (req, res) => {//後臺黑白名單 刪除
        const checkGroup = await whiteListInsertRt(req.body.id)
        if (checkGroup.length <= 0) {
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "修改失敗",
                data: "id 有誤"
            });
        }
        const errors = validationResult(req)
        if (!errors.isEmpty()) {//是否有正確填寫欄位值
            const error_msg = errorMessage(errors)//取得錯誤訊息
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "新增失敗",
                data: error_msg
            });
        } else {
            const Data = {
                status: req.body.status,
                ip: req.body.ip,
                remark: req.body.remark
            }
            
            const whiteListAdd = await whiteListDel(req.body.id)//寫入資料庫

            return res.json({//回傳成功
                code: 200,
                msg: "刪除成功",
                data: ""
            });
        }//檢查是否正確欄位填寫END
        
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

function whiteList(data) {//黑白名單列表
    let sql = "select * from backend_whitelist  order by " + data.orderBy + " " + data.order + " limit ?,?"
    let dataList = query(sql, [Number(data.skip), Number(data.limit)])
    return dataList
}
function whiteListTotal(data) {//黑白名單總數
    let sql = 'SELECT count(*) as total FROM `backend_whitelist`'
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

module.exports = backendRiskController;