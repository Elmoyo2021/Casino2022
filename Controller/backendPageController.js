const { query } = require('../async-db')
const { check, validationResult } = require('express-validator')
var geoip = require('geoip-lite');
var moment = require('moment'); // require

const pageModel = require('../Models/pageModel');
pageModels = new pageModel();
const public = require('../Models/public');//共用function
publics = new public();

const backendReportController = {
    topDeposit: async (req, res) => {//前10大存款列表列表
        const topDeposits = await pageModels.topDepositMembers()//前10大存款
        return res.json({//回傳成功
            code: 200,
            msg: "回傳成功",
            data: topDeposits
        });

    },
    recentWithdrawal: async (req, res) => {//過去7日取款列表
        const topWithdrawals = await pageModels.topWithdrawalMembers()//過去7日取款列表
        var finalRt = []
        for (i = 0; i <= 7; i++) {
            nextday = moment().add(-i, 'days').format('YYYY-MM-DD');
            //members = await countGameMember(nextday)
            amounts = await pageModels.countAmountWithdrawal(nextday)
            totals = await pageModels.countWithdrawal(nextday)
            avg=Number(amounts[0].total)/Number(totals[0].total)
            AddData = {
                date: nextday,
                amount: amounts[0].total,
                total: totals[0].total,
                average: avg
            }
            finalRt.push(AddData)
        }
        return res.json({//回傳成功
            code: 200,
            msg: "回傳成功",
            data: finalRt
        });

    },
    topDepositToday: async (req, res) => {//今日存款列表
        const topDepositTodays = await pageModels.topDepositToday()//今日存款列表
        return res.json({//回傳成功

            code: 200,
            msg: "回傳成功",
            data: topDepositTodays
        });

    },
    recentRegister: async (req, res) => {//進7日註冊會員
        const topWithdrawals = await pageModels.topWithdrawalMembers()//印日取款列表
        var finalRt = []
        for (i = 0; i <= 7; i++) {
            nextday = moment().add(-i, 'days').format('YYYY-MM-DD');
            //members = await countGameMember(nextday)
            registerTotal = await pageModels.countRegister(nextday)
            depositTotals = await pageModels.countRegisterDeposit(nextday)
            AddData = {
                date: nextday,
                registerTotal: registerTotal[0].total,
                depositTotal: depositTotals[0].total
            }
            finalRt.push(AddData)
        }
        return res.json({//回傳成功
            code: 200,
            msg: "回傳成功",
            data: finalRt
        });
    },
    pageTopData: async (req, res) => {//上方數據
        today = moment().format('YYYY-MM-DD');
        const totalProfits= await pageModels.countProfitToday(today)
        firstDay = moment().add(-7,'days').format('YYYY-MM-DD');
        const recentRegisterMembers= await pageModels.countRegisterTopData(firstDay,today)
        const allMembers=await pageModels.countAllMember()
        return res.json({//回傳成功
            code: 200,
            msg: "回傳成功",
            data:{
                totalProfit:totalProfits[0].total,
                recentRegisterMember:recentRegisterMembers[0].total,
                allMember:allMembers[0].total,
            }
        });

    }
    

}



module.exports = backendReportController;