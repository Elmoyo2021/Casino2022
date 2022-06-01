const { query } = require('../async-db')
const { check, validationResult } = require('express-validator')
var geoip = require('geoip-lite');
const financeModel = require('../Models/financeModel');
financeModels = new financeModel();

const public = require('../Models/public');//共用function
publics = new public();
var moment = require('moment'); // require

const fs = require('fs')


const financeController = {
    depositList: async (req, res) => {//存款紀錄
        const conditionData = publics.pagination(req) //分頁設定
        const depositLists = await financeModels.depositList(conditionData)//呼叫列表 傳入排序分頁等設定
        const depositListsTotal = await financeModels.depositListTotal(conditionData)//資料總筆數
        return res.json({//回傳失敗訊息
            code: 200,
            msg: "查詢成功",
            data: {
                total: depositListsTotal,
                data: depositLists
            }
        });

    },
    depositListRemark: async (req, res) => { //備註
        const errors = validationResult(req)
        if (!errors.isEmpty()) {//是否有正確填寫欄位值
            const error_msg = publics.errorMessage(errors)//取得錯誤訊息
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "失敗",
                data: error_msg
            });
        }
        const checkOrder = await financeModels.checkDepositListRemark(req.body.id)
        if (checkOrder.length <= 0) {
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "更新失敗，id有誤"
            });
        }
        await financeModels.updateDepositListRemark(req.body.remark, req.body.id)
        const DepositInfoRts = await financeModels.checkDepositListRemark(req.body.id)
        return res.json({//回傳成功
            code: 200,
            msg: "更新成功",
            data: DepositInfoRts
        });


    },
    depositMember: async (req, res) => {//存款請求明細_個人
        const depositMemberData = await financeModels.depositMemberData(req.query.id)
        if (depositMemberData.length <= 0) {
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "失敗，id有誤"
            });
        }
        return res.json({//回傳成功
            code: 200,
            msg: "成功",
            data: depositMemberData
        });

    },
    depositData: async (req, res) => {
        const depositDatas = await financeModels.checkDepositData(req.query.id)
        if (depositDatas.length <= 0) {
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "失敗，id有誤"
            });
        }
        return res.json({//回傳成功
            code: 200,
            msg: "成功",
            data: depositDatas
        });

    },
    depositLimitList: async (req, res) => {//財務管理_存款詳細_存款時限設定
        const depositLimitLists = await financeModels.depositLimitList(req.query.deposit_group)
        return res.json({//回傳成功
            code: 200,
            msg: "成功",
            data: depositLimitLists
        });
    },
    withdrawList: async (req, res) => {
        const conditionData = publics.pagination(req) //分頁設定
        const withdrawLists = await financeModels.withdrawList(conditionData)//呼叫會員列表 傳入排序分頁等設定
        const total = await financeModels.withdrawListTotal(conditionData)//資料總筆數
        return res.json({//回傳失敗訊息
            code: 200,
            msg: "查詢成功",
            data: {
                total: total,
                data: withdrawLists
            }
        });
    },
    withdrawAudit: async (req, res) => {//審核
        const errors = validationResult(req)
        if (!errors.isEmpty()) {//是否有正確填寫欄位值
            const error_msg = publics.errorMessage(errors)//取得錯誤訊息
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "審核失敗",
                data: error_msg
            });
        }
        const checkWithdrawData = await financeModels.checkWithdraw(req.body.id)
        if (checkWithdrawData.length <= 0) {
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "審核失敗，id有誤,或此筆已審核過"
            });
        }
        let updateData = {}
        if (req.body.status == "finish") {
            updateData = {
                id: req.body.id,
                status: req.body.status,
                actual_amount: checkWithdrawData[0].amount,
            }
        } else {
            updateData = {
                id: req.body.id,
                status: req.body.status,
                actual_amount: 0,
            }
        }
        await financeModels.updateWithdraw(updateData)
        const withdrawDatas = await financeModels.withdrawData(req.body.id)
        return res.json({//回傳失敗訊息
            code: 200,
            msg: "審核結果",
            data: withdrawDatas
        });
    },
    depositInfo: async function (req, res) {
        const depositInfos = await financeModels.selectDepositInfo()
        return res.json({//回傳失敗訊息
            code: 200,
            msg: "搜尋成功",
            data: depositInfos
        });

    },
    depositInfoUpdate: async (req, res) => {//存款方式設定 標題更新
        const errors = validationResult(req)
        if (!errors.isEmpty()) {//是否有正確填寫欄位值
            const error_msg = publics.errorMessage(errors)//取得錯誤訊息
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "審核失敗",
                data: error_msg
            });
        }
        const checkOrder = await financeModels.checkDepositInfo(req.body.id)
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
        await financeModels.updateDepositInfo(data, req.body.id)
        const DepositInfoRts = await financeModels.checkDepositInfo(req.body.id)
        return res.json({//回傳成功
            code: 200,
            msg: "更新成功",
            data: DepositInfoRts
        });
    },
    depositInfoUpdateContent: async (req, res) => {//存款方式設定 描述更新
        const errors = validationResult(req)
        if (!errors.isEmpty()) {//是否有正確填寫欄位值
            const error_msg = publics.errorMessage(errors)//取得錯誤訊息
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "審核失敗",
                data: error_msg
            });
        }
        const checkOrder = await financeModels.checkDepositInfo(req.body.id)
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
        await financeModels.updateDepositInfo(data, req.body.id)
        const DepositInfoRts = await financeModels.checkDepositInfo(req.body.id)
        return res.json({//回傳成功
            code: 200,
            msg: "更新成功",
            data: DepositInfoRts
        });
    },
    depositPages: async (req, res) => {//存款頁面設定
        const depositPagesLists = await financeModels.depositPagesList(req.query.category)
        const errors = validationResult(req)
        if (!errors.isEmpty()) {//是否有正確填寫欄位值
            const error_msg = publics.errorMessage(errors)//取得錯誤訊息
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "審核失敗",
                data: error_msg
            });
        }
        return res.json({//回傳
            code: 200,
            msg: "查詢成功",
            data: depositPagesLists
        })
    },
    depositPagesUpdate: async (req, res) => {//存款頁面設定 更新
        const errors = validationResult(req)
        if (!errors.isEmpty()) {//是否有正確填寫欄位值
            const error_msg = publics.errorMessage(errors)//取得錯誤訊息
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "審核失敗",
                data: error_msg
            });
        }
        const checkDepositPages = await financeModels.checkDepositPage(req.body.id)
        if (checkDepositPages.length <= 0) {
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
        const dataRt = await financeModels.checkDepositPage(req.body.id)
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
            console.log("InsertData", Data)
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
    bankListUpdate: async (req, res) => {//銀行列表更新
        const checkbankList = await bankListsInsertRt(req.body.id)
        if (checkbankList.length <= 0) {
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "失敗，id有誤"
            });
        }
        const errors = validationResult(req)
        if (!errors.isEmpty()) {//是否有正確填寫欄位值
            const error_msg = errorMessage(errors)//取得錯誤訊息
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "失敗",
                data: error_msg
            });
        } else {
            //判斷檔案是否具有副檔名

            const Data = {
                bank_type: req.body.bank_type,
                bank: req.body.bank,
                bank_cn: req.body.bank_cn,
                bank_preset: req.body.bank_preset,
                url: req.body.url
            }
            if (req.file) {
                if (req.file.originalname.lastIndexOf(".") != -1) {
                    extName = req.file.originalname.slice(req.file.originalname.lastIndexOf("."));//取得副檔名
                }
                const filesName = "bankImg" + moment().format('YYYYMMDD_hhmmss') + "_" + getRandom(11111, 99999) + extName;
                Data.img = filesName
            }
            await bankListUpdate(Data, req.body.id)//更新資料庫
            const bankListRt = await bankListsInsertRt(req.body.id)//回傳成功表
            if (req.file) {
                let newPath = `uploads/finance/${Data.img}`//儲存位置
                fs.rename(req.file.path, newPath, () => {//上傳圖片
                    //  console.log('image uploaded successful')
                })
                fs.unlink(req.file.path, error => { }); // 刪除暫存檔
            }

            return res.json({//回傳成功
                code: 200,
                msg: "新增成功",
                data: bankListRt
            });
        }//檢查是否正確欄位填寫END

    },
    thirdPlatformSearch: async (req, res) => {//三方列表_Search
        const memberChecks = await financeModels.thirdPlatformSearch(req.query);
        return res.json({//回傳成功
            code: 200,
            msg: "回傳成功",
            data: memberChecks
        });
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
function financeAccount(data) {//出入款銀行列表
    let sql = 'SELECT id,bank,title_cn,bank_type,account,currency,vip_level,deposit_max_day,deposit_max_total,status,dispensing_status,dispensing_min as dispensing_amount,balance_min,remark,updataUser,updateTime FROM `finance_account` order by ' + data.orderBy + ' ' + data.order + ' limit ?,?'
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


function bankListUpdate(data, id) {//更新 finance_bank 資料庫
    let sql = 'update finance_bank SET ? where id=?'
    let dataList = query(sql, [data, id])
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