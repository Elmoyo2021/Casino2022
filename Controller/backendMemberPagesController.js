const { query } = require('../async-db')
const { check, validationResult } = require('express-validator')
var moment = require('moment'); // require
var geoip = require('geoip-lite');
const fs = require('fs')

const backendMemberPagesController = {
    quickLink: async (req, res) => {//快捷列表
        const errors = validationResult(req)
        if (!errors.isEmpty()) {//是否有正確填寫欄位值
            const error_msg = errorMessage(errors)//取得錯誤訊息
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "查看失敗",
                data: error_msg
            });
        } else {
            const quickLinks = await quickLink()//呼叫快捷列表
            return res.json({//回傳成功
                code: 200,
                msg: "回傳成功",
                data: {
                    list: quickLinks
                }
            });
        }
    },
    quickLink_update: async (req, res) => {//快捷列表 編輯
        const checkList = await quickLinkRt(req.body.id)
        if (checkList.length <= 0) {
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
                msg: "修改失敗",
                data: error_msg
            });
        } else {
            const Data = {
                code: req.body.code,
                title: req.body.title,
                subtitle: req.body.subtitle,
                path_url: req.body.path_url,
                title_cn: req.body.title_cn,
                subtitle_cn: req.body.subtitle_cn,
                path_url_cn: req.body.path_url_cn,
                title_vn: req.body.title_vn,
                subtitle_vn: req.body.subtitle_vn,
                path_url_vn: req.body.path_url_vn,
                img: req.body.img,
                status: req.body.status,
                Updatetime: moment().format('YYYY-MM-DD HH:mm:ss'),
                Updateuser: req.session.adminInfo
            }

            const quickLinkUpdates = await quickLinkUpdate(Data, req.body.id)//寫入資料庫
            const quickLinksRt = await quickLinkRt(req.body.id)//回傳成功表

            return res.json({//回傳成功
                code: 200,
                msg: "修改成功",
                data: quickLinksRt
            });
        }//檢查是否正確欄位填寫END

    },
    quickLink_order: async (req, res) => {//快捷列表 編輯排序
        const errors = validationResult(req)
        if (!errors.isEmpty()) {//是否有正確填寫欄位值
            const error_msg = errorMessage(errors)//取得錯誤訊息
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "修改失敗",
                data: error_msg
            });
        } else {
            var OrderId = req.body.order_id.split(",");
            var Data = {}
            for (i = 0; i < OrderId.length; i++) {
                Data = {
                    sid: i + 1
                }
                await quickLinkUpdate(Data, OrderId[i])//寫入資料庫
            }

            const quickLinks = await quickLink()//呼叫快捷列表
            return res.json({//回訊息
                code: 200,
                msg: "修改成功",
                data: quickLinks
            });
        }
    },
    advertiseList: async (req, res) => {//浮動廣告管理列表
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
            const advertiseLists = await advertiseList(conditionData)//呼叫會員列表 傳入排序分頁等設定
            const advertiseListTotals = await advertiseListTotal()//資料總筆數
            const total = Math.ceil(Number(advertiseListTotals[0].total) / Number(conditionData.limit))//最大頁數
            var stime = ""
            var etime = ""
            var advertiseDetail = []
            var advertiseListsRt = []
            for (i = 0; i < advertiseLists.length; i++) {
                stime = moment(advertiseLists[i].start_time).format('YYYY-MM-DD HH:mm:ss')
                etime = moment(advertiseLists[i].end_time).format('YYYY-MM-DD HH:mm:ss')
                advertiseDetail = {
                    id: advertiseLists[i].id,
                    title: advertiseLists[i].title,
                    img: advertiseLists[i].img,
                    start_time: stime,
                    end_time: etime,
                    status: advertiseLists[i].status,
                    Updatetime: advertiseLists[i].Updatetime,
                    Updateuser: advertiseLists[i].Updateuser,
                    state: checkStatus(stime, etime, advertiseLists[i].status)
                }
                advertiseListsRt.push(advertiseDetail)
            }

            return res.json({//回傳成功
                code: 200,
                msg: "回傳成功",
                data: {
                    total: total,//最大頁數
                    list: advertiseListsRt
                }
            });
        }
    },
    advertiseListOff: async (req, res) => {//浮動廣告管理列表 非使用中
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
            const advertiseLists = await advertiseListOff(conditionData)//呼叫會員列表 傳入排序分頁等設定
            const advertiseListOffTotals = await advertiseListOffTotal()//資料總筆數
            const total = Math.ceil(Number(advertiseListOffTotals[0].total) / Number(conditionData.limit))//最大頁數
            var stime = ""
            var etime = ""
            var advertiseDetail = []
            var advertiseListsRt = []
            for (i = 0; i < advertiseLists.length; i++) {
                stime = moment(advertiseLists[i].start_time).format('YYYY-MM-DD HH:mm:ss')
                etime = moment(advertiseLists[i].end_time).format('YYYY-MM-DD HH:mm:ss')
                advertiseDetail = {
                    id: advertiseLists[i].id,
                    title: advertiseLists[i].title,
                    img: advertiseLists[i].img,
                    start_time: stime,
                    end_time: etime,
                    status: advertiseLists[i].status,
                    Updatetime: advertiseLists[i].Updatetime,
                    Updateuser: advertiseLists[i].Updateuser,
                    state: checkStatus(stime, etime, advertiseLists[i].status)
                }
                advertiseListsRt.push(advertiseDetail)
            }
            return res.json({//回傳成功
                code: 200,
                msg: "回傳成功",
                data: advertiseListsRt
            });
        }
    },
    advertiseList_add: async (req, res) => {//浮動廣告管理列表
        const errors = validationResult(req)
        if (!errors.isEmpty()) {//是否有正確填寫欄位值
            const error_msg = errorMessage(errors)//取得錯誤訊息
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "修改失敗",
                data: error_msg
            });
        } else {
            //判斷檔案是否具有副檔名
            if (req.file.originalname.lastIndexOf(".") != -1) {
                extName = req.file.originalname.slice(req.file.originalname.lastIndexOf("."));//取得副檔名
            }
            const filesName = "adImg" + moment().format('YYYYMMDD_hhmmss') + "_" + getRandom(11111, 99999) + extName;
            const Data = {
                title: req.body.title,
                img: filesName,
                start_time: req.body.start_time,
                end_time: req.body.end_time,
                status: req.body.status,
                Createtime: moment().format('YYYY-MM-DD HH:mm:ss'),
                Createuser: req.session.adminInfo,
                Updatetime: moment().format('YYYY-MM-DD HH:mm:ss'),
                Updateuser: req.session.adminInfo
            }
            const advertiseListInserts = await advertiseListInsert(Data)//寫入資料庫
            const advertiseListsRt = await advertiseListRt(advertiseListInserts.insertId)//回傳成功表
            let newPath = `uploads/pages/${filesName}`//儲存位置
            fs.rename(req.file.path, newPath, () => {//上傳圖片
                //  console.log('image uploaded successful')
            })
            fs.unlink(req.file.path, error => { }); // 刪除暫存檔
            return res.json({//回傳成功
                code: 200,
                msg: "新稱成功",
                data: advertiseListsRt
            });
        }//檢查是否正確欄位填寫END
    },
    advertiseList_update: async (req, res) => {//首頁輪播管理列表
        const errors = validationResult(req)
        if (!errors.isEmpty()) {//是否有正確填寫欄位值
            const error_msg = errorMessage(errors)//取得錯誤訊息
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "修改失敗",
                data: error_msg
            });
        } else {
            //判斷檔案是否具有副檔名
            var Data = []
            if (!req.file) {
                Data = {
                    id: req.body.id,
                    title: req.body.title,
                    start_time: req.body.start_time,
                    end_time: req.body.end_time,
                    status: req.body.status,
                    Updatetime: moment().format('YYYY-MM-DD HH:mm:ss'),
                    Updateuser: req.session.adminInfo
                }
            } else {
                extName = req.file.originalname.slice(req.file.originalname.lastIndexOf("."));//取得副檔名
                const filesName = "adImg" + moment().format('YYYYMMDD_hhmmss') + "_" + getRandom(11111, 99999) + extName;
                Data = {
                    id: req.body.id,
                    title: req.body.title,
                    img: filesName,
                    start_time: req.body.start_time,
                    end_time: req.body.end_time,
                    status: req.body.status,
                    Updatetime: moment().format('YYYY-MM-DD HH:mm:ss'),
                    Updateuser: req.session.adminInfo
                }
                let newPath = `uploads/pages/${filesName}`//儲存位置
                fs.rename(req.file.path, newPath, () => {//上傳圖片
                    //  console.log('image uploaded successful')
                })
                fs.unlink(req.file.path, error => { }); // 刪除暫存檔
            }
            const advertiseListUpdates = await advertiseListUpdate(Data, req.body.id)//更新資料庫
            const advertiseListsRt = await advertiseListRt(req.body.id)//回傳成功表

            return res.json({//回傳成功
                code: 200,
                msg: "更新成功",
                data: advertiseListsRt
            });
        }//檢查是否正確欄位填寫END
    },
    advertiseList_delete: async (req, res) => {//首頁輪播廣告管理列表 刪除
        const advertiseListsRt = await advertiseListRt(req.body.id)
        if (advertiseListsRt.length <= 0) {
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "刪除失敗,id有誤"
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
            await advertiseListDel(req.body.id)//更新資料庫

            return res.json({//回傳成功
                code: 200,
                msg: "刪除成功"
            });
        }//檢查是否正確欄位填寫END
    },
    advertiseFloat: async (req, res) => {//浮動廣告管理列表 
        const errors = validationResult(req)
        if (!errors.isEmpty()) {//是否有正確填寫欄位值
            const error_msg = errorMessage(errors)//取得錯誤訊息
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "刪除失敗",
                data: error_msg
            });
        } else {

            const data = {
                status: req.body.status,
                state: req.body.state,
                url: req.body.url,
                url_vn: req.body.url_vn,
                url_cn: req.body.url_cn,
                Updateuser: req.session.adminInfo,
                Updatetime: moment().format('YYYY-MM-DD HH:mm:ss'),
            }

            if (req.files.img_small) {
                const img_small = fileNameSet(req.files.img_small[0].originalname, req.files.img_small[0].path, 'uploads/advertiseFloat/')
                data.img_small = img_small
            }
            if (req.files.img_small_vn) {
                const img_small_vn = fileNameSet(req.files.img_small_vn[0].originalname, req.files.img_small_vn[0].path, 'uploads/advertiseFloat/')
                data.img_small_vn = img_small_vn
            }
            if (req.files.img_small_cn) {
                const img_small_cn = fileNameSet(req.files.img_small_cn[0].originalname, req.files.img_small_cn[0].path, 'uploads/advertiseFloat/')
                data.img_small_cn = img_small_cn
            }
            if (req.files.img) {
                const img = fileNameSet(req.files.img[0].originalname, req.files.img[0].path, 'uploads/advertiseFloat/')
                data.img = img
            }
            if (req.files.img_vn) {
                const img_vn = fileNameSet(req.files.img_vn[0].originalname, req.files.img_vn[0].path, 'uploads/advertiseFloat/')
                data.img_vn = img_vn
            }
            if (req.files.img_cn) {
                const img_cn = fileNameSet(req.files.img_cn[0].originalname, req.files.img_cn[0].path, 'uploads/advertiseFloat/')
                data.img_cn = img_cn
            }
            await advertiseFloatUpdate(data, req.body.id)
            const advertiseListsRt = await advertiseFloatRt(req.body.id)
            if (advertiseListsRt.length <= 0) {
                return res.json({//回傳失敗訊息
                    code: 401,
                    msg: "修改失敗,id有誤"
                });
            }
            return res.json({//回傳成功
                code: 200,
                msg: advertiseListsRt
            });
        }//檢查是否正確欄位填寫END
    },

    advertiseFloatData: async (req, res) => {//浮動廣告資料
        const advertiseFloatDatas = await advertiseFloatData(req.query.id)
        if (advertiseFloatDatas.length <= 0) {
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "查看失敗",
                data: "查無相關資料"
            });
        }
        const errors = validationResult(req)
        if (!errors.isEmpty()) {//是否有正確填寫欄位值
            const error_msg = errorMessage(errors)//取得錯誤訊息
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "查看失敗",
                data: error_msg
            });
        } else {
            return res.json({//回傳成功
                code: 200,
                msg: "回傳成功",
                data: advertiseFloatDatas

            });
        }
    },
    announcementList: async (req, res) => {//公告管理列表
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
            const announcementLists = await announcementList(conditionData)//呼叫會員列表 傳入排序分頁等設定
            const announcementTotals = await announcementTotal(req.query.member_id)//資料總筆數
            const total = Math.ceil(Number(announcementTotals[0].total) / Number(conditionData.limit))//最大頁數
            return res.json({//回傳成功
                code: 200,
                msg: "回傳成功",
                data: {
                    total: total,//最大頁數
                    list: announcementLists
                }
            });
        }
    },
    announcementAdd: async (req, res) => {//公告管理 新增
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
                title: req.body.title,
                content: req.body.content,
                an_type: req.body.an_type,
                open_state: req.body.open_state,
                status: req.body.status,
                an_start: req.body.an_start,
                an_end: req.body.an_end,
                Updatetime: moment().format('YYYY-MM-DD HH:mm:ss'),
                Updateuser: req.session.adminInfo
            }

            const announcementsInserts = await announcementInsert(Data)//寫入資料庫
            const announcementsRt = await announcementRt(announcementsInserts.insertId)//回傳成功表

            return res.json({//回傳成功
                code: 200,
                msg: "新稱成功",
                data: announcementsRt
            });
        }//檢查是否正確欄位填寫END

    },
    announcementUpdate: async (req, res) => {//公告管理 編輯
        const checkList = await announcementRt(req.body.id)
        if (checkList.length <= 0) {
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
                msg: "修改失敗",
                data: error_msg
            });
        } else {
            const Data = {
                title: req.body.title,
                content: req.body.content,
                an_type: req.body.an_type,
                open_state: req.body.open_state,
                status: req.body.status,
                an_start: req.body.an_start,
                an_end: req.body.an_end,
                Updatetime: moment().format('YYYY-MM-DD HH:mm:ss'),
                Updateuser: req.session.adminInfo
            }


            await announcementUpdate(Data, req.body.id)//寫入資料庫
            const announcementsRt = await announcementRt(req.body.id)//回傳成功表

            return res.json({//回傳成功
                code: 200,
                msg: "修改成功",
                data: announcementsRt
            });
        }//檢查是否正確欄位填寫END

    },
    announcementDel: async (req, res) => {//公告管理 刪除
        const checkList = await announcementRt(req.body.id)
        if (checkList.length <= 0) {
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "刪除失敗",
                data: "id 有誤"
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
            await announcementsDel(req.body.id)//寫入資料庫
            return res.json({//回傳成功
                code: 200,
                msg: "刪除成功"
            });
        }//檢查是否正確欄位填寫END

    },
    letterList: async (req, res) => {//會員站內信 列表
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
            const letterLists = await letterList(conditionData)//呼叫會員列表 傳入排序分頁等設定
            const letterTotals = await letterTotal(req.query.member_id)//資料總筆數
            const total = Math.ceil(Number(letterTotals[0].total) / Number(conditionData.limit))//最大頁數
            return res.json({//回傳成功
                code: 200,
                msg: "回傳成功",
                data: {
                    total: total,//最大頁數
                    list: letterLists
                }
            });
        }
    },
    letterAdd: async (req, res) => {//會員站內信 新增
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
                title: req.body.title,
                category: req.body.category,
                content: req.body.content,
                sender: req.session.adminInfo
            }

            const lettersInserts = await letterInsert(Data)//寫入資料庫

            var dataDetail = []
            var toRaw = []
            if (req.body.tomember) {//給指定會員
                toRaw = req.body.tomember.split(",")
                for (i = 0; i < toRaw.length; i++) {
                    dataDetail = {
                        members_letter_id: lettersInserts.insertId,
                        member_id: toRaw[i]
                    }
                    await toMembersInsert(dataDetail)

                }
            }
            if (req.body.togroup) {//給群組
                toRaw = req.body.togroup.split(",")
                var GroupLists = ""
                for (i = 0; i < toRaw.length; i++) {

                    GroupLists = await toGroupList(toRaw[i])
                    for (j = 0; j < GroupLists.length; j++) {
                        dataDetail = {
                            members_letter_id: lettersInserts.insertId,
                            member_id: GroupLists[j].id
                        }
                        console.log(dataDetail)
                        // await toMembersInsert(dataDetail)
                    }
                }
            }
            const lettersRt = await letterRt(lettersInserts.insertId)//回傳成功表

            return res.json({//回傳成功
                code: 200,
                msg: "新稱成功",
                data: lettersRt
            });
        }//檢查是否正確欄位填寫END

    },
    staticPageList: async (req, res) => {//靜態頁面設定
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
            const staticPageLists = await staticPagetList(conditionData)//呼叫靜態頁面設定列表 傳入排序分頁等設定
            const staticPageTotals = await staticPageTotal(req.query.member_id)//資料總筆數
            const total = Math.ceil(Number(staticPageTotals[0].total) / Number(conditionData.limit))//最大頁數
            return res.json({//回傳成功
                code: 200,
                msg: "回傳成功",
                data: {
                    total: total,//最大頁數
                    list: staticPageLists
                }
            });
        }
    },
    staticPageAdd: async (req, res) => {//靜態頁面設定 新增
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
                category: req.body.category,
                code: req.body.code,
                title: req.body.title,
                title_cn: req.body.title_cn,
                title_vn: req.body.title_vn,
                content: req.body.content,
                content_cn: req.body.content_cn,
                content_vn: req.body.content_vn,
                status: req.body.status,
                Updatetime: moment().format('YYYY-MM-DD HH:mm:ss'),
                Updateuser: req.session.adminInfo
            }

            const staticPageInserts = await staticPageInsert(Data)//寫入資料庫
            const staticPagesRt = await staticPageRt(staticPageInserts.insertId)//回傳成功表

            return res.json({//回傳成功
                code: 200,
                msg: "新稱成功",
                data: staticPagesRt
            });
        }//檢查是否正確欄位填寫END

    },
    staticPageUpdate: async (req, res) => {//靜態頁面設定 編輯
        const checkList = await staticPageRt(req.body.id)
        if (checkList.length <= 0) {
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
                msg: "修改失敗",
                data: error_msg
            });
        } else {
            const Data = {
                category: req.body.category,
                code: req.body.code,
                title: req.body.title,
                title_cn: req.body.title_cn,
                title_vn: req.body.title_vn,
                content: req.body.content,
                content_cn: req.body.content_cn,
                content_vn: req.body.content_vn,
                status: req.body.status,
                Updatetime: moment().format('YYYY-MM-DD HH:mm:ss'),
                Updateuser: req.session.adminInfo
            }


            await staticPageUpdate(Data, req.body.id)//寫入資料庫
            const staticPagesRt = await staticPageRt(req.body.id)//回傳成功表

            return res.json({//回傳成功
                code: 200,
                msg: "修改成功",
                data: staticPagesRt
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

function quickLink(data) {//快捷設置列表
    let sql = "select * from quick_link order by sid ASC"
    let dataList = query(sql)
    return dataList
}
function quickLinkUpdate(data, id) {//更新quick_link資料庫
    let sql = 'update quick_link SET ? where id=?'
    let dataList = query(sql, [data, id])
    return dataList
}
function quickLinkRt(data) {//查看quick_link
    let sql = 'SELECT * FROM `quick_link` where id=?'
    let dataList = query(sql, [data])
    return dataList
}


function advertiseListOff(data) {//浮動廣告管理列表 OFF
    let sql = " SELECT * FROM `advertise_carousel` WHERE status='disable' or start_time>='" + moment().format('YYYY-MM-DD HH:mm:ss') + "' OR end_time<'" + moment().format('YYYY-MM-DD HH:mm:ss') + "' order by ' + data.orderBy + ' ' + data.order + ' limit ?,?"
    let dataList = query(sql, [Number(data.skip), Number(data.limit)])
    return dataList
}
function advertiseList(data) {//浮動廣告管理列表
    let sql = "SELECT * FROM `advertise_carousel` WHERE status='enable' AND (start_time<='" + moment().format('YYYY-MM-DD HH:mm:ss') + "' AND end_time>='" + moment().format('YYYY-MM-DD HH:mm:ss') + "')  order by " + data.orderBy + " " + data.order + " limit ?,?"
    let dataList = query(sql, [Number(data.skip), Number(data.limit)])
    return dataList
}

function advertiseListTotal() {//浮動廣告列表總數
    let sql = " SELECT count(*) as total FROM `advertise_carousel` WHERE status='enable' AND (start_time<='" + moment().format('YYYY-MM-DD HH:mm:ss') + "' AND end_time>='" + moment().format('YYYY-MM-DD HH:mm:ss') + "')"
    let dataList = query(sql)
    return dataList
}

function advertiseListOffTotal() {//浮動廣告列表總數
    let sql = "SELECT count(*) as total FROM `advertise_carousel` WHERE status='disable' or start_time>='" + moment().format('YYYY-MM-DD HH:mm:ss') + "' OR end_time<'" + moment().format('YYYY-MM-DD HH:mm:ss') + "'"
    let dataList = query(sql)
    return dataList
}

function announcementList(data) {//公告管理列表
    let sql = 'SELECT * FROM `announcement` order by ' + data.orderBy + ' ' + data.order + ' limit ?,?'
    let dataList = query(sql, [Number(data.skip), Number(data.limit)])
    return dataList
}

function announcementTotal() {//出入款銀行列表總數
    let sql = 'SELECT count(*) as total FROM `announcement` '
    let dataList = query(sql)
    return dataList
}


function announcementInsert(data) {//更新announcement資料庫
    let sql = 'INSERT INTO announcement SET ?'//公告
    let dataList = query(sql, [data])
    return dataList
}
function announcementRt(data) {//查看announcement
    let sql = 'SELECT * FROM `announcement` where id=?'
    let dataList = query(sql, [data])
    return dataList
}
function advertiseListInsert(data) {//更新advertise_carousel資料庫
    let sql = 'INSERT INTO advertise_carousel SET ?'//浮動逛告
    let dataList = query(sql, [data])
    return dataList
}
function advertiseListUpdate(data, id) {//更新advertise_carousel資料庫
    let sql = 'update advertise_carousel SET ? where id=?'//浮動逛告
    let dataList = query(sql, [data, id])
    return dataList
}

function advertiseFloatUpdate(data, id) {//刪除advertise_carousel資料庫
    let sql = 'update advertise_float set ? where id=?'//浮動逛告
    let dataList = query(sql, [data, id])
    return dataList
}
function advertiseListDel(data, id) {//刪除advertise_carousel資料庫
    let sql = 'delete from advertise_carousel  where id=?'//浮動逛告
    let dataList = query(sql, [data])
    return dataList
}

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
module.exports = backendMemberPagesController;