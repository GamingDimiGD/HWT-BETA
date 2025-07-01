import { toVerticalWords } from "./options/regexAndEscapeChar.js";
import { homeworkList, addHW } from "./script.js";
$('.exit-preview').on("click", () => {
    $('.hw-container').empty();
    homeworkList.forEach(hw => addHW(hw))
    $('.exit-preview').attr('hidden', true)
    $('.input-container').attr('hidden', false)
})
export const preview = (homeworkData) => {
    $('.hw-container').empty();
    homeworkData.forEach(hw => {
        const input = hw.text
        const hwI = homeworkData.indexOf(homeworkData.find((h) => h.text === input))
        console.log(hw, hwI, input)
        let eleText = `<div class="hw" --data-index="${hwI}" ><b class="num">${hwI + 1}.</b><b class="hw-text"></b></div>`
        $('.hw-container').append(eleText)
        $(`.hw[--data-index="${hwI}"] .hw-text`).text(input)
        if (homeworkData[hwI]) {
            $(`.hw[--data-index="${hwI}"]`).css('color', homeworkData[hwI].color)
        }
    })
    $('.exit-preview').attr('hidden', false)
    $('.input-container').attr('hidden', true)
    toVerticalWords(homeworkData)
}