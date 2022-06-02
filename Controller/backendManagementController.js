const { query } = require('../async-db')
const { check, validationResult } = require('express-validator')
var geoip = require('geoip-lite');

const managementModel = require('../Models/managementModel');
managementModels = new managementModel();
const public = require('../Models/public');//共用function
publics = new public();

const backendManagementController = {
    managementList: async (req, res) => {//管理者列表
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
            const managementLists = await managementModels.managementList(conditionData)//呼叫會員列表 傳入排序分頁等設定
            const managementTotals = await managementModels.managementTotal(req.query.member_id)//資料總筆數
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
            const error_msg = publics.errorMessage(errors)//取得錯誤訊息
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "查看失敗",
                data: error_msg
            });
        } else {
            const managementDatas = await managementModels.managementData(req.query.management_id)//呼叫會員列表 傳入排序分頁等設定
            //if()
            return res.json({//回傳成功
                code: 200,
                msg: "回傳成功",
                data: managementDatas
            });
        }
    }

}


module.exports = backendManagementController;