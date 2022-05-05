const { query } = require('../async-db')
const { check, validationResult } = require('express-validator')
var geoip = require('geoip-lite');

var moment = require('moment'); // require

const fs = require('fs')


const financeController = {
    depositList: async (req, res) => {//存款紀錄
        const conditionData = pagination(req) //分頁設定
        const depositLists = await depositList(conditionData)//呼叫列表 傳入排序分頁等設定
        const depositListsTotal = await depositListTotal()//資料總筆數
        const total = Math.ceil(Number(depositListsTotal[0].total) / Number(conditionData.limit))//最大頁數

        return res.json({//回傳失敗訊息
            code: 200,
            msg: "查詢成功",
            data: depositLists
        });

    },
    depositListRemark: async (req, res) => { //備註
        const errors = validationResult(req)
        if (!errors.isEmpty()) {//是否有正確填寫欄位值
            const error_msg = errorMessage(errors)//取得錯誤訊息
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "失敗",
                data: error_msg
            });
        }

        const checkOrder = await checkDepositListRemark(req.body.id)
        if (checkOrder.length <= 0) {
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "更新失敗，id有誤"
            });
        }
        const data = {
            remark: req.body.remark
        }
        await updateDepositListRemark(data, req.body.id)
        const DepositInfoRts = await checkDepositListRemark(req.body.id)
        return res.json({//回傳成功
            code: 200,
            msg: "更新成功",
            data: DepositInfoRts
        });


    },
    withdrawList: async (req, res) => {
        const conditionData = pagination(req) //分頁設定
        const withdrawLists = await withdrawList(conditionData)//呼叫會員列表 傳入排序分頁等設定
        const withdrawListsTotal = await withdrawListTotal()//資料總筆數
        const total = Math.ceil(Number(withdrawListsTotal[0].total) / Number(conditionData.limit))//最大頁數
        for (i = 0; i < withdrawLists.length; i++) {//風控 確認IP是否在黑名單內
            checkIPLists = await checkIPList(withdrawLists[i].ip)
            if (checkIPLists.length > 0) {
                withdrawLists[i].risk = "X"
            } else {
                withdrawLists[i].risk = "V"
            }
        }
        return res.json({//回傳失敗訊息
            code: 200,
            msg: "查詢成功",
            data: withdrawLists
        });
    },
    withdrawAudit: async (req, res) => {//審核
        const errors = validationResult(req)
        if (!errors.isEmpty()) {//是否有正確填寫欄位值
            const error_msg = errorMessage(errors)//取得錯誤訊息
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "審核失敗",
                data: error_msg
            });
        }
        const checkOrder = await checkWithdraw(req.body.id)
        if (checkOrder.length <= 0) {
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "審核失敗，id有誤,或此筆已審核過"
            });
        }
        let withdrawData = {}
        if (req.body.status == "finish") {
            withdrawData = {
                id: req.body.id,
                status: req.body.status,
                actual_amount: checkOrder[0].amount,
            }
        } else {
            withdrawData = {
                id: req.body.id,
                status: req.body.status,
                actual_amount: 0,
            }
        }
        await updateWithdraw(withdrawData)
        const withdrawRts = await checkWithdrawRt(req.body.id)
        return res.json({//回傳失敗訊息
            code: 200,
            msg: "審核結果",
            data: withdrawRts
        });
    },
    depositInfo: async function (req, res) {
        const depositInfos = await selectDepositInfo()
        return res.json({//回傳失敗訊息
            code: 200,
            msg: "搜尋成功",
            data: depositInfos
        });

    },
    depositInfoUpdate: async (req, res) => {//存款方式設定 標題更新
        const errors = validationResult(req)
        if (!errors.isEmpty()) {//是否有正確填寫欄位值
            const error_msg = errorMessage(errors)//取得錯誤訊息
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "審核失敗",
                data: error_msg
            });
        }
        const checkOrder = await checkDepositInfo(req.body.id)
        if (checkOrder.length <= 0) {
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "更新失敗，id有誤"
            });
        }
        const data = {
            title: req.body.title,
            title_en: req.body.title_en,
            title_vn: req.body.title_vn
        }
        await updateDepositInfo(data, req.body.id)
        const DepositInfoRts = await checkDepositInfo(req.body.id)
        return res.json({//回傳成功
            code: 200,
            msg: "更新成功",
            data: DepositInfoRts
        });
    },
    depositInfoUpdateContent: async (req, res) => {//存款方式設定 描述更新
        const errors = validationResult(req)
        if (!errors.isEmpty()) {//是否有正確填寫欄位值
            const error_msg = errorMessage(errors)//取得錯誤訊息
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "審核失敗",
                data: error_msg
            });
        }
        const checkOrder = await checkDepositInfo(req.body.id)
        if (checkOrder.length <= 0) {
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "更新失敗，id有誤"
            });
        }
        const data = {
            content: req.body.content,
            content_en: req.body.content_en,
            content_vn: req.body.content_vn
        }
        await updateDepositInfo(data, req.body.id)
        const DepositInfoRts = await checkDepositInfo(req.body.id)
        return res.json({//回傳成功
            code: 200,
            msg: "更新成功",
            data: DepositInfoRts
        });
    },
    depositPages: async (req, res) => {//存款頁面設定
        const depositPagesListGroups = await depositPagesListGroup()
        var dataRt = []
        for (i = 0; i < depositPagesListGroups.length; i++) {
            depositPagesLists = await depositPagesList(depositPagesListGroups[i].bank)
            dataRt.push({ Type: depositPagesListGroups[i].bank, data: depositPagesLists })
        }
        return res.json({//回傳
            code: 200,
            msg: "查詢成功",
            data: dataRt
        })
    },
    depositPagesUpdate: async (req, res) => {//存款頁面設定 更新
        const errors = validationResult(req)
        if (!errors.isEmpty()) {//是否有正確填寫欄位值
            const error_msg = errorMessage(errors)//取得錯誤訊息
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "審核失敗",
                data: error_msg
            });
        }
        const checkOrder = await checkDepositPages(req.body.id)
        if (checkOrder.length <= 0) {
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "更新失敗，id有誤"
            });
        }
        const data = {
            display_state: req.body.display_state,
            required: req.body.required,
            message: req.body.message,
            other_set: req.body.other_set
        }
        await updateDepositPages(data, req.body.id)
        const dataRt = await checkDepositPages(req.body.id)
        return res.json({//回傳
            code: 200,
            msg: "更新成功",
            data: dataRt
        })
    },
    financeAccountAdd: async (req, res) => {//公司出入款列表
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
                bank_type: req.body.bank_type,
                currency: req.body.currency,
                bank: req.body.bank,
                account: req.body.account,
                branch: req.body.branch,
                bank_address: req.body.bank_address,
                IFSC_code: req.body.IFSC_code,
                title_cn: req.body.title_cn,
                title_vn: req.body.title_vn,
                title_us: req.body.title_us,
                remark: req.body.remark,
                status: req.body.status,
                freeze: req.body.freeze,
                vip_level: "," + req.body.vip_level + ",",
                third_card: req.body.third_card,
                deposit_max_day: req.body.deposit_max_day,
                deposit_max_total: req.body.deposit_max_total,
                deposit_max: req.body.deposit_max,
                deposit_min: req.body.deposit_min,
                qrcode: req.body.qrcode,
                suggest: req.body.suggest,
                suggest_amount: req.body.suggest_amount,
                dispensing_status: req.body.dispensing_status,
                dispensing_min: req.body.dispensing_min,
                dispensing_max: req.body.dispensing_max,
                balance_min: req.body.balance_min,
                fee: req.body.fee,
                fee2: req.body.fee2
            }
            const financeAdd = await financeInsert(Data)//寫入資料庫
            const financeRt = await financesInsertRt(financeAdd.insertId)//回傳成功表

            return res.json({//回傳成功
                code: 200,
                msg: "新增成功",
                data: financeRt
            });
        }//檢查是否正確欄位填寫END

    },
    financeAccountList: async (req, res) => {//出入款列表
        const conditionData = pagination(req) //分頁設定
        const financeAccounts = await financeAccount(conditionData)//呼叫會員列表 傳入排序分頁等設定
        const financeAccountsTotal = await financeAccountTotal()//資料總筆數
        const total = Math.ceil(Number(financeAccountsTotal[0].total) / Number(conditionData.limit))//最大頁數
        return res.json({//回傳成功
            code: 200,
            msg: "回傳成功",
            data: {
                total: total,//最大頁數
                list: financeAccounts
            }
        });

    },
    transactionsLog: async (req, res) => {//總交易紀錄
        return res.json({//回傳成功
            code: 200,
            msg: "回傳成功",
            data: {
                income_Deposit: "1000",//收入_公司入款
                income_third: "2000",//收入_三方
                income__manual: "3000",//收入_手動調整加錢
                income__withdrawal: "4000",//收入_提款沒收
                expenditure_dispensing: "5000",//支出_會員出款
                expenditure_bunos: "6000",//支出_優惠派發
                expenditure_manual: "7000",//支出_手動
                expenditure_rebate: "8000",//支出_返水
                expenditure_layer: "8000",//支出_老帶新
                expenditure_commission: "8000"//支出_推廣傭金


            }
        });
    },
    walletLog: async (req, res) => {
        const conditionData = pagination(req) //分頁設定
        const walletLogs = await walletLog(conditionData)//呼叫列表 傳入排序分頁等設定
        const bwalletLogsTotal = await walletLogTotal()//資料總筆數
        const total = Math.ceil(Number(bwalletLogsTotal[0].total) / Number(conditionData.limit))//最大頁數
        return res.json({//回傳成功
            code: 200,
            msg: "回傳成功",
            data: {
                total: total,//最大頁數
                list: walletLogs
            }
        });

    },
    bankList: async (req, res) => {//銀行列表
        const conditionData = pagination(req) //分頁設定
        const bankLists = await bankList(conditionData)//呼叫列表 傳入排序分頁等設定
        const bankListsTotal = await bankListTotal()//資料總筆數
        const total = Math.ceil(Number(bankListsTotal[0].total) / Number(conditionData.limit))//最大頁數
        return res.json({//回傳成功
            code: 200,
            msg: "回傳成功",
            data: {
                total: total,//最大頁數
                list: bankLists
            }
        });
    },
    bankListAdd: async (req, res) => {//銀行列表新增
        const errors = validationResult(req)
        if (!errors.isEmpty()) {//是否有正確填寫欄位值
            const error_msg = errorMessage(errors)//取得錯誤訊息
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "新增失敗",
                data: error_msg
            });
        } else {
            //判斷檔案是否具有副檔名
            if (!req.file) {
                return res.json({//回傳
                    code: 500,
                    msg: "新增失敗圖片未上傳"
                });
            }
            if (req.file.originalname.lastIndexOf(".") != -1) {
                extName = req.file.originalname.slice(req.file.originalname.lastIndexOf("."));//取得副檔名
            }
            const filesName = "bankImg" + moment().format('YYYYMMDD_hhmmss') + "_" + getRandom(11111, 99999) + extName;
            const Data = {
                bank_type: req.body.bank_type,
                bank: req.body.bank,
                bank_cn: req.body.bank_cn,
                bank_preset: req.body.bank_preset,
                img: filesName,
                url: req.body.url
            }
            const bankListAdd = await bankListInsert(Data)//寫入資料庫
            const bankListRt = await bankListsInsertRt(bankListAdd.insertId)//回傳成功表
            let newPath = `uploads/finance/${filesName}`//儲存位置
            fs.rename(req.file.path, newPath, () => {//上傳圖片
                //  console.log('image uploaded successful')
            })
            fs.unlink(req.file.path, error => { }); // 刪除暫存檔
            return res.json({//回傳成功
                code: 200,
                msg: "新增成功",
                data: bankListRt
            });
        }//檢查是否正確欄位填寫END

    },
    thirdPlatform: async (req, res) => {//三方列表
        const conditionData = pagination(req) //分頁設定
        const thirdPlatforms = await thirdPlatform(conditionData)//呼叫會員列表 傳入排序分頁等設定
        const thirdPlatformsTotal = await thirdPlatformTotal()//資料總筆數
        const total = Math.ceil(Number(thirdPlatformsTotal[0].total) / Number(conditionData.limit))//最大頁數
        return res.json({//回傳成功
            code: 200,
            msg: "回傳成功",
            data: {
                total: total,//最大頁數
                list: thirdPlatforms
            }
        });
    },
    thirdPlatformAdd: async (req, res) => {//三方平台新增
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
                platform: req.body.platform,
                title: req.body.title,
                title_cn: req.body.title_cn,
                title_vn: req.body.title_vn,
                deposit_limit_day: req.body.deposit_limit_day,
                deposit_limit_total: req.body.deposit_limit_total,
                merchant_nunber: req.body.merchant_nunber,
                merchant_key: req.body.merchant_key,
                deposit_url: req.body.deposit_url,
                withdrawal_url: req.body.withdrawal_url,
                platform_type: req.body.platform_type,
                currency: req.body.currency,
                income_status: req.body.income_status,
                hierarchy_detail_id: req.body.hierarchy_detail_id,
                sug_money: req.body.sug_money,
                momo_pay: req.body.momo_pay,
                momo_deposit_min: req.body.momo_deposit_min,
                momo_deposit_max: req.body.momo_deposit_max,
                momo_handfee: req.body.momo_handfee,
                momo_handfee2: req.body.momo_handfee2,
                momo_thirdfee: req.body.momo_thirdfee,
                momo_thirdfee2: req.body.momo_thirdfee2,
                debit_card: req.body.debit_card,
                debit_deposit_min: req.body.debit_deposit_min,
                debit_deposit_max: req.body.debit_deposit_max,
                debit_handfee: req.body.debit_handfee,
                debit_handfee2: req.body.debit_handfee2,
                debit_thirdfee: req.body.debit_thirdfee,
                debit_thirdfee2: req.body.debit_thirdfee2,
                bank_qr: req.body.bank_qr,
                qr_deposit_min: req.body.qr_deposit_min,
                qr_deposit_max: req.body.qr_deposit_max,
                qr_handfee: req.body.qr_handfee,
                qr_handfee2: req.body.qr_handfee2,
                qr_thirdfee: req.body.qr_thirdfee,
                qr_thirdfee2: req.body.qr_thirdfee2,
                zalo_pay: req.body.zalo_pay,
                zalo_deposit_min: req.body.zalo_deposit_min,
                zalo_deposit_max: req.body.zalo_deposit_max,
                zalo_handfee: req.body.zalo_handfee,
                zalo_handfee2: req.body.zalo_handfee2,
                zalo_thirdfee: req.body.zalo_thirdfee,
                zalo_thirdfee2: req.body.zalo_thirdfee2,
                viettel_pay: req.body.viettel_pay,
                viettel_deposit_min: req.body.viettel_deposit_min,
                viettel_deposit_max: req.body.viettel_deposit_max,
                viettel_handfee: req.body.viettel_handfee,
                viettel_handfee2: req.body.viettel_handfee2,
                viettel_thirdfee: req.body.viettel_thirdfee,
                viettel_thirdfee2: req.body.viettel_thirdfee2,
                scratchcard: req.body.scratchcard,
                payment_status: req.body.payment_status,
                payment_cost: req.body.payment_cost,
                payment_cost2: req.body.payment_cost2,
                payment_min: req.body.payment_min,
                payment_max: req.body.payment_max,
                remark: req.body.remark,
                Createtime: moment().format('YYYY-MM-DD HH:mm:ss'),
                Updatetime: moment().format('YYYY-MM-DD HH:mm:ss'),
                Updateuser: req.session.adminInfo
            }
            const thirdPlatforms = await thirdPlatformInsert(Data)//寫入資料庫
            const thirdPlatformsRt = await thirdPlatformInsertRt(thirdPlatforms.insertId)//回傳成功表

            return res.json({//回傳成功
                code: 200,
                msg: "新增成功",
                data: thirdPlatformsRt
            });
        }//檢查是否正確欄位填寫END

    },
    thirdPlatformUdate: async (req, res) => {//三方平台修改
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
                id: req.body.id,
                platform: req.body.platform,
                title: req.body.title,
                title_cn: req.body.title_cn,
                title_vn: req.body.title_vn,
                deposit_limit_day: req.body.deposit_limit_day,
                deposit_limit_total: req.body.deposit_limit_total,
                merchant_nunber: req.body.merchant_nunber,
                merchant_key: req.body.merchant_key,
                deposit_url: req.body.deposit_url,
                withdrawal_url: req.body.withdrawal_url,
                platform_type: req.body.platform_type,
                currency: req.body.currency,
                income_status: req.body.income_status,
                group_id: req.body.group_id,
                sug_money: req.body.sug_money,
                momo_pay: req.body.momo_pay,
                momo_deposit_min: req.body.momo_deposit_min,
                momo_deposit_max: req.body.momo_deposit_max,
                momo_handfee: req.body.momo_handfee,
                momo_handfee2: req.body.momo_handfee2,
                momo_thirdfee: req.body.momo_thirdfee,
                momo_thirdfee2: req.body.momo_thirdfee2,
                debit_card: req.body.debit_card,
                debit_deposit_min: req.body.debit_deposit_min,
                debit_deposit_max: req.body.debit_deposit_max,
                debit_handfee: req.body.debit_handfee,
                debit_handfee2: req.body.debit_handfee2,
                debit_thirdfee: req.body.debit_thirdfee,
                debit_thirdfee2: req.body.debit_thirdfee2,
                bank_qr: req.body.bank_qr,
                qr_deposit_min: req.body.qr_deposit_min,
                qr_deposit_max: req.body.qr_deposit_max,
                qr_handfee: req.body.qr_handfee,
                qr_handfee2: req.body.qr_handfee2,
                qr_thirdfee: req.body.qr_thirdfee,
                qr_thirdfee2: req.body.qr_thirdfee2,
                zalo_pay: req.body.zalo_pay,
                zalo_deposit_min: req.body.zalo_deposit_min,
                zalo_deposit_max: req.body.zalo_deposit_max,
                zalo_handfee: req.body.zalo_handfee,
                zalo_handfee2: req.body.zalo_handfee2,
                zalo_thirdfee: req.body.zalo_thirdfee,
                zalo_thirdfee2: req.body.zalo_thirdfee2,
                viettel_pay: req.body.viettel_pay,
                viettel_deposit_min: req.body.viettel_deposit_min,
                viettel_deposit_max: req.body.viettel_deposit_max,
                viettel_handfee: req.body.viettel_handfee,
                viettel_handfee2: req.body.viettel_handfee2,
                viettel_thirdfee: req.body.viettel_thirdfee,
                viettel_thirdfee2: req.body.viettel_thirdfee2,
                scratchcard: req.body.scratchcard,
                payment_status: req.body.payment_status,
                payment_cost: req.body.payment_cost,
                payment_cost2: req.body.payment_cost2,
                payment_min: req.body.payment_min,
                payment_max: req.body.payment_max,
                remark: req.body.remark,
                Updatetime: moment().format('YYYY-MM-DD HH:mm:ss'),
                Updateuser: req.session.adminInfo
            }
            const thirdPlatforms = await thirdPlatformUpdate(Data)//寫入資料庫
            const thirdPlatformsRt = await thirdPlatformUpdateRt(thirdPlatforms.insertId)//回傳成功表

            return res.json({//回傳成功
                code: 200,
                msg: "新增成功",
                data: thirdPlatformsRt
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
function checkWithdraw(data) {
    let sql = "select * from withdraw_order where id=? and status='pending'"
    let dataList = query(sql, [data])
    return dataList
}
function checkWithdrawRt(data) {
    let sql = "select * from withdraw_order where id=? "
    let dataList = query(sql, [data])
    return dataList
}
function updateWithdraw(data) {
    let sql = "update withdraw_order set status=?,actual_amount=? where id=?"
    let dataList = query(sql, [data.status, data.actual_amount, data.id])
    return dataList
}



function depositList(data) {
    let sql = 'SELECT a.id,a.Createtime,a.postscript,c.name,d.name,b.account,b.name,a.deposit_type,a.remark,a.amount,a.pay_amount,e.title as pay_info,a.status FROM deposit_order a left join members b on a.member_id=b.id left join agency_team c on b.agency_team_id=c.id left join hierarchy_detail d on b.hierarchy_detail_id=d.id left join third_platform e on a.aisle=e.id order by a.' + data.orderBy + ' ' + data.order + ' limit ?,?'
    let dataList = query(sql, [Number(data.skip), Number(data.limit)])
    return dataList
}

function depositListTotal(data) {
    let sql = 'SELECT count(*) as total from deposit_order'
    let dataList = query(sql)
    return dataList
}


function withdrawList(data) {
    let sql = 'SELECT a.id,a.Createtime,d.name as agency_team,c.name as hierarchy,b.account,b.name,b.tags,e.bank,e.account as bank_account,e.name as bank_name,a.amount as withdraw_amount,a.status,a.bonus_status,a.normal_status,a.actual_amount,a.withdraw_way,a.ip from withdraw_order a left join members b on a.member_id=b.id left join hierarchy_detail c on b.hierarchy_detail_id=c.id left join agency_team d on b.agency_team_id=d.id left join members_card e on b.id=e.member_id order by a.' + data.orderBy + ' ' + data.order + ' limit ?,?'
    let dataList = query(sql, [Number(data.skip), Number(data.limit)])
    return dataList
}

function withdrawListTotal(data) {
    let sql = 'SELECT count(*) as total from withdraw_order a left join members b on a.member_id=b.id '
    let dataList = query(sql)
    return dataList
}
function financeAccount(data) {//出入款銀行列表
    let sql = 'SELECT bank,title_cn,bank_type,account,currency,vip_level,deposit_max_day,deposit_max_total,status,dispensing_status,balance_min,remark FROM `finance_account` order by ' + data.orderBy + ' ' + data.order + ' limit ?,?'
    let dataList = query(sql, [Number(data.skip), Number(data.limit)])
    return dataList
}

function financeAccountTotal() {//出入款銀行列表總數
    let sql = 'SELECT count(*) as total FROM `finance_account` '
    let dataList = query(sql)
    return dataList
}


function walletLog(data) {//錢包出入列表
    let sql = 'SELECT * FROM `wallet_transfer_log` order by ' + data.orderBy + ' ' + data.order + ' limit ?,?'
    let dataList = query(sql, [Number(data.skip), Number(data.limit)])
    return dataList
}

function walletLogTotal() {//錢包出入總數
    let sql = 'SELECT count(*) as total FROM `wallet_transfer_log` '
    let dataList = query(sql)
    return dataList
}


function bankList(data) {//銀行列表
    let sql = 'SELECT * FROM `finance_bank` order by ' + data.orderBy + ' ' + data.order + ' limit ?,?'
    let dataList = query(sql, [Number(data.skip), Number(data.limit)])
    return dataList
}

function bankListTotal() {//銀行列表總數
    let sql = 'SELECT count(*) as total FROM `finance_bank` '
    let dataList = query(sql)
    return dataList
}

function financeInsert(data) {//寫入finance_account資料庫
    let sql = 'INSERT INTO finance_account SET ?'
    let dataList = query(sql, data)
    return dataList
}
function financesInsertRt(data) {//查看finance_account
    let sql = 'SELECT * FROM `finance_account` where id=?'
    let dataList = query(sql, [data])
    return dataList
}




function bankListInsert(data) {//寫入 finance_bank 資料庫
    let sql = 'INSERT INTO finance_bank SET ?'
    let dataList = query(sql, data)
    return dataList
}
function bankListsInsertRt(data) {//查看finance_account
    let sql = 'SELECT * FROM `finance_bank` where id=?'
    let dataList = query(sql, [data])
    return dataList
}





function thirdPlatform(data) {//第三方平台列表
    let sql = 'SELECT * FROM `third_platform` order by ' + data.orderBy + ' ' + data.order + ' limit ?,?'
    let dataList = query(sql, [Number(data.skip), Number(data.limit)])
    return dataList
}

function thirdPlatformTotal() {//第三方平台列表總數
    let sql = 'SELECT count(*) as total FROM `third_platform` '
    let dataList = query(sql)
    return dataList
}


function thirdPlatformUpdate(data) {//寫入 third_platform 資料庫
    let sql = 'INSERT INTO third_platform SET ?'
    let dataList = query(sql, data)
    return dataList
}

function thirdPlatformInsert(data) {//寫入 third_platform 資料庫
    let sql = 'INSERT INTO third_platform SET ?'
    let dataList = query(sql, data)
    return dataList
}
function thirdPlatformInsertRt(data) {//查看third_platform
    let sql = 'SELECT * FROM `third_platform` where id=?'
    let dataList = query(sql, [data])
    return dataList
}

function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};



function checkIPList(data) {//查看是否為黑名單
    let sql = 'SELECT * FROM `whitelist` where ip=? and status="refuse"'
    let dataList = query(sql, [data])
    return dataList
}


function selectDepositInfo(data) {//查看是否為黑名單
    let sql = 'SELECT * FROM `deposit_info` order by id ASC'
    let dataList = query(sql)
    return dataList
}

function updateDepositInfo(data, id) {//更新存款方式設定
    let sql = 'update `deposit_info` set ? where id=?'
    let dataList = query(sql, [data, id])
    return dataList
}
function checkDepositListRemark(data) {
    let sql = 'SELECT * FROM `deposit_order` where id=?'
    let dataList = query(sql, [data])
    return dataList
}
function updateDepositListRemark(data, id) {
    let sql = 'update `deposit_order` set ? where id=?'
    let dataList = query(sql, [data, id])
    return dataList
}
function checkDepositInfo(data) {//存款方式設定確認
    let sql = 'SELECT * FROM `deposit_info` where id=?'
    let dataList = query(sql, [data])
    return dataList
}
function depositPagesListGroup() {
    let sql = 'SELECT * FROM `deposit_pages` group by bank order by id ASC'
    let dataList = query(sql)
    return dataList
}
function depositPagesList(data) {
    let sql = 'SELECT * FROM `deposit_pages` where bank=? order by id ASC'
    let dataList = query(sql, [data])
    return dataList
}

function updateDepositPages(data, id) {//更新存款方式設定
    let sql = 'update `deposit_pages` set ? where id=?'
    let dataList = query(sql, [data, id])
    return dataList
}
function checkDepositPages(data) {
    let sql = 'SELECT * FROM `deposit_pages` where id=?'
    let dataList = query(sql, [data])
    return dataList
}

function selectMembers(data) {
    let sql = 'SELECT * FROM `members` where id=?'
    let dataList = query(sql, [data])
    return dataList
}


module.exports = financeController;