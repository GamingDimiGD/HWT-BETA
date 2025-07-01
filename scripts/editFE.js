import { homeworkList, hwt, updateDayAndSave } from "./script.js";
const defaultActions = [...document.querySelectorAll('select#type option')]
const defaultSubjects = [...document.querySelectorAll("select#subject option")]
const defaultBookTypes = [...document.querySelectorAll("select#choose-book-type option")]

const type = $('select#type'), subject = $("select#subject"), bookType = $("select#choose-book-type"),
typeDisplay = $('#c-type-display'), subjectDisplay = $('#c-subject-display'), bookTypeDisplay = $('#c-book-type-display')

export const updateCustomFE = () => {
    $('select#type, select#subject, select#choose-book-type').empty()
    defaultActions.forEach(action => type.append(action))
    defaultSubjects.forEach(s => subject.append(s))
    defaultBookTypes.forEach(b => bookType.append(b))
    if (hwt.customActions.length > 0) typeDisplay.text('自訂作業動作: ')
        else typeDisplay.text("自訂作業動作: 無")
    if (hwt.customSubjects.length > 0) subjectDisplay.text('自訂科目: ')
        else subjectDisplay.text("自訂科目: 無")
    if (hwt.customBookTypes.length > 0) bookTypeDisplay.text('自訂作業本: ')
        else bookTypeDisplay.text("自訂作業本: 無")
    hwt.customActions.forEach(a => {
        type.append($("<option></option>").attr('value', a).append(a))
        let div = document.createElement("div")
        div.innerText = a
        let deleteButton = document.createElement("button")
        deleteButton.innerText = '刪除'
        deleteButton.onclick = () => {
            hwt.customActions = hwt.customActions.filter(c => c !== a)
            updateCustomFE()
            updateDayAndSave()
        }
        div.append(deleteButton)
        typeDisplay.append(div)
    })
    hwt.customSubjects.forEach(a => {
        subject.append($("<option></option>").attr('value', a).append(a))
        let div = document.createElement("div")
        div.innerText = a
        let deleteButton = document.createElement("button")
        deleteButton.innerText = '刪除'
        deleteButton.onclick = () => {
            hwt.customSubjects = hwt.customSubjects.filter(c => c !== a)
            updateCustomFE()
            updateDayAndSave()
        }
        div.append(deleteButton)
        subjectDisplay.append(div)
    })
    hwt.customBookTypes.forEach(a => {
        bookType.append($("<option></option>").attr('value', a).append(a))
        let div = document.createElement("div")
        div.innerText = a
        let deleteButton = document.createElement("button")
        deleteButton.innerText = '刪除'
        deleteButton.onclick = () => {
            hwt.customBookTypes = hwt.customBookTypes.filter(c => c !== a)
            updateCustomFE()
            updateDayAndSave()
        }
        div.append(deleteButton)
        bookTypeDisplay.append(div)
    })
    $('select#type, select#subject, select#choose-book-type').val('')
}

$('#edit-fe-type button').on("click", () => {
    const input = $('#edit-fe-type input')
    if (!input.val().trim() || hwt.customActions.includes(input.val().trim())) return;
    hwt.customActions.push(input.val().trim())
    updateCustomFE()
    updateDayAndSave()
    input.val('')
})
$('#edit-fe-subject button').on("click", () => {
    const input = $('#edit-fe-subject input')
    if (!input.val().trim() || hwt.customSubjects.includes(input.val().trim())) return;
    hwt.customSubjects.push(input.val().trim())
    updateCustomFE()
    updateDayAndSave()
    input.val('')
})
$('#edit-fe-book-type button').on("click", () => {
    const input = $('#edit-fe-book-type input')
    if (!input.val().trim() || hwt.customBookTypes.includes(input.val().trim())) return;
    hwt.customBookTypes.push(input.val().trim())
    updateCustomFE()
    updateDayAndSave()
    input.val('')
})