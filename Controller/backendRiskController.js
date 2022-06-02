const { query } = require('../async-db')
const { check, validationResult } = require('express-validator')
var geoip = require('geoip-lite');

const riskModel = require('../Models/riskModel');
riskModels = new riskModel();
const public = require('../Models/public');//共用function
publics = new public();

const backendRiskController = {
    whiteList: async (req, res) => {//後臺黑白名單列表
        const errors = validationResult(req)
        if (!errors.isEmpty()) {//是否有正確填寫欄位值
            const error_msg = publics.errorMessage(errors)//取得錯誤訊息
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "查看失敗",
                data: error_msg
            });
        } else {
            const conditionData = publics.pagination(req) //分頁設定
            const whiteLists = await riskModels.whiteList(conditionData)//呼叫會員列表 傳入排序分頁等設定
            const whiteListTotals = await riskModels.whiteListTotal(conditionData)//資料總筆數

            return res.json({//回傳成功
                code: 200,
                msg: "回傳成功",
                data: {
                    total: whiteListTotals,//最大頁數
                    list: whiteLists
                }
            });
        }
    },
    whiteListAdd: async (req, res) => {//後臺黑白名單 新增
        const checkWhiteLists = await riskModels.whiteListCheckIp(req.body.ip)
        if (checkWhiteLists.length > 0) {
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "修改失敗",
                data: "ip 已存在"
            });
        }
        const errors = validationResult(req)
        if (!errors.isEmpty()) {//是否有正確填寫欄位值
            const error_msg = publics.errorMessage(errors)//取得錯誤訊息
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "新增失敗",
                data: error_msg
            });
        } else {
            const whiteListAdd = await riskModels.whiteListInsert(req.body)//寫入資料庫
            const whiteListRt = await riskModels.whiteListCheck(whiteListAdd.insertId)//回傳成功表

            return res.json({//回傳成功
                code: 200,
                msg: "新增成功",
                data: whiteListRt
            });
        }//檢查是否正確欄位填寫END

    },
    whiteListUpdate: async (req, res) => {//後臺黑白名單 修改
        const checkList = await riskModels.whiteListCheck(req.body.id)
        if (checkList.length <= 0) {
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "修改失敗",
                data: "id 有誤"
            });
        }

        const checkList2 = await riskModels.whiteListCheckIp(req.body.ip)
        if (checkList[0].ip != req.body.ip && checkList2.length > 0) {
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "修改失敗",
                data: "該ip已存在"
            });
        }

        const errors = validationResult(req)
        if (!errors.isEmpty()) {//是否有正確填寫欄位值
            const error_msg = publics.errorMessage(errors)//取得錯誤訊息
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "修改失敗",
                data: error_msg
            });
        } else {
            var updateData = req.body
            delete updateData[req.id];
            await riskModels.whiteListUpdate(updateData, req.body.id)//寫入資料庫
            const whiteListRt = await riskModels.whiteListCheck(req.body.id)//回傳成功表

            return res.json({//回傳成功
                code: 200,
                msg: "修改成功",
                data: whiteListRt
            });
        }//檢查是否正確欄位填寫END

    },
    whiteListDel: async (req, res) => {//後臺黑白名單 刪除
        const checkGroup = await riskModels.whiteListCheck(req.body.id)
        if (checkGroup.length <= 0) {
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "修改失敗",
                data: "id 有誤"
            });
        }
        const errors = validationResult(req)
        if (!errors.isEmpty()) {//是否有正確填寫欄位值
            const error_msg = publics.errorMessage(errors)//取得錯誤訊息
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "新增失敗",
                data: error_msg
            });
        } else {
            const whiteListAdd = await whiteListCheck.whiteListDel(req.body.id)//寫入資料庫

            return res.json({//回傳成功
                code: 200,
                msg: "刪除成功",
                data: ""
            });
        }//檢查是否正確欄位填寫END

    }

}


module.exports = backendRiskController;