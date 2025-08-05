import { alertModal } from "../modal.js"
import { hwt, addHW, homeworkList, updateDayAndSave } from "../script.js"
export const updateHistory = () => {
    hwt.history.sort((a, b) => b.timestamp - a.timestamp)
    hwt.history = hwt.history.slice(0, 150)
    updateDayAndSave()
    $('.history-list').empty()
    hwt.history.forEach(h => {
        let ele = $(`<div class="action">
                    <div class="text">
                        
                    </div>
                    <div class="action-actions">
                        <div class="action-type ${h.action.toLowerCase()}"></div>
                        <button class="delete-action"><i class="fa-solid fa-trash" aria-hidden="true"></i></button>
                        <button class="re-add"><i class="fa-solid fa-plus" aria-hidden="true"></i></button>
                    </div>
                </div>`)
        $('.history-list').append(ele)
        ele.find('.text').text(h.text)
        ele.find('.text').css('color', h.color)
        if (h.action === 'AI') ele.find('.action-type.ai').text('AI')
        if (h.action === 'WRITE') ele.find('.action-type').html(`<i class="fa-solid fa-plus" aria-hidden="true"></i>`)
        if (h.action === 'UPDATE') ele.find('.action-type').html(`<i class="fa-solid fa-pen" aria-hidden="true"></i>`)
        if (h.action === 'DELETE') ele.find('.action-type').html(`<i class="fa-solid fa-trash" aria-hidden="true"></i>`)

        ele.find('.delete-action').on('click', () => {
            alertModal('確定刪除?', [{
                text: '確定', onclick: () => {
                    hwt.history.splice(hwt.history.indexOf(h), 1)
                    updateHistory()
            } }, '取消'])
        })
        ele.find('.re-add').on('click', () => {
            if (homeworkList.map(hw => hw.text).includes(h.text)) return alertModal('不可以重複!');
            let hw = {
                text: h.text,
                color: h.color
            }
            homeworkList.push(hw)
            $.jStorage.set('hw', homeworkList)
            addHW(hw)
            hwt.history.push({
                text: hw.text,
                color: hw.color,
                timestamp: Date.now(),
                action: 'WRITE'
            })
            updateHistory()
            $('.modal').removeClass('show')
        })
    })
    if ($('.history-list *').length === 0) $('.history-list').text('無紀錄')
}