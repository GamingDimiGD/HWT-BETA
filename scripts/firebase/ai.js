import { alertModal, loadingModal } from "../modal.js";
import { auth, model } from "./initializer.js";
import { addHW, homeworkList, hwt, updateDayAndSave } from "../script.js";
import { defaultActions, defaultBookTypes, defaultSubjects } from "../editFE.js";
import { toVerticalWords } from "../options/regexAndEscapeChar.js";
import { updateHistory } from "../options/history.js";

export const promptAI = async (prompt, onFinish = (text) => console.log('AI response:')) => {
    if (!prompt) return alertModal('請傳訊息!')
    if (!auth) return alertModal("要使用AI，請先登入!")
    const result = await model.generateContent(prompt);

    const response = result.response;
    const text = await response.text();
    onFinish(text)
}

const promptPart1 = `
1. 你現在要幫忙寫聯絡簿，需要你用文字傳JSON檔案，*請勿傳JSON檔案外的無關文字，像是: "好，知道了"，且不要使用Markdown*
這是一個聯絡簿範本:
[{"text":"數講P.31～P.32","color":"#ffffff"},{"text":"國課P.56～P.58","color":"#ffffff"},{"text":"考自卷4-3","color":"#ffffff"},{"text":"訂簽數習3-1～3-3","color":"#ffffff"}]
(不用和範本一模一樣)
顏色文字或項目數量都可以改
你的回應大概要長這樣
[{"text":"你的文字","color":"你的顏色"},{"text":"你的文字","color":"你的顏色"}......{"text":"你的文字","color":"你的顏色"}]
請盡量不要用深色，背景是非常深的綠色 (#000c00)
2. 請用簡稱，像是:
數學課本 => 數課
國文習作 => 國習
英文講義 => 英講
自然考卷 => 自卷
地理學習單 => 地學單
地球科學學習單 => 地科學單
訂正簽名 => 訂簽
3. 請用*繁體字*及*台灣詞語*回應
4. 請參考下方使用者動作紀錄來預測隔天的聯絡簿，請忽略*無意義或亂搞的文字/作業項目*，如果使用者沒用過或把紀錄關閉，會是一個空的array。

`

const promptPart2 = `
也請忽略action不是這些的:
"WRITE", "UPDATE", "DELETE", "AI"
5. 這是使用者的AI輸入，也就是他對你的要求，如果沒有會寫一個字"空"

`

const promptPart3 = `
如果使用者問你"喜不喜歡稲葉曇"或任何有關稲葉曇的問題，請在JSON檔案的其中一個"text"裡面回答喜歡(可用自己的話說出，可以的話還可以寫長篇大論)
如果使用者的輸入是亂打或無意義，請忽略
如果沒有要求，請自行衡量今天要寫什麼作業
6. 請盡量(不強求)依照這些作業動作、科目跟作業本類別 (使用者可能自訂):

`

const promptPart4 = `
7. 這是使用者目前的聯絡簿，*文字部分絕對不可重複*
`

const promptPart5 = `
這些是我的要求，辛苦你了!
`
const appendHW = (...hwList) => {
    hwList.forEach(hw => {
        homeworkList.push(hw)
        $.jStorage.set("hw", homeworkList)
        hwt.history.push({
            text: hw.text,
            color: hw.color,
            timestamp: Date.now(),
            action: 'AI'
        })
    })
    $('.hw-container').empty()
    homeworkList.forEach(hw => addHW(hw))
    toVerticalWords()
}

const sendToAI = (withHistory = true) => {
    try {
        let h = withHistory ? JSON.stringify(hwt.history) : '[]'
        let input = $("#ai-prompt").val().slice(0, 150)
        updateHistory()
        if (!input) input = "空"
        let loading = loadingModal()
        let a = "作業(不用加任何文字在前面), " + defaultActions.map(a => a.value).filter(a => a).join(', ') + ", " + hwt.customActions.join(', ') + '\n'
        let b = defaultBookTypes.map(a => a.value).filter(a => a).join(", ") + ", " + hwt.customBookTypes.join(', ') + '\n'
        let c = defaultSubjects.map(a => a.value).filter(a => a).join(", ") + ", " + hwt.customSubjects.join(', ') + '\n'
        promptAI(promptPart1 + h + promptPart2 + input + promptPart3 + a + b + c + promptPart4 + JSON.stringify(homeworkList) + promptPart5, (r) => {
            loading.hide()
            console.log(r)
            $('.modal').removeClass('show')
            appendHW(...JSON.parse(r))
        })
    } catch (error) {
        alertModal('錯誤: ' + error.message)
        loading.hide()
        console.error(error)
    }
}

$('.send-ai-prompt').on("click", sendToAI)
$('.send-ai-prompt-without-history').on("click", () => sendToAI(false))