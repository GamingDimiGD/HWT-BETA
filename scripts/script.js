import { alertModal } from "./modal.js";
import { toVerticalWords } from "./options/regexAndEscapeChar.js"
import { updateCustomFE } from './editFE.js'
import { updateTextSize } from "./options/textSize.js";
export let homeworkList = $.jStorage.get('hw') || []

const emptySave = {
    options: {},
    customActions: [], customSubjects: [], customBookTypes: [],
    textSize: 1,
    history: [],
}

$.each($('.option-display div input'), (i, e) => {
    e = $(e)
    emptySave.options[e.attr('id')] = e.attr("data-default") === 'true' ? true : false;
})

export let hwt = $.jStorage.get("HWT") || emptySave

if (Object.keys(hwt).length < Object.keys(emptySave).length) {
    Object.keys(emptySave).forEach(key => {
        if (!hwt.hasOwnProperty(key)) {
            hwt[key] = emptySave[key]
        }
    })
}
if (Object.keys(hwt).length > Object.keys(emptySave).length) {
    Object.keys(hwt).forEach(key => {
        if (!emptySave.hasOwnProperty(key)) {
            delete hwt[key]
        }
    })
}

$.each($('.option-display div input'), (i, e) => {
    e = $(e)
    if (hwt.options[e.attr('id')]) e.attr("checked", 'checked')
    e.on("click", () => {
        e.attr("checked", e.attr("checked") ? false : true)
    })
})

$.each($('.out'), (_, b) => {
    $(b).on("click", () => {
        $(b.parentNode).removeClass("show")
    })
})

if (hwt.options['show-welcome']) {
    $('.welcome.modal').addClass('show')
}

updateCustomFE()
updateTextSize()

export const updateDayAndSave = () => {
    $('.y').html(new Date().getFullYear() - 1911)
    $('.m').html(new Date().getMonth() + 1)
    $('.d').html(new Date().getDate())
    const getDay = () => {
        const day = new Date().getDay()
        return ['日', '一', '二', '三', '四', '五', '六'][day]
    }
    
    $('.day').html(getDay())
    
    $.jStorage.set("HWT", hwt)
    
}

updateDayAndSave()
$('.stop-showing').on("click", () => {
    $('.welcome.modal').removeClass('show')
    $('#show-welcome').attr('checked', false)
    hwt.options['show-welcome'] = false
    updateDayAndSave()
})

setInterval(updateDayAndSave, 10000)

$('.options.modal .out').on("click", () => {
    $('.options.modal').removeClass('show')
    $.each($('.option-display div input'), (i, e) => {
        e = $(e)
        hwt.options[e.attr('id')] = e.attr('checked') ? true : false;
        updateDayAndSave()
        $('.hw-container').empty();
        homeworkList.forEach((hw) => addHW(hw))
        toVerticalWords()
    })
})

// i have committed a warcrime
let to全形 = [
    {
        i: '(',
        o: '（'
    },
    {
        i: ')',
        o: '）'
    },
    {
        i: '[',
        o: '［'
    },
    {
        i: ']',
        o: '］'
    },
    {
        i: '{',
        o: '｛'
    },
    {
        i: '}',
        o: '｝'
    },
    {
        i: '~',
        o: '～'
    }
]

const initOptionModal = (hwI) => {
    let hwText = homeworkList[hwI].text
    $('.remove, .edit, .color, .left, .right').off()
    $(`.remove`).on('click', () => {
        alertModal('確定刪除作業?', [
            {
                text: '確定',
                onclick: () => {
                    let currentHW = homeworkList[hwI]
                    hwt.history.push({
                        text: currentHW.text,
                        color: currentHW.color,
                        timestamp: Date.now(),
                        action: 'DELETE'
                    })
                    homeworkList = homeworkList.filter((hw) => hw.text !== currentHW.text)
                    $('.hw-container').empty();
                    $.jStorage.set('hw', homeworkList)
                    homeworkList.forEach((hw) => addHW(hw))
                    $('.hw-options').removeClass('show')
                }
            },
            {
                text: '取消',
                onclick: () => {
                    // 按下取消時不做任何事情 - 那個ai
                }
            }
        ])
    })
    $(`.edit`).on('click', () => {
        $('.edit-hw').addClass('show')
        $('.edit-input').val(hwText)
        $('.edit-input').focus()
        $('.save-btn')[0].onclick = () => {
            let input = $('.edit-input').val().trim()
            if (!input) return alert('請在裡面打東西!');
            if (homeworkList.find((hw) => hw.text === input)) return alertModal('不可以重複!');
            if (hwt.options['to全形']) {
                to全形.forEach(char => {
                    input = input.replaceAll(char.i, char.o)
                })
            }
            let currentHW = homeworkList[hwI]
            currentHW.text = input
            hwt.history.push({
                text: input,
                color: currentHW.color,
                timestamp: Date.now(),
                action: 'UPDATE'
            })
            $('.hw-container').empty();
            $.jStorage.set('hw', homeworkList)
            homeworkList.forEach((hw) => addHW(hw))
            hwText = input
            toVerticalWords()
            $('.edit-hw').removeClass('show')
        }
    })
    $('.color').val(homeworkList[hwI].color)
    $(`.color`).on('change', () => {
        let color = $(`.color`).val()
        let currentHW = homeworkList[hwI]
        currentHW.color = color
        hwt.history.push({
            text: currentHW.text,
            color,
            timestamp: Date.now(),
            action: 'UPDATE'
        })
        $.jStorage.set('hw', homeworkList)
        $(`.hw[--data-index="${hwI}"]`).css('color', color)
    })
    $('.left').on('click', () => {
        if (hwI < homeworkList.length - 1) {
            let temp = homeworkList[hwI]
            homeworkList[hwI] = homeworkList[hwI + 1]
            homeworkList[hwI + 1] = temp
            $('.hw-container').empty()
            homeworkList.forEach((hw) => addHW(hw))
            hwI++
            $.jStorage.set('hw', homeworkList)
            toVerticalWords()
        }
    })
    $('.right').on('click', () => {
        if (hwI > 0) {
            let temp = homeworkList[hwI]
            homeworkList[hwI] = homeworkList[hwI - 1]
            homeworkList[hwI - 1] = temp
            $('.hw-container').empty()
            homeworkList.forEach((hw) => addHW(hw))
            hwI--
            $.jStorage.set('hw', homeworkList)
            toVerticalWords()
        }
    })
}

export const addHW = (hw) => {
    let input = hw.text
    const hwI = homeworkList.indexOf(homeworkList.find((hw) => hw.text === input))
    let eleText =
        `<div class="hw" --data-index="${hwI}" ><b class="num">${hwI + 1}.</b><b class="hw-text"></b><button class="hw-options" --data-index="${hwI}"><i class="fa-solid fa-gear" aria-hidden="true"></i></button></div>`
    $('.hw-container').append(eleText)
    if (hwt.options['unsafe-input']) $(`.hw[--data-index="${hwI}"] .hw-text`).html(input)
    else $(`.hw[--data-index="${hwI}"] .hw-text`).text(input)
    $(`.hw-options[--data-index="${hwI}"]`).on('click', () => {
        $('.hw-options').addClass('show')
        initOptionModal(hwI)
    })
    if (homeworkList[hwI]) {
        $(`.color[--data-index="${hwI}"]`).val(homeworkList[hwI].color)
        $(`.hw[--data-index="${hwI}"]`).css('color', homeworkList[hwI].color)
    }
    toVerticalWords()
}

const addInput = (input) => {
    if (!input) return alert('請在裡面打東西!');
    if (hwt.options['to全形']) {
        to全形.forEach(char => {
            input = input.replaceAll(char.i, char.o)
        })
    }
    if (homeworkList.find((hw) => hw.text === input)) return alert('不可以重複!');
    homeworkList.push({
        text: input,
        color: '#ffffff',
    })
    hwt.history.push({
        text: input,
        color: '#ffffff',
        timestamp: Date.now(),
        action: 'WRITE'
    })
    $.jStorage.set('hw', homeworkList)
    addHW(input)
    $('.hw-input')[0].value = ''
    $('.hw-container').empty();
    homeworkList.forEach((hw) => addHW(hw))
}

$('.add-btn').on('click', () => {
    let input = $('.hw-input').val().trim()
    addInput(input)
})

homeworkList.forEach((hw) => addHW(hw))

document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        if ($('.edit-hw').hasClass('show')) return $('.save-btn')[0].click();
        if ($('.fast-enter').hasClass('show')) return $('.submit-fe')[0].click();
        $('.add-btn')[0].click()
    }
})

$('.clear').on('click', () => {
    alertModal('確定清除聯絡簿?', [
        {
            text: '確定',
            onclick: () => {
                homeworkList.forEach((hw) => {
                    hwt.history.push({
                        text: hw.text,
                        color: hw.color,
                        timestamp: Date.now(),
                        action: 'DELETE'
                    })
                })
                $.jStorage.deleteKey('hw');
                $('.hw-container').empty();
                homeworkList = [];
                toVerticalWords();
            }
        },
        {
            text: '取消',
            onclick: () => {
                // 按下取消時不做任何事情 - 那個ai
            }
        }
    ])
})

$('.history-button').on('click', updateHistory)

let isPageRange = true
$('.custom-range').hide()

const trm = () => {
    isPageRange = !isPageRange
    if (isPageRange) {
        $('.page-range').show();
        $('.custom-range').hide();
    } else {
        $('.page-range').hide();
        $('.custom-range').show();
    }
    $('.page-range input, #custom-range-input').val('')
}

$('.toggle-range-mode').on('click', trm)

$('.submit-fe').on('click', () => {
    if (!$('select#subject').val() || !$('select#choose-book-type').val()) return alert('作業未輸入完整!')
    if (isPageRange) {
        if (isNaN($('#page-from').val())) return alert('作業未輸入完整!')
        let text = $('select#type').val() + $('select#subject').val() + $('select#choose-book-type').val() + "P." + $('#page-from').val()
        if ($('#page-to').val() && $('#page-from').val() !== $('#page-to').val()) text += "~P." + $('#page-to').val()
        addInput(text)
    } else {
        let text = $('select#type').val() + $('select#subject').val() + $('select#choose-book-type').val() + $('#custom-range-input').val()
        addInput(text)
    }
    $('select#type, select#subject, select#choose-book-type, #page-to, #page-from, #custom-range-input').val('')
    $('.fast-enter').removeClass('show')
    return;
})

if (window.location.toString() === "https://gamingdimigd.github.io/HWT-BETA/" || window.location.toString() === "http://127.0.0.1:5500/") alertModal('歡迎來到抄聯絡簿神器測試版! 可能會有一些Bug要修復。', [
    "OK", {
        text: '我要回去',
        onclick: () => {
            window.location.href = "https://gamingdimigd.github.io/HWT/"
        }
    }
])

import { app, analytics, auth, db } from "./firebase/initializer.js"
import { } from "./firebase/upload.js"
import { updateHistory } from "./options/history.js";

if (app, analytics, auth, db) console.log('DB loaded!')