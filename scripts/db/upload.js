import { alertModal } from '../modal.js';
import { db, auth } from './initializer.js'
import { homeworkList, hwt, updateDayAndSave } from '../script.js';
import { preview } from '../preview.js';
import {
    ref,
    push,
    set,
    update,
    remove,
    serverTimestamp,
    get
} from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js';

const generateRandomID = (length = 8) => {
    const idSymbols = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    let id = ''
    for (let i = 0; i < length; i++) {
        id += idSymbols[Math.floor(Math.random() * idSymbols.length)]
    }
    return id
}

$('.get-id-list').on("click", () => {
    const user = auth.currentUser
    if (!user) return alertModal('請先登入!')
    get(ref(db, 'users/' + user.uid + "/ids")).then(async snapshot => {
        if (!snapshot.exists()) return alertModal('你沒有任何代碼')
        const list = Object.keys(snapshot.val())
        alertModal('你擁有的代碼: <pre>' + list.join('</pre><pre>') + '</pre>')
    }).catch((error) => {
        alertModal("錯誤: " + error.message);
        console.error("Error getting id's:", error);
    });
})

$('.upload-hw').on('click', async () => {
    let content = homeworkList
    if (!content) return alertModal("請先輸入聯絡簿!");
    if (content.length > 15) return alertModal("作業太多了! 最多15項作業!");
    let isLegal = true;
    let illegalHWs = []
    content.forEach((hw, i) => {
        if (hw.text.length > 100) {
            isLegal = false;
            illegalHWs.push(i + 1)
        }
    });
    if (!isLegal) return alertModal(`第${illegalHWs.join(', ')}項作業超過100個字元!`);

    content = JSON.stringify(content)

    const user = auth.currentUser;
    if (!user) {
        alertModal('請先登入帳號!')
        return;
    }


    let newHomeworkId = generateRandomID();
    let newHomeworkRef = ref(db, 'homework_lists/' + newHomeworkId);
    let exists = true;
    let snapshot = await get(newHomeworkRef)
    exists = snapshot.exists()
    console.log(exists)
    while (exists) {
        newHomeworkId = generateRandomID()
        newHomeworkRef = ref(db, 'homework_lists/' + newHomeworkId);
        snapshot = await get(newHomeworkRef)
        exists = snapshot.exists();
    }

    if (newHomeworkId) {
        const homeworkData = {
            content: content,
            creatorUid: user.uid,
            timestamp: serverTimestamp()
        };
        try {
            await set(newHomeworkRef, homeworkData);
            alertModal("已上傳聯絡簿! 請記下代碼:<pre>" + newHomeworkId + "</pre>");
            console.log("ID:", newHomeworkId);
            updateDayAndSave()
            $('.upload-hw-list').removeClass('show')
            await set(ref(db, 'users/' + user.uid + '/lastUpload'), Date.now());
            await set(ref(db, 'users/' + user.uid + '/ids/' + newHomeworkId), true);
            return newHomeworkId;
        } catch (error) {
            console.error("Error creating homework list:", error);
            if (error.message === "PERMISSION_DENIED: Permission denied") alertModal("違法動作!");
            else alertModal("錯誤: " + error.message);
            $('.upload-hw-list').removeClass('show')
        }
    } else {
        console.error("Failed to generate a new homework ID.");
    }

})

$('.find-hw-with-id').on('click', () => {
    let homeworkId = prompt('輸入作業代碼')
    const homeworkRef = ref(db, `homework_lists/${homeworkId}`);
    get(homeworkRef).then(async (snapshot) => {
        if (!snapshot.exists()) {
            alertModal('沒有擁有這個代碼的作業!');
            console.log(`No homework list found with ID: ${homeworkId}`);
            return;
        }
        const data = snapshot.val();
        const homeworkData = JSON.parse(data.content)
        console.log(homeworkData)
        if (snapshot.exists()) {
            const isOwner = auth.currentUser && data.creatorUid === auth.currentUser.uid
            if (isOwner) {
                alertModal("你是這個聯絡簿的創作著，請問你要做什麼?", [
                    {
                        text: '更新',
                        onclick: () => {
                            alertModal("這會用現有的聯絡簿覆蓋過原有的雲端聯絡簿，確定更新?", [
                                {
                                    text: '確定',
                                    onclick: async () => {
                                        const homeworkRef = ref(db, `homework_lists/${homeworkId}`);
                                        let content = homeworkList;

                                        if (!content) return alertModal("請先輸入聯絡簿!");
                                        if (content.length > 15) return alertModal("作業太多了! 最多15項作業!");
                                        let isLegal = true;
                                        let illegalHWs = []
                                        content.forEach((hw, i) => {
                                            if (hw.text.length > 100) {
                                                isLegal = false;
                                                illegalHWs.push(i + 1)
                                            }
                                        });
                                        if (!isLegal) return alertModal(`第${illegalHWs.join(', ')}項作業超過100個字元!`);

                                        content = JSON.stringify(content)

                                        const updatesData = { content };
                                        try {
                                            await update(homeworkRef, updatesData);
                                            console.log("Homework list updated successfully:", homeworkId);
                                            alertModal('更新成功!')
                                        } catch (error) {
                                            alertModal("錯誤: " + error.message);
                                            console.error("Error updating homework list:", error);
                                        }
                                    }
                                }, '不確'
                            ])
                        }
                    },
                    {
                        text: "刪除",
                        onclick: async () => {
                            const homeworkRef = ref(db, `homework_lists/${homeworkId}`);
                            try {
                                await remove(homeworkRef);
                                await remove(ref(db, 'users/' + auth.currentUser.uid + '/ids/' + homeworkId))
                                console.log("Homework list deleted successfully:", homeworkId);
                                updateDayAndSave()
                                alertModal('已刪除聯絡簿')
                            } catch (error) {
                                alertModal('錯誤: ' + error.message)
                                console.error("Error deleting homework list:", error);
                            }
                        }
                    },
                    {
                        text: "預覽",
                        onclick: () => {
                            $('.cloud-hw-list.modal').removeClass('show')
                            preview(homeworkData)
                        }
                    }
                ])
                return;
            }
            $('.cloud-hw-list.modal').removeClass('show')
            preview(homeworkData)
            console.log(`Homework list found with ID ${homeworkId}:`, data);
        } else {
            alertModal('沒有擁有這個代碼的作業!')
            console.log(`No homework list found with ID: ${homeworkId}`);
        }
    }).catch(error => {
        alertModal('錯誤: ' + error.message);
        console.error(error)
    })
})

