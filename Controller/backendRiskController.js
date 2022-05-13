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


/***********/ 

function advertiseListRt(data) {//查看advertise_carousel
    let sql = 'SELECT * FROM `advertise_carousel` where id=?'
    let dataList = query(sql, [data])
    return dataList
}


function advertiseFloatRt(data) {//查看advertise_carousel
    let sql = 'SELECT * FROM `advertise_float` where id=?'
    let dataList = query(sql, [data])
    return dataList
}

function advertiseFloatData(data) {//查看advertise_carousel資料
    let sql = 'SELECT * FROM `advertise_float` where id=?'
    let dataList = query(sql, [data])
    return dataList
}

function announcementUpdate(data, id) {//更新announcement資料庫
    let sql = 'update announcement SET ? where id=?'
    let dataList = query(sql, [data, id])
    return dataList
}
function announcementsDel(data) {//更新announcement資料庫
    let sql = 'delete from announcement where id=?'
    let dataList = query(sql, [data])
    return dataList
}



function letterList(data) {//會員站內信
    let sql = 'SELECT * FROM `members_letter` order by ' + data.orderBy + ' ' + data.order + ' limit ?,?'
    let dataList = query(sql, [Number(data.skip), Number(data.limit)])
    return dataList
}

function letterTotal() {//會員站內信列表總數
    let sql = 'SELECT count(*) as total FROM `members_letter` '
    let dataList = query(sql)
    return dataList
}


function letterInsert(data) {//寫入members_letter資料庫
    let sql = 'INSERT INTO members_letter SET ?'//公告
    let dataList = query(sql, [data])
    return dataList
}
function letterRt(data) {//查看announcement
    let sql = 'SELECT * FROM `members_letter` where id=?'
    let dataList = query(sql, [data])
    return dataList
}



function staticPagetList(data) {//會員靜態頁面列表
    let sql = 'SELECT * FROM `static_page` order by ' + data.orderBy + ' ' + data.order + ' limit ?,?'
    let dataList = query(sql, [Number(data.skip), Number(data.limit)])
    return dataList
}

function staticPageTotal() {//會員靜態頁面列表總數
    let sql = 'SELECT count(*) as total FROM `static_page` '
    let dataList = query(sql)
    return dataList
}
function staticPageInsert(data) {//更新staticPage資料庫
    let sql = 'INSERT INTO static_page SET ?'//靜態頁面
    let dataList = query(sql, [data])
    return dataList
}
function staticPageUpdate(data, id) {//更新staticPage資料庫
    let sql = 'update static_page SET ? where id=?'
    let dataList = query(sql, [data, id])
    return dataList
}
function staticPageRt(data) {//查看staticPage
    let sql = 'SELECT * FROM `static_page` where id=?'
    let dataList = query(sql, [data])
    return dataList
}




function toMembersInsert(data) {//更新member_letter_detail資料庫
    let sql = 'INSERT INTO members_letter_detail SET ?'//靜態頁面
    let dataList = query(sql, [data])
    return dataList
}

function toGroupList(data) {//查看toGroupList
    let sql = 'SELECT id FROM `members` where hierarchy_detail_id=?'
    let dataList = query(sql, [data])
    return dataList
}

function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};


function checkStatus(stime, etime, status) {
    if (status == "disble") {
        return "停用"
    } else if (stime <= moment().format('YYYY-MM-DD HH:mm:ss') && etime >= moment().format('YYYY-MM-DD HH:mm:ss')) {
        return "運行中"
    } else {
        return "逾期"
    }
}


function fileNameSet(originalname, path, newPath) {//上傳圖片 originalname上傳檔名 path上傳暫存位置 newPath上傳資料夾
    extName = originalname.slice(originalname.lastIndexOf("."));//取得副檔名
    const filesName = "adfloat" + moment().format('YYYYMMDD_hhmmss') + "_" + getRandom(11111, 99999) + extName;
    fs.rename(path, newPath + filesName, () => { })//上傳圖片
    fs.unlink(path, error => { return "Error" }); // 刪除暫存檔
    return filesName;
}
module.exports = backendRiskController;