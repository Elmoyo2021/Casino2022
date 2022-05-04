const { query } = require('../async-db')
const { check, validationResult } = require('express-validator')
var moment = require('moment'); // require
const fs = require('fs')

//const ImgPath = "http://167.179.74.47:4000/membersImages/"
const ImgPath = ""
const backendMembersController = {
    membersList: async (req, res) => {//會員列表
        const conditionData = pagination(req) //分頁設定
        const members = await MemberList(conditionData)//呼叫會員列表 傳入排序分頁等設定
        const membersTotal = await MemberListTotal()//資料總筆數
        const total = Math.ceil(Number(membersTotal[0].total) / Number(conditionData.limit))//最大頁數
        var walletDatas = []
        let amounts = 0, deposit = 0, deposit_total = 0, withdraw = 0, withdraw_total = 0
        for (i = 0; i < members.length; i++) {
            amounts = await MembersAmount(members[i].id)
            deposit = await MembersDeposit(members[i].id)
            deposit_total = await MembersDepositTotal(members[i].id)
            withdraw = await MembersWithdraw(members[i].id)
            withdraw_total = await MembersWithdrawTotal(members[i].id)
            walletData = {
                id: members[i].id,
                account: members[i].account,
                name: members[i].name,
                group_title: members[i].group_title,
                currency: members[i].currency,
                tagsTitle: members[i].tagsTitle,
                agency_team_id: members[i].agency_team_id,
                teacher_code: members[i].teacher_code,
                email: members[i].email,
                phone: members[i].phone,
                sms_check: members[i].sms_check,
                IM1: members[i].im1,
                IM2: members[i].im2,
                city: members[i].city,
                bank_account: members[i].bank_account,
                Createtime: members[i].Createtime,
                amount: amounts[0].amount,
                deposit: deposit[0].amount,//總存款
                deposit_total: deposit_total[0].total,//存款數
                withdraw: withdraw[0].amount,//提款
                withdraw_total: withdraw_total[0].total,//提款數
            }
            walletDatas.push(walletData)
        }
        return res.json({//回傳成功
            code: 200,
            msg: "回傳成功",
            data: {
                total: total,//最大頁數
                list: walletDatas
            }
        });

    },
    walletList: async (req, res) => {//會員錢包列表
        const walletLists = await walletList(req.query.member_id)//呼叫會員錢包列表
        const walletListWithdraws = await walletListWithdraw(req.query.member_id)//呼叫會員錢包列表
        var available_amount = 0
        available_amount = Number(walletLists[0].amount) - Number(walletListWithdraws[0].amount)
        var walletListsFinRt = []
        var walletListsJs = []
        for (i = 0; i < walletLists.length; i++) {
            walletListsJs = {
                //id:walletLists[0].id,
                title: walletLists[i].title,
                amount: walletLists[i].amount,
                bonus_amount: walletLists[i].bonus_amount
            }
            if(walletLists[i].title=='Main'){
                walletListsJs.remit=Number(walletListWithdraws[0].amount)
                walletListsJs.available_amount=available_amount
            }else{
                walletListsJs.remit=0
                walletListsJs.available_amount=walletLists[i].amount
            }
            walletListsFinRt.push(walletListsJs)
        }
        if (walletLists.length <= 0) {
            return res.json({//回傳成功
                code: 200,
                msg: "回傳失敗",
                data: "查無member_id"
            });
        }
        return res.json({//回傳成功
            code: 200,
            msg: "回傳成功",
            data: walletListsFinRt
        });

    },
    membersData: async (req, res) => {//會員資料
        const members = await membersData(req.query.member_id)//呼叫會員列表 傳入排序分頁等設定
        if (members.length <= 0) {

            return res.json({//回傳失敗
                code: 401,
                msg: "回傳失敗",
                data: "查無會員資料"
            });
        } else {
            var teacherAccount = ""
            var teachers = await teacherData(members[0].teacher_id)
            if (teachers.length > 0) {
                teacherAccount = teachers[0].account
            }
            const membersRt = {
                id: members[0].id,
                account: members[0].account,
                status: members[0].status,
                name: members[0].name,
                group_title: members[0].group_title,
                currency: members[0].currency,
                tagsTitle: members[0].tagsTitle,
                agency_team_id: members[0].agency_team_id,
                teacher_code: members[0].teacher_code,
                teacher_id: members[0].teacher_id,
                teacher: teacherAccount,
                email: members[0].email,
                phone: members[0].phone,
                sms_check: members[0].sms_check,
                IM1: members[0].IM1,
                IM2: members[0].IM2,
                pic1: ImgPath + members[0].pic1,
                pic2: ImgPath + members[0].pic2,
                birthday: members[0].birthday,
                city: members[0].city,
                country: members[0].country,
                bank_account: members[0].bank_account,
                Createtime: members[0].Createtime,
                Lasttime: members[0].Lasttime,
                ip: members[0].ip,
                register_ip: members[0].register_ip,
                online_status: members[0].online_status
            }
            return res.json({//回傳成功
                code: 200,
                msg: "回傳成功",
                data: membersRt
            });
        }

    },
    membersSate: async (req, res) => {//會員在線狀態
        const memberStates = await membersSate(req.query.member_id)//呼叫會員列表 傳入排序分頁等設定
        if (memberStates.length <= 0) {
            return res.json({//回傳失敗
                code: 200,
                msg: "回傳成功",
                data: "離線"
            });
        } else {
            return res.json({//回傳成功
                code: 200,
                msg: "回傳成功",
                data: "在線"
            });
        }

    },
    membersSateDel: async (req, res) => {//會員在線狀態剔除
        await membersSateDel(req.body.member_id)//呼叫會員列表 傳入排序分頁等設定
        return res.json({//回傳成功
            code: 200,
            msg: "回傳成功",
            data: "踢出成功"
        });
    },
    membersPwdReset: async (req, res) => {//會員密碼重置
        const data = {
            id: req.body.member_id
        }
        if (req.body.pwd != req.body.pwd_check) {
            return res.json({//回傳失敗訊息
                code: 501,
                msg: "回傳失敗，密碼及確認密碼不一致",
            });
        }
        const Members = await SelectMembers_Check(data)
        if (Members.length <= 0) {
            return res.json({//回傳失敗訊息
                code: 501,
                msg: "回傳失敗，查無相關會員資訊",
            });
        }
        const errors = validationResult(req)
        if (!errors.isEmpty()) {//是否有正確填寫欄位值
            const error_msg = errorMessage(errors)//取得錯誤訊息
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "回傳失敗",
                data: error_msg
            });
        } else {
            await memberResetPwd(req.body.pwd, req.body.member_id)
            return res.json({//回傳成功
                code: 200,
                msg: "回傳成功",
                data: "密碼重置成功"
            });
        }
    },
    membersPic1: async (req, res) => {//會員Pic1圖上片傳
        if (!req.file) return res.json({ code: 501, msg: '請選擇上傳圖片' });
        const data = {
            id: req.body.member_id
        }
        const Members = await SelectMembers_Check(data)
        if (Members.length <= 0) {
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "更新失敗",
                data: "查無相關會員資訊"
            });
        }
        const errors = validationResult(req)
        if (!errors.isEmpty()) {//是否有正確填寫欄位值
            const error_msg = errorMessage(errors)//取得錯誤訊息
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "更新失敗",
                data: error_msg
            });
        } else {
            //判斷檔案是否具有副檔名
            if (req.file.originalname.lastIndexOf(".") != -1) {
                extName = req.file.originalname.slice(req.file.originalname.lastIndexOf("."));//取得副檔名
            }
            const filesName = "memberPic1" + moment().format('YYYYMMDD_hhmmss') + "_" + getRandom(11111, 99999) + extName;
            await membersPic1(filesName, req.body.member_id)//呼叫會員列表 傳入排序分頁等設定
            let newPath = `uploads/members/${filesName}`//儲存位置
            fs.rename(req.file.path, newPath, () => {//上傳圖片
                //  console.log('image uploaded successful')
            })
            fs.unlink(req.file.path, error => { }); // 刪除暫存檔
            return res.json({//回傳成功
                code: 200,
                msg: "圖片更新成功",
                data: ImgPath + filesName
            });
        }
    },
    membersPic2: async (req, res) => {//會員Pic2圖上片傳
        if (!req.file) return res.json({ code: 501, msg: '請選擇上傳圖片' });
        const data = {
            id: req.body.member_id
        }
        const Members = await SelectMembers_Check(data)
        if (Members.length <= 0) {
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "更新失敗",
                data: "查無相關會員資訊"
            });
        }
        const errors = validationResult(req)
        if (!errors.isEmpty()) {//是否有正確填寫欄位值
            const error_msg = errorMessage(errors)//取得錯誤訊息
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "更新失敗",
                data: error_msg
            });
        } else {
            //判斷檔案是否具有副檔名
            if (req.file.originalname.lastIndexOf(".") != -1) {
                extName = req.file.originalname.slice(req.file.originalname.lastIndexOf("."));//取得副檔名
            }
            const filesName = "memberPic2" + moment().format('YYYYMMDD_hhmmss') + "_" + getRandom(11111, 99999) + extName;
            await membersPic2(filesName, req.body.member_id)//呼叫會員列表 傳入排序分頁等設定
            let newPath = `uploads/members/${filesName}`//儲存位置
            fs.rename(req.file.path, newPath, () => {//上傳圖片
                //  console.log('image uploaded successful')
            })
            fs.unlink(req.file.path, error => { }); // 刪除暫存檔
            return res.json({//回傳成功
                code: 200,
                msg: "圖片更新成功",
                data: ImgPath + filesName
            });
        }
    },

    pathMemberTags: async (req, res) => {//會員標籤修改

        const errors = validationResult(req)
        if (!errors.isEmpty()) {//是否有正確填寫欄位值
            const error_msg = errorMessage(errors)//取得錯誤訊息
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "更新失敗",
                data: error_msg
            });
        } else {
            const tagsData = {
                id: req.body.id,
                tags: req.body.tags
            }
            await MemberUpdateTags(tagsData)//更新會員標籤
            const MemberUpdateRt = await MembersRt(req.body.id)//回傳成功表

            return res.json({//回傳成功
                code: 200,
                msg: "會員標籤更新成功",
                data: MemberUpdateRt
            });
        }//檢查是否正確欄位填寫END

    },
    teamList: async (req, res) => {//會員代理團隊修改
        const AgencyLists = await SelectAgencyTeam()
        
        return res.json({//回傳成功
            code: 200,
            msg: "查詢成功",
            data: AgencyLists
        });
    },
    pathMemberTeam: async (req, res) => {//會員代理團隊修改
        const checkAccount = await SelectTeams(req.body.agency_team_id)
        if (checkAccount.length <= 0) {
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "修改失敗",
                data: "代理團隊參數不存在"
            });
        }

        const errors = validationResult(req)
        if (!errors.isEmpty()) {//是否有正確填寫欄位值
            const error_msg = errorMessage(errors)//取得錯誤訊息
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "更新失敗",
                data: error_msg
            });
        } else {
            const teamData = {
                id: req.body.member_id,
                agency_team_id: req.body.agency_team_id
            }
            const MemberTagsUpdate = await MemberUpdateTeam(teamData)//更新會員代理團隊
            const MemberUpdateRt = await MembersRt(req.body.member_id)//回傳成功表

            return res.json({//回傳成功
                code: 200,
                msg: "會員代理團隊更新成功",
                data: MemberUpdateRt
            });
        }//檢查是否正確欄位填寫END

    },
    pathMemberVip: async (req, res) => {//會員VIP層級修改
        const checkAccount = await SelectVips(req.body.vip_id)
        if (checkAccount.length <= 0) {
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "修改失敗",
                data: "Vip參數不存在"
            });
        }

        const errors = validationResult(req)
        if (!errors.isEmpty()) {//是否有正確填寫欄位值
            const error_msg = errorMessage(errors)//取得錯誤訊息
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "更新失敗",
                data: error_msg
            });
        } else {
            const vipData = {
                id: req.body.member_id,
                hierarchy_detail_id: req.body.vip_id
            }
            const MemberTagsUpdate = await MemberUpdateVip(vipData)//更新VIP
            const MemberUpdateRt = await MembersRt(req.body.member_id)//回傳成功表

            return res.json({//回傳成功
                code: 200,
                msg: "會員代理團隊更新成功",
                data: MemberUpdateRt
            });
        }//檢查是否正確欄位填寫END

    },
    memberAdd: async (req, res) => {//新增會員
        var ip = req.ip//ip
        ip = ip.toString().replace('::ffff:', ''); //
        const checkAccount = await SelectMembers(req.body.account)
        if (checkAccount.length > 0) {
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "新增失敗",
                data: "帳號已存在"
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
            const memberData = {
                account: req.body.account,
                pwd: req.body.pwd,
                name: req.body.name,
                currency: req.body.currency,
                phone: req.body.phone,
                email: req.body.email,
                country: req.body.country,
                city: req.body.city,
                birthday: req.body.birthday,
                group_id: req.body.group_id,
                register_ip: ip,
                ip: ip
            }
            const Memberadd = await MemberInsert(memberData)//寫入資料庫
            const MemberaddRt = await MembersRt(Memberadd.insertId)//回傳成功表
            await MembersWallet(Memberadd.insertId)//新增會員錢包

            return res.json({//回傳成功
                code: 200,
                msg: "新增會員成功",
                data: MemberaddRt
            });
        }//檢查是否正確欄位填寫END
    },
    memberUpdate: async (req, res) => {//會員資料修改
        const data = {
            name: req.body.name,
            country: req.body.country,
            city: req.body.city,
            birthday: req.body.birthday,
            email: req.body.email,
            phone: req.body.phone,
            IM1: req.body.IM1,
            IM2: req.body.IM2
        }
        const data2 = {
            id: req.body.id
        }
        const checkAccount = await SelectMembers_Check(data2)//檢查是否有符合的帳號 無則傳回錯誤
        if (checkAccount.length <= 0) {
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "更改失敗",
                data: "找不到相關帳號資料"
            });
        }
        const errors = validationResult(req)
        if (!errors.isEmpty()) {//是否有正確填寫欄位值
            const error_msg = errorMessage(errors)//取得錯誤訊息
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "更改失敗",
                data: error_msg
            });
        } else {

            const MemberRemarkadd = await MemberUpdate(data, data2)//寫入資料庫
            const MemberaddRt = await MembersRt(req.body.id)//回傳成功表
            return res.json({//回傳成功
                code: 200,
                msg: "更改成功",
                data: MemberaddRt
            });
        }
    },
    membersLayer: async (req, res) => {//會員資料 老待新修改
        const data = {
            id: req.body.member_id,
            teacher_id: req.body.teacher_id
        }
        const checkAccount = await SelectMembers_Check(data)//檢查是否有符合的帳號 無則傳回錯誤
        if (checkAccount.length <= 0) {
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "更改失敗",
                data: "找不到相關帳號資料"
            });
        }
        const errors = validationResult(req)
        if (!errors.isEmpty()) {//是否有正確填寫欄位值
            const error_msg = errorMessage(errors)//取得錯誤訊息
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "更改失敗",
                data: error_msg
            });
        } else {

            const MemberTeacheradd = await membersLayerUpdate(data)//寫入資料庫
            const MemberTeacherRt = await MembersRt(req.body.member_id)//回傳成功表
            return res.json({//回傳成功
                code: 200,
                msg: "更改成功",
                data: MemberTeacherRt
            });
        }
    },
    membersLayerStart: async (req, res) => {//會員資料 老帶新激活
        const data = {
            id: req.body.member_id
        }
        const checkAccount = await SelectMembers_Check(data)//檢查是否有符合的帳號 無則傳回錯誤
        if (checkAccount.length <= 0) {
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "老帶新激活失敗",
                data: "找不到相關帳號資料"
            });
        }
        if (checkAccount[0].teacher_code) {
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "老帶新激活失敗",
                data: "該帳號已激活"
            });
        }
        const errors = validationResult(req)
        if (!errors.isEmpty()) {//是否有正確填寫欄位值
            const error_msg = errorMessage(errors)//取得錯誤訊息
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "老帶新激活失敗",
                data: error_msg
            });
        } else {
            const teacherCodes = await teacherCode()
            const data = {
                member_id: req.body.member_id,
                teacher_code: teacherCodes[0].code
            }
            await membersLayerStart(data)//寫入資料庫
            const MemberTeacherRt = await MembersRt(req.body.member_id)//回傳成功表
            return res.json({//回傳成功
                code: 200,
                msg: "老帶新激活成功",
                data: MemberTeacherRt
            });
        }
    },
    members_vipList: async (req, res) => {//老待新列表
        const members_vipLists = await vipList()//呼叫老帶新列表 
        return res.json({//回傳成功
            code: 200,
            msg: "回傳成功",
            data: members_vipLists
        });
    },

    teacherList: async (req, res) => {//老待新列表
        const teacherLists = await teacherList(req.query.member_id)//呼叫老帶新列表 
        return res.json({//回傳成功
            code: 200,
            msg: "回傳成功",
            data: teacherLists
        });
    },
    membersBankCardList: async (req, res) => {//會員銀行卡列表

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
            const membersBankCards = await membersBankCardList(req.query.member_id, conditionData)//呼叫會員列表 傳入排序分頁等設定
            const membersBankCardsTotal = await membersBankCardTotal(req.query.member_id)//資料總筆數
            const total = Math.ceil(Number(membersBankCardsTotal[0].total) / Number(conditionData.limit))//最大頁數
            return res.json({//回傳成功
                code: 200,
                msg: "回傳成功",
                data: {
                    total: total,//最大頁數
                    list: membersBankCards
                }
            });
        }
    },
    membersBankCardAdd: async (req, res) => {//新增會員銀行卡
        const checkAccount = await SelectMembers2(req.body.member_id)
        if (checkAccount.length <= 0) {
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "新增失敗",
                data: "會員id 不存在"
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
            const memberData = {
                member_id: req.body.member_id,
                name: req.body.name,
                branch: req.body.branch,
                account: req.body.account,
                open_province: req.body.open_province,
                open_city: req.body.open_city,
                phone: req.body.phone,
                activationid: req.body.activationid,
                CreateUser: req.session.adminInfo
            }
            const BankCardsAdd = await BankCardInsert(memberData)//寫入資料庫
            const BankCardsRt = await BankCardRt(BankCardsAdd.insertId)//回傳成功表

            return res.json({//回傳成功
                code: 200,
                msg: "新增銀行卡成功",
                data: BankCardsRt
            });
        }//檢查是否正確欄位填寫END
    },
    membersBankCardDel: async (req, res) => {//刪除會員銀行卡
        const delData = {
            id: req.body.id,
        }
        const checkAccount = await SelectBankCard(delData)
        if (checkAccount.length <= 0) {
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "刪除失敗",
                data: "該銀行卡不存在"
            });
        }
        const errors = validationResult(req)
        if (!errors.isEmpty()) {//是否有正確填寫欄位值
            const error_msg = errorMessage(errors)//取得錯誤訊息
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "刪除失敗",
                data: error_msg
            });
        } else {
            const MemberRemarkadd = await MemberBankCardDel(delData)//刪除資料庫資料

            return res.json({//回傳成功
                code: 200,
                msg: "刪除銀行卡成功",
                data: ""
            });
        }//檢查是否正確欄位填寫END
    },
    remarkList: async (req, res) => {//會員備註列表

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
            const remarks = await MemberRemarkList(req.query.member_id, conditionData)//呼叫會員列表 傳入排序分頁等設定
            const remarksTotal = await MemberRemarkListTotal(req.query.member_id)//資料總筆數
            const total = Math.ceil(Number(remarksTotal[0].total) / Number(conditionData.limit))//最大頁數
            return res.json({//回傳成功
                code: 200,
                msg: "回傳成功",
                data: {
                    total: total,//最大頁數
                    list: remarks
                }
            });
        }
    },
    remarkAdd: async (req, res) => {//新增會員備註
        const checkAccount = await SelectMembers(req.body.member_id)
        if (checkAccount.length <= 0) {
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "新增失敗",
                data: "會員id 不存在"
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
            const memberData = {
                member_id: req.body.member_id,
                remark: req.body.remark,
                CreateUser: req.session.adminInfo,
                Updatetime: moment().format('YYYY-MM-DD 00:00:00')
            }
            const MemberRemarkadd = await MemberRemarkInsert(memberData)//寫入資料庫
            const MemberaddRt = await MembersRemarkRt(MemberRemarkadd.insertId)//回傳成功表

            return res.json({//回傳成功
                code: 200,
                msg: "新增會員被注成功",
                data: MemberaddRt
            });
        }//檢查是否正確欄位填寫END
    },
    remarkDel: async (req, res) => {//刪除會員備註
        const delData = {
            id: req.body.id
        }
        const checkAccount = await SelectRemark(delData)
        if (checkAccount.length <= 0) {
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "刪除失敗",
                data: "該備註不存在"
            });
        }
        const errors = validationResult(req)
        if (!errors.isEmpty()) {//是否有正確填寫欄位值
            const error_msg = errorMessage(errors)//取得錯誤訊息
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "刪除失敗",
                data: error_msg
            });
        } else {
            const MemberRemarkadd = await MemberRemarkDel(delData)//刪除資料庫資料

            return res.json({//回傳成功
                code: 200,
                msg: "刪除備註成功",
                data: ""
            });
        }//檢查是否正確欄位填寫END
    },
    pathMemberStatus: async (req, res) => {//改變會員啟用狀態
        const data = {
            id: req.body.id
        }
        const checkAccount = await SelectMembers_Status(data)//檢查是否有符合的帳號 無則傳回錯誤
        if (checkAccount.length <= 0) {
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "更改失敗",
                data: "找不到相關 會員id"
            });
        }
        const errors = validationResult(req)
        const data2 = {
            id: req.body.id,
            status: req.body.status
        }
        await membersStatusUpdate(data2)
        if (!errors.isEmpty()) {//是否有正確填寫欄位值
            const error_msg = errorMessage(errors)//取得錯誤訊息
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "更改失敗",
                data: error_msg
            });
        } else {

            const Members = await MemberRt(req.body.id)
            return res.json({//回傳成功
                code: 200,
                msg: "更改成功",
                data: Members
            });
        }
    },
    groupList: async (req, res) => {//組列表
        const conditionData = pagination(req) //分頁設定
        const Groups = await GroupList(conditionData)//呼叫會員列表 傳入排序分頁等設定
        const GroupsTotal = await GroupListTotal()//資料總筆數
        const total = Math.ceil(Number(GroupsTotal[0].total) / Number(conditionData.limit))//最大頁數
        return res.json({//回傳成功
            code: 200,
            msg: "回傳成功",
            data: {
                total: total,//最大頁數
                list: Groups
            }
        });

    },
    groupDetailList: async (req, res) => {//層級列表
        const conditionData = pagination(req) //分頁設定
        const Groups = await GroupDetailList(conditionData)//呼叫會員列表 傳入排序分頁等設定
        const GroupsTotal = await GroupDetailListTotal()//資料總筆數
        const total = Math.ceil(Number(GroupsTotal[0].total) / Number(conditionData.limit))//最大頁數
        return res.json({//回傳成功
            code: 200,
            msg: "回傳成功",
            data: {
                total: total,//最大頁數
                list: Groups
            }
        });

    },
    group_log: async (req, res) => {//調整層級紀錄
        const conditionData = pagination(req) //分頁設定
        const GroupLogs = await GroupLogList(conditionData)//呼叫會員列表 傳入排序分頁等設定
        const GroupLogsTotal = await GroupLogListTotal()//資料總筆數
        const total = Math.ceil(Number(GroupLogsTotal[0].total) / Number(conditionData.limit))//最大頁數
        return res.json({//回傳成功
            code: 200,
            msg: "回傳成功",
            data: {
                total: total,//最大頁數
                list: GroupLogs
            }
        });
    },
    group_adjust: async (req, res) => {//調整層級_單一
        const checkMembers = await SelectMembers(req.body.account)
        if (checkMembers.length <= 0) {
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "調整失敗",
                data: "帳號不存在"
            });
        }
        const errors = validationResult(req)
        if (!errors.isEmpty()) {//是否有正確填寫欄位值
            const error_msg = errorMessage(errors)//取得錯誤訊息
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "更改失敗",
                data: error_msg
            });
        } else {
            const Data = {
                account: req.body.account,
                group_id: req.body.group_id,
                currency: req.body.currency,
                group_original: checkMembers[0].group_id,
                Updateuser: req.session.adminInfo
            }
            await MemberGroupUpdate(Data)//寫入資料庫
            const GroupRts = await MembersGroupRt(req.body.account)//回傳成功表
            return res.json({//回傳成功
                code: 200,
                msg: "回傳成功",
                data: GroupRts

            });
        }
    },
    group_adjust_plural: async (req, res) => {//調整層級_多筆

        const errors = validationResult(req)
        if (!errors.isEmpty()) {//是否有正確填寫欄位值
            const error_msg = errorMessage(errors)//取得錯誤訊息
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "更改失敗",
                data: error_msg
            });
        } else {
            var plural_account = req.body.account.split(",");
            let Data = {}
            var all_account = ""

            var checkMembers = ""
            for (i = 0; i < plural_account.length; i++) {
                checkMembers = await SelectMembers(plural_account[i])
                Data = {
                    account: plural_account[i],
                    group_id: req.body.group_id,
                    currency: req.body.currency,
                    group_original: checkMembers[0].group_id,
                    Updateuser: req.session.adminInfo
                }
                console.log(Data)
                await MemberGroupUpdate(Data)//寫入資料庫
                all_account = all_account + "," + plural_account[i]
            }

            const Rts = await RtMemberGroup(all_account)
            return res.json({//回傳成功
                code: 200,
                msg: "回傳成功",
                data: Rts

            });
        }
    },
    
    groupDetail_info: async (req, res) => {//層級細節
        const groupDetailInfos =await groupDetailInfo(req.query.id) 
        const groupInfos=await groupInfo(groupDetailInfos[0].group_id) 
        const memberCounts=await memberGroupCount(req.query.id) 

        
        const deposit_banks=await Select_deposit_bank(req.query.id)
        let deposit_banksBox=""
        for(i=0;i<deposit_banks.length;i++){
            deposit_banksBox=deposit_banksBox+","+deposit_banks[i].bank
        }
        deposit_banksBox=deposit_banksBox.substr(1);//去除第一個逗號

        const deposit_thirds=await deposit_third(req.query.id)
        let deposit_thirdBox=""
        for(i=0;i<deposit_thirds.length;i++){
            deposit_thirdBox=deposit_thirdBox+","+deposit_thirds[i].bank
        }
        deposit_thirdBox=deposit_thirdBox.substr(1);//去除第一個逗號

        
        const deposit_payments=await deposit_payment(req.query.id)
        console.log(deposit_payments)
        let deposit_paymentBox=""
        for(i=0;i<deposit_payments.length;i++){
            deposit_paymentBox=deposit_paymentBox+","+deposit_payments[i].title
        }
        deposit_paymentBox=deposit_paymentBox.substr(1);//去除第一個逗號
        let groupInfoBox={
            gruop_name:groupDetailInfos[0].name,
            currency:groupInfos[0].currency,
            members:memberCounts[0].total,
            status:groupInfos[0].status,
        }
        let updateConditionBox={
            upgrade_deposit:groupDetailInfos[0].upgrade_deposit,
            upgrade_bet:groupDetailInfos[0].upgrade_bet,
            reserve_deposit:groupDetailInfos[0].reserve_deposit,
            reserve_bet:groupDetailInfos[0].reserve_bet,
        }
        let depositAccountbox={
            deposit_bank:deposit_banksBox,
            deposit_third:deposit_thirdBox,
            deposit_payment:deposit_paymentBox
        }
        let depositWithdrawalLimitBox={
            deposit_min:groupDetailInfos[0].deposit_min,
            deposit_max:groupDetailInfos[0].deposit_max,
            withdraw_min:groupDetailInfos[0].withdraw_min,
            withdraw_max:groupDetailInfos[0].withdraw_max,
            withdraw_max_day:groupDetailInfos[0].withdraw_max_day,
            withdraw_remind_day:groupDetailInfos[0].withdraw_remind_day,
            fee:"1%",
            administrativeFee:"1.00"
        }
        return res.json({//回傳成功
            code: 200,
            msg: "回傳成功",
            data: {
                groupInfo:groupInfoBox,
                updateCondition:updateConditionBox,
                depositAccount:depositAccountbox,
                depositWithdrawalLimit:depositWithdrawalLimitBox
            }
        });
    },
    groupAdd: async (req, res) => {//新增組
        const checkGroup = await SelectGroup(req.body.name)
        if (checkGroup.length > 0) {
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "新增失敗",
                data: "組名稱已存在"
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
            const groupsData = {
                group_name: req.body.group_name,
                currency: req.body.currency,
                status: req.body.status,
                content: req.body.content,
                auto_rank: req.body.auto_rank,
                date_range: req.body.date_range,
                reserve_level: req.body.reserve_level,
                upgrade_con: req.body.upgrade_con,
                reserve_upgrade: req.body.reserve_upgrade,
                show_status: req.body.show_status
            }
            const Groupadd = await GroupInsert(groupsData)//寫入資料庫
            const GroupRts = await GroupRt(Groupadd.insertId)//回傳成功表

            return res.json({//回傳成功
                code: 200,
                msg: "新增組成功",
                data: GroupRts
            });
        }//檢查是否正確欄位填寫END
    },
    groupUpdate: async (req, res) => {//編輯組
        const checkGroup = await SelectGroup2(req.body.id)
        if (checkGroup.length <= 0) {
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "編輯失敗",
                data: "id不存在"
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
            const groupsData = {
                id: req.body.id,
                group_name: req.body.group_name,
                currency: req.body.currency,
                status: req.body.status,
                content: req.body.content,
                auto_rank: req.body.auto_rank,
                date_range: req.body.date_range,
                reserve_level: req.body.reserve_level,
                upgrade_con: req.body.upgrade_con,
                reserve_upgrade: req.body.reserve_upgrade,
                show_status: req.body.show_status
            }
            const Groupadd = await GroupUpdate(groupsData)//寫入資料庫
            const GroupRts = await GroupRt(req.body.id)//回傳成功表

            return res.json({//回傳成功
                code: 200,
                msg: "新增組成功",
                data: GroupRts
            });
        }//檢查是否正確欄位填寫END
    },
    groupDetailAdd: async (req, res) => {//新增組系項
        const checkGroup = await SelectGroupCheck(req.body.group_id)
        if (checkGroup.length <= 0) {
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "新增失敗",
                data: "Group_id 有誤"
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
            const groupsData = {
                group_id: req.body.group_id,
                name: req.body.name,
                name_show: req.body.name_show,
                upgrade_deposit: req.body.upgrade_deposit,
                upgrade_bet: req.body.upgrade_bet,
                reserve_deposit: req.body.reserve_deposit,
                reserve_bet: req.body.reserve_bet,
                deposit_min: req.body.deposit_min,
                deposit_max: req.body.deposit_max,
                withdraw_max: req.body.withdraw_max,
                withdraw_min: req.body.withdraw_min,
                withdraw_max_day: req.body.withdraw_max_day,
                withdraw_remind: req.body.withdraw_remind,
                withdraw_remind_day: req.body.withdraw_remind_day
            }
            const GroupDetailadd = await GroupDetailInsert(groupsData)//寫入資料庫
            const GroupDetailRts = await GroupDetailRt(GroupDetailadd.insertId)//回傳成功表

            return res.json({//回傳成功
                code: 200,
                msg: "新增組成功",
                data: GroupDetailRts
            });
        }//檢查是否正確欄位填寫END
    },
    groupDetailUpdates: async (req, res) => {//組系項編輯

        const checkGroup = await SelectDetail(req.body.id)
        if (checkGroup.length <= 0) {
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "編輯失敗",
                data: "id不存在"
            });
        }


        const errors = validationResult(req)
        if (!errors.isEmpty()) {//是否有正確填寫欄位值
            const error_msg = errorMessage(errors)//取得錯誤訊息
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "編輯失敗",
                data: error_msg
            });
        } else {
            const groupsData = {
                id: req.body.id,
                group_id: req.body.group_id,
                name: req.body.name,
                name_show: req.body.name_show,
                upgrade_deposit: req.body.upgrade_deposit,
                upgrade_bet: req.body.upgrade_bet,
                reserve_deposit: req.body.reserve_deposit,
                reserve_bet: req.body.reserve_bet,
                deposit_min: req.body.deposit_min,
                deposit_max: req.body.deposit_max,
                withdraw_max: req.body.withdraw_max,
                withdraw_min: req.body.withdraw_min,
                withdraw_max_day: req.body.withdraw_max_day,
                withdraw_remind: req.body.withdraw_remind,
                withdraw_remind_day: req.body.withdraw_remind_day
            }
            const GroupDetailadd = await GroupDetailUpdate(groupsData)//寫入資料庫
            const GroupDetailRts = await GroupDetailRt(req.body.id)//回傳成功表

            return res.json({//回傳成功
                code: 200,
                msg: "編輯成功",
                data: GroupDetailRts
            });
        }//檢查是否正確欄位填寫END
    },
    membersNew: async (req, res) => {//新註冊玩家數據
        const newMembers = await NewMemberCount()
        const newMembersWeek = await NewMemberCount_Week()
        const newMembersLastWeek = await NewMemberCount_LastWeek()
        const newMember_deposit = await NewMemberDepositCount()
        const newMember_deposit_Week = await NewMemberDepositCount_Weel()
        const newMember_deposit_LastWeek = await NewMemberDepositCount_LastWeel()

        return res.json({//回傳成功
            code: 200,
            msg: "回傳成功",
            data: {
                newMember: newMembers[0].total,//新會員(今日)
                newMember_week: newMembersWeek[0].total,//新會員(本周)
                newMember_lastWeek: newMembersLastWeek[0].total,//新會員(上周)
                newMember_deposit: newMember_deposit.length,//新會員_存款(今日)
                newMember_deposit_Week: newMember_deposit_Week.length,//新會員_存款(本周)
                newMember_deposit_lastWeek: newMember_deposit_LastWeek.length,//新會員_存款(上周)
            }
        });

    },
    membersNewList: async (req, res) => {//新註冊玩家列表
        const conditionData = pagination(req) //分頁設定
        const members = await NewMemberList(conditionData)//呼叫會員列表 傳入排序分頁等設定
        const membersTotal = await NewMemberListTotal()//資料總筆數
        const total = Math.ceil(Number(membersTotal[0].total) / Number(conditionData.limit))//最大頁數
        return res.json({//回傳成功
            code: 200,
            msg: "回傳成功",
            data: {
                total: total,//最大頁數
                list: members
            }
        });

    },
    membersDeposit: async (req, res) => {//總存款列表
        const data = {
            member_id: req.query.member_id
        }
        const conditionData = pagination(req) //分頁設定
        const membersDeposits = await membersDepositList(conditionData, data)//呼叫會員列表 傳入排序分頁等設定
        const DepositsTotal = await membersDepositListTotal(data)//資料總筆數
        const total = Math.ceil(Number(DepositsTotal[0].total) / Number(conditionData.limit))//最大頁數
        return res.json({//回傳成功
            code: 200,
            msg: "回傳成功",
            data: {
                total: total,//最大頁數
                list: membersDeposits
            }
        });

    },
    membersWithdraw: async (req, res) => {//總存款列表
        const data = {
            member_id: req.query.member_id
        }
        const conditionData = pagination(req) //分頁設定
        const membersWithdraw = await membersWithdrawList(conditionData, data)//呼叫會員列表 傳入排序分頁等設定
        const WithdrawTotal = await membersWithdrawListTotal(data)//資料總筆數
        const total = Math.ceil(Number(WithdrawTotal[0].total) / Number(conditionData.limit))//最大頁數
        return res.json({//回傳成功
            code: 200,
            msg: "回傳成功",
            data: {
                total: total,//最大頁數
                list: membersWithdraw
            }
        });

    },
    loginLog: async (req, res) => {//登入失敗玩家數據
        const conditionData = pagination(req) //分頁設定
        const loginLogs = await loginLog(conditionData)//呼叫會員列表 傳入排序分頁等設定
        const LogTotal = await loginLogTotal()//資料總筆數
        const total = Math.ceil(Number(LogTotal[0].total) / Number(conditionData.limit))//最大頁數
        return res.json({//回傳成功
            code: 200,
            msg: "回傳成功",
            data: {
                total: total,//最大頁數
                list: loginLogs
            }
        });

    },
    tagsList: async (req, res) => {//標籤列表
        const conditionData = pagination(req) //分頁設定
        const tags = await TagsList(conditionData)//呼叫標籤列表 傳入排序分頁等設定
        const tagsTotal = await TagsListTotal()//資料總筆數
        const total = Math.ceil(Number(tagsTotal[0].total) / Number(conditionData.limit))//最大頁數
        return res.json({//回傳成功
            code: 200,
            msg: "回傳成功",
            data: {
                total: total,//最大頁數
                list: tags
            }
        });

    },
    tagsAdd: async (req, res) => {//新增標籤
        const errors = validationResult(req)
        if (!errors.isEmpty()) {//是否有正確填寫欄位值
            const error_msg = errorMessage(errors)//取得錯誤訊息
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "新增失敗",
                data: error_msg
            });
        } else {
            const tagsData = {
                title: req.body.title,
                content: req.body.content,
                remark: req.body.remark,
                domain: req.body.domain,
                domain_name: req.body.domain_name
            }
            const TagsAdd = await TagsInsert(tagsData)//寫入資料庫
            const TagsAddRt = await TagsInsertRt(TagsAdd.insertId)//回傳成功表

            return res.json({//回傳成功
                code: 200,
                msg: "新增標籤成功",
                data: TagsAddRt
            });
        }//檢查是否正確欄位填寫END

    },
    tagsUpdate: async (req, res) => {//編輯標籤
        const errors = validationResult(req)
        if (!errors.isEmpty()) {//是否有正確填寫欄位值
            const error_msg = errorMessage(errors)//取得錯誤訊息
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "新增失敗",
                data: error_msg
            });
        } else {
            const tagsData = {
                title: req.body.title,
                content: req.body.content,
                remark: req.body.remark,
                domain: req.body.domain,
                domain_name: req.body.domain_name
            }
            await TagsUpdate(tagsData, req.body.id)//寫入資料庫
            const TagsUpdateRt = await TagsInsertRt(req.body.id)//回傳成功表

            return res.json({//回傳成功
                code: 200,
                msg: "新增標籤成功",
                data: TagsUpdateRt
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


function MemberRt(data) {//查看 銀
    let sql = 'SELECT * FROM `members` where id=?'
    let dataList = query(sql, [data])
    return dataList
}


function teacherData(data) {//會員列表
    let sql = "select account from members where id=?"
    let dataList = query(sql, [data])
    return dataList
}





function MList(data) {//會員錢包列表
    let sql = "SELECT a.id,a.account,b.title FROM members a left join members_wallet b on a.id=b.member_id where title is null order by a.id ASC "
    let dataList = query(sql)
    return dataList
}

function walletList(data) {//會員錢包列表
    let sql = "select * from members_wallet where member_id=?"
    let dataList = query(sql, [data])
    return dataList
}

function walletListWithdraw(data) {//會員錢包列表 取款
    let sql = "SELECT member_id,sum(amount) as amount FROM `members_wallet_log` where status='pending' and type='deposit' and member_id=?"
    let dataList = query(sql, [data])
    return dataList
}

function membersData(data) {//會員列表
    let sql = "select a.id,a.account,a.status,a.name,b.name as group_title,a.currency,c.title as tagsTitle,a.agency_team_id,a.teacher_code,a.teacher_id,a.email,a.phone,a.sms_check,a.IM1,a.IM2,a.pic1,a.pic2,a.birthday,a.city,a.country,a.bank_account,a.Createtime,a.Lasttime,a.ip,a.register_ip,d.status as online_status from members as a left join hierarchy_detail as b on a.hierarchy_detail_id=b.id left join tags as c on a.tags=c.id left join members_state d on a.id=d.member_id where a.id=?"
    let dataList = query(sql, [data])
    return dataList
}
function membersSate(data) {//會員在線狀態確認
    let sql = "select * from members_state where member_id=?"
    let dataList = query(sql, [data])
    return dataList
}
function membersSateDel(data) {//會員在線剔除
    let sql = "delete from members_state where member_id=?"
    let dataList = query(sql, [data])
    return dataList
}

function memberResetPwd(data, data2) {//會員密碼更新
    let sql = "update members set pwd=? where id=?"
    let dataList = query(sql, [data, data2])
    return dataList
}
function membersPic1(data, data2) {//會員PIC更新
    let sql = "update members set pic1=? where  id=?"
    let dataList = query(sql, [data, data2])
    return dataList
}
function membersPic2(data, data2) {//會員PIC2更新
    let sql = "update members set pic2=? where id=?"
    let dataList = query(sql, [data, data2])
    return dataList
}
function MemberList(data) {//會員列表
    let sql = "select a.id,a.account,a.name,b.name as group_title,a.currency,c.title tagsTitle,a.agency_team_id,a.teacher_code,a.email,a.phone,a.sms_check,a.IM1,a.IM2,a.city,a.bank_account,a.Createtime from members as a left join hierarchy_detail as b on a.hierarchy_detail_id=b.id left join tags as c on a.tags=c.id  order by a." + data.orderBy + " " + data.order + " limit ?,?"
    //let sql = "select a.id,a.account,a.name,b.name as group_title,a.currency,c.title tagsTitle,a.agency_team,a.teacher_code,a.email,a.phone,a.sms_check,a.IM1,a.IM2,a.city,a.bank_account,a.Createtime,d.amount from members as a left join hierarchy_detail as b on a.group_id=b.id left join tags as c on a.tags=c.id left join (select id,member_id,sum(amount) as amount from members_wallet group by member_id) as d on a.account=d.member_id  order by a." + data.orderBy + " " + data.order + " limit ?,?"
    let dataList = query(sql, [Number(data.skip), Number(data.limit)])
    return dataList
}

function MemberListTotal() {//會員列表總數
    let sql = 'SELECT count(*) as total FROM `members` '
    let dataList = query(sql)
    return dataList
}
function MembersAmount(data) {
    let sql = "select id,member_id,sum(amount) as amount from members_wallet where member_id=?"
    let dataList = query(sql, [data])
    return dataList
}
function MembersDeposit(data) {
    let sql = "select id,member_id,sum(amount) as amount from members_wallet_log where member_id=? and type='deposit'"
    let dataList = query(sql, [data])
    return dataList
}
function MembersDepositTotal(data) {
    let sql = "select count(*) as total from members_wallet_log where member_id=? and type='deposit'"
    let dataList = query(sql, [data])
    return dataList
}
function MembersWithdraw(data) {
    let sql = "select id,member_id,sum(amount) as amount from members_wallet_log where member_id=? and type='withdraw'"
    let dataList = query(sql, [data])
    return dataList
}
function MembersWithdrawTotal(data) {
    let sql = "select count(*) as total from members_wallet_log where member_id=? and type='withdraw'"
    let dataList = query(sql, [data])
    return dataList
}

function MemberInsert(data) {//寫入MEMBERS資料庫
    let sql = 'INSERT INTO members SET ?'
    let dataList = query(sql, data)
    return dataList
}
function MembersWallet(data) {//寫入會員錢包資料庫
    let sqlMain = 'INSERT INTO members_wallet SET member_id=?,title="Main"'//主錢包
    let sqlMains = query(sqlMain, [data])

    let sqlPoker = 'INSERT INTO members_wallet SET member_id=?,title="Poker"'//Poker錢包
    let sqlPokers = query(sqlPoker, [data])

    return sqlMains
}

function BankCardInsert(data) {//寫入MEMBERS資料庫
    let sql = 'INSERT INTO members_bank_card SET ?'
    let dataList = query(sql, data)
    return dataList
}

function BankCardRt(data) {//查看 銀行卡
    let sql = 'SELECT * FROM `members_bank_card` where id=?'
    let dataList = query(sql, [data])
    return dataList
}
function MemberRemarkInsert(data) {//寫入MEMBERS_Remark資料庫
    let sql = 'INSERT INTO members_remark SET ?'
    let dataList = query(sql, data)
    return dataList
}

function MemberBankCardDel(data) {//刪除MEMBERS_Remark資料庫
    let sql = 'DELETE FROM `members_bank_card` WHERE id=?'
    let dataList = query(sql, [data.id])
    return dataList
}

function MemberRemarkDel(data) {//刪除MEMBERS_Remark資料庫
    let sql = 'DELETE FROM `members_remark` WHERE id=?'
    let dataList = query(sql, [data.id])
    return dataList
}
function GroupList(data) {//組列表
    let sql = 'SELECT * FROM `hierarchy_group` order by ' + data.orderBy + ' ' + data.order + ' limit ?,?'
    let dataList = query(sql, [Number(data.skip), Number(data.limit)])
    return dataList
}

function GroupListTotal() {//組列表總數
    let sql = 'SELECT count(*) as total FROM `hierarchy_group` '
    let dataList = query(sql)
    return dataList
}


function MemberRemarkList(member_id, data) {//組列表
    let sql = 'SELECT * FROM `members_remark` where member_id=? order by ' + data.orderBy + ' ' + data.order + ' limit ?,?'
    let dataList = query(sql, [member_id, Number(data.skip), Number(data.limit)])
    return dataList
}

function MemberRemarkListTotal(data) {//組列表總數
    let sql = 'SELECT count(*) as total FROM `members_remark` where  member_id=?'
    let dataList = query(sql, [data])
    return dataList
}


function membersBankCardList(member_id, data) {//銀行卡列表
    let sql = 'SELECT * FROM `members_bank_card` where member_id=? order by ' + data.orderBy + ' ' + data.order + ' limit ?,?'
    let dataList = query(sql, [member_id, Number(data.skip), Number(data.limit)])
    return dataList
}

function membersBankCardTotal(data) {//銀行卡列表總數
    let sql = 'SELECT count(*) as total FROM `members_bank_card` where  member_id=?'
    let dataList = query(sql, [data])
    return dataList
}


function GroupDetailList(data) {//組列表
    let sql = 'SELECT * FROM `hierarchy_detail` order by ' + data.orderBy + ' ' + data.order + ' limit ?,?'
    let dataList = query(sql, [Number(data.skip), Number(data.limit)])
    return dataList
}

function GroupDetailListTotal() {//組列表總數
    let sql = 'SELECT count(*) as total FROM `hierarchy_detail` '
    let dataList = query(sql)
    return dataList
}



function GroupLogList(data) {//LOG列表
    let sql = 'select c.id,c.Createtime,c.account,c.currency,c.adjust_type,c.g_original,d.name as g_new,c.Updateuser from (SELECT a.id,a.Createtime,a.account,a.currency,a.adjust_type,b.name as g_original,a.group_new,a.Updateuser FROM `members_group_log` a left join hierarchy_detail b on a.group_original=b.id) c left join hierarchy_detail d on c.group_new=d.id order by ' + data.orderBy + ' ' + data.order + ' limit ?,?'
    let dataList = query(sql, [Number(data.skip), Number(data.limit)])
    return dataList
}

function GroupLogListTotal() {//組列表總數
    let sql = 'SELECT count(*) as total FROM `members_group_log` '
    let dataList = query(sql)
    return dataList
}

function GroupInsert(data) {//寫入層級組資料庫
    let sql = 'INSERT INTO  hierarchy_group set ? '
    let dataList = query(sql, [data])
    return dataList
}


function RtMemberGroup(data) {//更新層級組資料庫
    let sql = 'select * from members where find_in_set(account,?)'
    let dataList = query(sql, [data])
    return dataList
}
function MemberGroupUpdate(data) {//更新層級組資料庫
    let sql = 'update members set group_id=?,currency=? where account=?'
    let dataList = query(sql, [data.group_id, data.currency, data.account])

    let logSQL = "INSERT INTO `members_group_log`( `account`, `currency`, `adjust_type`, `group_original`, `group_new`, `Updateuser`) VALUES(?,?,?,?,?,?)"
    let logInsert = query(logSQL, [data.account, data.currency, "manual", data.group_original, data.group_id, data.Updateuser])
    return dataList
}

function GroupUpdate(data) {//編輯層級組資料庫
    let sql = 'update hierarchy_group set group_name=?,currency=?,status=?,content=?,auto_rank=?,date_range=?,upgrade_con=?,reserve_upgrade=?,reserve_level=?,show_status=? where id=?'
    console.log(sql)
    let dataList = query(sql, [data.group_name, data.currency, data.status, data.content, data.auto_rank, data.date_range, data.upgrade_con, data.reserve_upgrade, data.reserve_level, data.show_status, data.id])
    return dataList
}
function GroupDetailUpdate(data) {//更新層級組資料庫
    let sql = 'update hierarchy_detail set name=?,name_show=?,upgrade_deposit=?,upgrade_bet=?,reserve_deposit=?,reserve_bet=?,deposit_min=?,deposit_max=?,withdraw_max=?,withdraw_min=?,withdraw_max_day=?,withdraw_remind=?,withdraw_remind_day=? where id=?'
    let dataList = query(sql, [data.name, data.name_show, data.upgrade_deposit, data.upgrade_bet, data.reserve_deposit, data.reserve_bet, data.deposit_min, data.deposit_max, data.withdraw_max, data.withdraw_min, data.withdraw_max_day, data.withdraw_remind, data.withdraw_remind_day, data.id])
    return dataList
}

function GroupDetailInsert(data) {//寫入層級組資料庫
    let sql = 'INSERT INTO  hierarchy_detail set ? '
    let dataList = query(sql, [data])
    return dataList
}

function MemberUpdateTags(data) {//更新MEMBER TAGS
    let sql = 'update members set tags=? where id=?'
    let dataList = query(sql, [data.tags, data.id])
    return dataList
}
function MemberUpdateTeam(data) {//更新MEMBER Team
    let sql = 'update members set agency_team_id=? where id=? '
    let dataList = query(sql, [data.agency_team_id, data.id])
    return dataList
}
function MemberUpdateVip(data) {//更新MEMBER Team
    let sql = 'update members set hierarchy_detail_id=? where id=? '
    let dataList = query(sql, [data.hierarchy_detail_id, data.id])
    return dataList
}

function MembersRt(data) {//查看Members
    let sql = 'SELECT * FROM `members` where id=?'
    let dataList = query(sql, [data])
    return dataList
}

function MembersGroupRt(data) {//查看Members
    let sql = 'SELECT * FROM `members` where account=?'
    let dataList = query(sql, [data])
    return dataList
}
function MembersRemarkRt(data) {//查看Members
    let sql = 'SELECT * FROM `members_remark` where id=?'
    let dataList = query(sql, [data])
    return dataList
}

function GroupRt(data) {//查看hierarchy_group
    let sql = 'SELECT * FROM `hierarchy_group` where id=?'
    let dataList = query(sql, [data])
    return dataList
}

function GroupDetailRt(data) {//查看hierarchy_detail
    let sql = 'SELECT * FROM `hierarchy_detail` where id=?'
    let dataList = query(sql, [data])
    return dataList
}



function groupInfo(data) {//找尋組細項
    let sql = 'select * from hierarchy_group where id=?'
    let dataList = query(sql, [data])
    return dataList
}
function memberGroupCount(data) {//找尋組別會員數量
    let sql = 'select count(*) as total from members where hierarchy_detail_id=?'
    let dataList = query(sql, [data])
    return dataList
}

function Select_deposit_bank(data) {//收款銀行
    let sql = "select bank from finance_account where vip_level like '%,"+data+",%' and bank_type='銀行'"
    let dataList = query(sql)
    return dataList
}

function deposit_third(data) {//收款銀行
    let sql = "select bank from finance_account where vip_level like '%,"+data+",%' and bank_type!='銀行'"
    let dataList = query(sql)
    return dataList
}

function deposit_payment(data) {//出款
    let sql = "select title from third_platform where hierarchy_detail_id=?"
    let dataList = query(sql,[data])
    return dataList
}


function groupDetailInfo(data) {//找尋組
    let sql = 'select * from hierarchy_detail where id=?'
    let dataList = query(sql, [data])
    return dataList
}
function SelectMembers(data) {//找尋Member
    let sql = 'select * from members where account=?'
    let dataList = query(sql, [data])
    return dataList
}


function SelectMembers_Check(data) {//找尋Member
    let sql = 'select * from members where id=?'
    let dataList = query(sql, [data.id])
    return dataList
}
function MemberUpdate(data, data2) {//Update Member
    let sql = 'update members set ? where id=?'
    let dataList = query(sql, [data, data2.id])
    return dataList
}
function membersLayerUpdate(data) {//Update Member
    let sql = 'update members set teacher_id=? where  id=?'
    let dataList = query(sql, [data.teacher_id, data.id])
    return dataList
}

function SelectMembers2(data) {//找尋Member
    let sql = 'select * from members where id=?'
    let dataList = query(sql, [data])
    return dataList
}

function SelectRemark(data) {//找尋Member
    let sql = 'select * from members_remark where id=? '
    let dataList = query(sql, [data.id])
    return dataList
}

function SelectBankCard(data) {//找尋銀行卡
    let sql = 'select * from members_bank_card where id=?'
    let dataList = query(sql, [data.id])
    return dataList
}

function SelectAgencyTeam(data) {//找尋是否有代理團隊id
    let sql = 'select id as agency_team_id,account,name from agency_team order by account ASC'
    let dataList = query(sql)
    return dataList
}
function SelectTeams(data) {//找尋是否有代理團隊id
    let sql = 'select * from agency_team where id=?'
    let dataList = query(sql, [data])
    return dataList
}


function SelectVips(data) {//找尋是否有Vip團隊id
    let sql = 'select * from hierarchy_detail where id=?'
    let dataList = query(sql, [data])
    return dataList
}

function SelectGroup(data) {//找尋組別
    let sql = 'select * from hierarchy_group where group_name=?'
    let dataList = query(sql, [data])
    return dataList
}
function SelectGroup2(data) {//找尋組別
    let sql = 'select * from hierarchy_group where id=?'
    let dataList = query(sql, [data])
    return dataList
}

function SelectDetail(data) {//找尋組別
    let sql = 'select * from hierarchy_group where id=?'
    let dataList = query(sql, [data])
    return dataList
}

function SelectGroupCheck(data) {//找尋組別
    let sql = 'select * from hierarchy_group where id=?'
    let dataList = query(sql, [data])
    return dataList
}


function SelectMembers_Status(data) {//找尋Member
    let sql = 'select * from members where id=?'
    let dataList = query(sql, [data.id])
    return dataList
}

function membersStatusUpdate(data) {//Update Member
    let sql = 'update members set status=? where id=?'
    let dataList = query(sql, [data.status, data.id])
    return dataList
}

function NewMemberList(data) {//新註冊會員列表
    let sql = 'select * from members where 	Createtime between "' + moment().format('YYYY-MM-DD 00:00:00') + '" and "' + moment().format('YYYY-MM-DD 23:59:59') + '" order by ' + data.orderBy + ' ' + data.order + ' limit ?,?'
    let dataList = query(sql, [Number(data.skip), Number(data.limit)])
    return dataList
}

function NewMemberListTotal() {//會員列表總數
    let sql = 'SELECT count(*) as total FROM `members` where  Createtime between "' + moment().format('YYYY-MM-DD 00:00:00') + '" and "' + moment().format('YYYY-MM-DD 23:59:59') + '"'
    let dataList = query(sql)
    return dataList
}

function membersDepositList(data, data2) {//會員總存款列表
    let sql = 'select * from members_wallet_log where type="deposit" and member_id=? order by ' + data.orderBy + ' ' + data.order + ' limit ?,?'
    let dataList = query(sql, [data2.member_id, Number(data.skip), Number(data.limit)])
    return dataList
}

function membersDepositListTotal(data) {//會員總存款列表總數
    let sql = 'SELECT count(*) as total from members_wallet_log where type="deposit" and member_id=?'
    let dataList = query(sql, [data.member_id])
    return dataList
}

function membersWithdrawList(data, data2) {//會員總取款列表
    let sql = 'select * from members_wallet_log where type="withdraw" and member_id=? order by ' + data.orderBy + ' ' + data.order + ' limit ?,?'
    let dataList = query(sql, [data2.member_id, Number(data.skip), Number(data.limit)])
    return dataList
}

function membersWithdrawListTotal(data) {//會員總取款列表總數
    let sql = 'SELECT count(*) as total from members_wallet_log where type="withdraw" and member_id=?'
    let dataList = query(sql, [data.member_id])
    return dataList
}
function NewMemberCount() {//新註冊會員列表
    let sql = 'select count(*) as total from members where Createtime between "' + moment().format('YYYY-MM-DD 00:00:00') + '" and "' + moment().format('YYYY-MM-DD 23:59:59') + '"'
    let dataList = query(sql)
    return dataList
}


function NewMemberDepositCount() {//新註冊會員(存款)
    let sql = 'select count(*) as total from members a left join members_wallet_log b on a.account=b.member_id where b.type="deposit" and a.Createtime between "' + moment().format('YYYY-MM-DD 00:00:00') + '" and "' + moment().format('YYYY-MM-DD 23:59:59') + '"  group by b.member_id'
    let dataList = query(sql)
    return dataList
}

function NewMemberCount_Week() {//新註冊會員(上方數續)
    let sql = "SELECT count(*) as total FROM members WHERE YEARWEEK(date_format(Createtime,'%Y-%m-%d')) = YEARWEEK(now())"
    let dataList = query(sql)
    return dataList
}

function NewMemberDepositCount_Weel() {//新註冊會員本周(存款)
    let sql = 'select count(*) as total from members a left join members_wallet_log b on a.account=b.member_id where b.type="deposit" and  YEARWEEK(date_format(a.Createtime,"%Y-%m-%d")) = YEARWEEK(now())  group by b.member_id'
    let dataList = query(sql)
    return dataList
}

function NewMemberCount_LastWeek() {//新註冊會員列表
    let sql = "SELECT count(*) as total FROM members WHERE YEARWEEK(date_format(Createtime,'%Y-%m-%d')) = YEARWEEK(now())-1"
    let dataList = query(sql)
    return dataList
}

function NewMemberDepositCount_LastWeel() {//新註冊會員本周(存款)
    let sql = 'select count(*) as total from members a left join members_wallet_log b on a.account=b.member_id where b.type="deposit" and YEARWEEK(date_format(a.Createtime,"%Y-%m-%d")) = YEARWEEK(now())-1  group by b.member_id'
    let dataList = query(sql)
    return dataList
}




function loginLog(data) {//登入失敗列表
    let sql = 'SELECT * FROM `login_log` where status !="登入成功" order by ' + data.orderBy + ' ' + data.order + ' limit ?,?'
    let dataList = query(sql, [Number(data.skip), Number(data.limit)])
    return dataList
}
function loginLogTotal() {//登入失敗列表
    let sql = 'SELECT count(*) as total FROM `login_log` where status !="登入成功"'
    let dataList = query(sql)
    return dataList
}

function TagsList(data) {//標籤列表
    //let sql = 'SELECT * FROM `tags` order by ' + data.orderBy + ' ' + data.order + ' limit ?,?'
    let sql = 'select a.id,a.title,a.content,count(b.id)as total,a.domain,a.domain_name,a.Createuser,a.Createtime,a.remark from tags a left join members b on a.id=b.tags group by (a.id) order by a.' + data.orderBy + ' ' + data.order + ' limit ?,?'
    let dataList = query(sql, [Number(data.skip), Number(data.limit)])
    return dataList
}


function TagsListTotal() {//標籤列表總數
    let sql = 'SELECT count(*) as total FROM `tags` '
    let dataList = query(sql)
    return dataList
}
function TagsInsert(data) {//寫入Tags資料庫
    let sql = 'INSERT INTO tags SET ?'
    let dataList = query(sql, data)
    return dataList
}
function TagsUpdate(data, data2) {//更新Tags資料庫
    let sql = 'update tags SET ? where id=?'
    let dataList = query(sql, [data, data2])
    return dataList
}

function TagsInsertRt(data) {//查看Tags
    let sql = 'SELECT * FROM `tags` where id=?'
    let dataList = query(sql, [data])
    return dataList
}

function teacherList(data) {//查看列表
    let sql = "SELECT id,account FROM `members` where teacher_status='enable' and teacher_code<>'' and id<>?"
    let dataList = query(sql, [data])
    return dataList
}

function vipList(data) {//查看列表
    let sql = "SELECT id as vip_id,name FROM `hierarchy_detail` order by id ASC"
    let dataList = query(sql, [data])
    return dataList
}

function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

function teacherCode() {
    let sql = 'select substring(md5(rand()),1,8) as code FROM members WHERE "teacher_code" NOT IN (SELECT teacher_code FROM members) LIMIT 1'
    let dataList = query(sql)
    return dataList
}

function membersLayerStart(data) {
    let sql = 'update members set teacher_code=? where id=?'
    let dataList = query(sql, [data.teacher_code, data.member_id])
    return dataList
}
module.exports = backendMembersController;