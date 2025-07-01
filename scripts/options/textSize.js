import { hwt } from "../script.js";
const cts = $('.change-text-size')

export const updateTextSize = () => {
    $('.hw-container').css("font-size", `calc(${hwt.textSize} * 3.5rem)`);
    $('.today').css("font-size", `calc(${hwt.textSize} * 4rem)`);
    cts.val(hwt.textSize)
    $('.text-size-display').text('文字大小: ' + hwt.textSize)
}

let isDragging = false

cts.on("mousedown", e => {
    isDragging = true
})

cts.on("mousemove", e => {
    if (!isDragging) return;
    hwt.textSize = cts.val()
    updateTextSize()
})

cts.on("click", e => {
    hwt.textSize = cts.val()
    updateTextSize()
})

cts.on("mouseup", e => {
    isDragging = false
})

cts.on("touchstart", e => {
    isDragging = true
})

cts.on("touchmove", e => {
    if (!isDragging) return;
    hwt.textSize = cts.val()
    updateTextSize()
})

cts.on("touchend", e => {
    isDragging = false
})
cts.on("touchcancel", e => {
    isDragging = false
})

$('.step-buttons-ts .increase').on("click", e => {
    cts[0].stepUp()
    hwt.textSize = cts.val()
    updateTextSize()
})
$('.step-buttons-ts .decrease').on("click", e => {
    cts[0].stepDown()
    hwt.textSize = cts.val()
    updateTextSize()
})