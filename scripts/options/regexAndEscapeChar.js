import { homeworkList, hwt } from "../script.js";

String.prototype.replaceLast = function (search, replacement) {
    const str = this.toString();
    const index = str.lastIndexOf(search);
    if (index === -1) return str;

    return (
        str.slice(0, index) +
        replacement +
        str.slice(index + search.length)
    );
};

const replaceEscapeCharWithElement = (char, eclass, a, hwDisplay, changeLineAtEnd = false, changeLineAtStartIfTheresAnythingBefore = true) => {
    a = a.replaceLast(`\\${char}\\`, changeLineAtEnd ? '\n' : '')
    if (a.match(RegExp(`[\\s\\S]*?\\\\${char}(?!\\\\)`, 'gu'))) a = a.replace('\\' + char, changeLineAtStartIfTheresAnythingBefore ? '\n' : '')
    else a = a.replace('\\' + char, '')
    if (hwt.options["unsafe-input"]) return hwDisplay.innerHTML += `<b class="${eclass} unbold">${a}</b>`;
    let b = document.createElement('b')
    b.innerHTML = a
    b.classList.add("unbold")
    b.classList.add(eclass)
    hwDisplay.appendChild(b)
}

export const escapeChar = [
    {
        char: 'h',
        name: '橫寫',
        description: '在\\h 和 \\h\\之間的所有文字會以橫寫顯示',
        example: '\\h這些文字會橫寫顯示\\h\\',
        actsLikeBrackets: true,
        func: (a, hwDisplay) => replaceEscapeCharWithElement('h', 'num', a, hwDisplay, true),
    },
    {
        char: 'v',
        name: '直寫',
        description: '在\\v 和 \\v\\之間的所有文字會以橫寫顯示',
        example: '\\v123456這些數字會以直寫顯示\\v\\',
        actsLikeBrackets: true,
        func: (a, hwDisplay) => {
            a = a.replaceLast('\\v\\', '')
            if (a.match(/[\s\S]+\\v(?!\\)/gu)) a = a.replace('\\v', '\n')
            else a = a.replace('\\v', '')
            if (hwt.options["unsafe-input"]) return hwDisplay.innerHTML += a;
            hwDisplay.append(a)
        },
    },
    {
        char: 's',
        name: "側寫",
        description: '在\\s 和 \\s\\之間的所有非漢字會以側寫顯示，漢字正常顯示',
        example: '\\s123456這些數字會以直寫側寫顯示\\s\\',
        actsLikeBrackets: true,
        func: (a, hwDisplay) => replaceEscapeCharWithElement('s', 'not-upright-text', a, hwDisplay),
    },
    {
        char: 'g',
        name: "螢光",
        description: '在\\g 和 \\g\\之間的所有文字會以螢光筆畫線並直寫顯示',
        example: '\\g發光吧!\\g\\ -> <b class="highlighted unbold tweak-for-display">發光吧!</b>',
        actsLikeBrackets: true,
        func: (a, hwDisplay) => replaceEscapeCharWithElement('g', 'highlighted', a, hwDisplay, false, false),
    },
    {
        char: 'n',
        name: "小型空格",
        description: "把會自動橫寫的文字拆開",
        example: '123\\n4567 -><br> 123<br>4567',
        actsLikeBrackets: false,
        replaceWith: '\n'
    }
]

escapeChar.forEach(e =>
    $('.cheatsheet-display')[0].innerHTML += `<details>
                    <summary>${e.actsLikeBrackets ?
        `\\${e.char} 與 \\${e.char}\\`
        : `\\${e.char}`
    } - ${e.name}標記</summary>
                    ${e.actsLikeBrackets ? '括號型' : '普通'}標記<br>
                    ${e.description}<br>
                    例: ${e.example}
                </details>`
)

export const escapeCharThatActsLikeBrackets = escapeChar.filter(a => a.actsLikeBrackets).map(a => a.char);
export const replacables = escapeChar.filter(a => !a.actsLikeBrackets).map(a => a.char);



const scaryDynamicPattern = new RegExp(
    escapeCharThatActsLikeBrackets
        .map(b => `\\\\${b}(?!\\\\)([\\s\\S]*?)\\\\${b}\\\\`)
        .join('|'),
    'gu'
);

export const splitWithMatches = (str, regex) => {
    let result = [];
    let lastIndex = 0;
    let match;

    const globalRegex = new RegExp(regex.source, regex.flags.includes('gu') ? regex.flags : regex.flags + 'gu');

    while ((match = globalRegex.exec(str)) !== null) {
        if (match.index > lastIndex) {
            result.push(str.slice(lastIndex, match.index));
        }
        result.push(match[0]);
        lastIndex = globalRegex.lastIndex;
    }

    if (lastIndex < str.length) {
        result.push(str.slice(lastIndex));
    }

    let matchOnly = [...str.matchAll(globalRegex)].map(a => a = a[0]);


    return {
        result,
        matchOnly,
        isFirstOneAMatch: matchOnly[0] === result[0],
    };
}


export const toVerticalWords = (homeworkData = homeworkList) => {
    $.each($('.hw'), (i, hw) => {
        const hwText = homeworkData[i].text;
        const hwDisplay = hw.querySelector('.hw-text')
        let regexp = /[!-z]+/gu;
        if (hwt.options["smaller-space"]) regexp = /[ -z]+/gu;
        let func = splitWithMatches(hwText, regexp),
            { result, isFirstOneAMatch } = func;
        hwDisplay.innerHTML = ''
        // this feature complicated af
        // it's all just regex patterns
        if (hwt.options['escape-char']) {
            replacables.forEach(a =>
                result = result.map(b =>
                    b.replaceAll(`\\${a}`,
                        escapeChar.find(c => c.char === a).replaceWith
                    )))
            // separator
            result = result.flatMap(str => {
                const parts = [];
                let lastIndex = 0;
                scaryDynamicPattern.lastIndex = 0;

                for (const match of str.matchAll(scaryDynamicPattern)) {
                    const start = match.index;
                    const end = start + match[0].length;

                    if (start > lastIndex) {
                        const between = str.slice(lastIndex, start);
                        if (between) parts.push(between);
                    }

                    parts.push(match[0]);
                    lastIndex = end;
                }

                if (lastIndex < str.length) {
                    parts.push(str.slice(lastIndex));
                }

                return parts;
            });
            escapeCharThatActsLikeBrackets.forEach(char => {
                result = result.flatMap(z => {
                    let reg = RegExp(`([\\s\\S]+)(\\\\${char}(?!\\\\)[\\s\\S]*?)`, 'gu')
                    let whatIsThis = z.matchAll(reg).toArray().length ? z.matchAll(reg).toArray()[0].slice(1) : z
                    return whatIsThis
                })
            })
            // merger
            result.forEach((a, i) => {
                const lookForEscapedChar = (char) => {
                    if (a.match(RegExp(`\\\\${char}[\\s\\S]+?\\\\${char}\\\\`, 'gu')) && a.match(RegExp(`\\\\${char}[\\s\\S]+?\\\\${char}\\\\`, 'gu'))[0] === a) return;
                    let startingRegex = RegExp(`[\\s\\S]*?\\\\${char}[\\s\\S]*?`, 'gu')
                    let endingRegex = RegExp(`[\\s\\S]*?\\\\${char}\\\\`, 'gu')
                    let arrayUntilEnd = result.slice(i + 1)
                    let end = arrayUntilEnd.find(v => v.match(startingRegex))
                    if (!end) return;
                    arrayUntilEnd = arrayUntilEnd.slice(0, arrayUntilEnd.indexOf(end))
                    result[i] = a + arrayUntilEnd.join("") + end
                    const temp = (index) => {
                        let e = !result[i + index].match(endingRegex)
                        if (!e) delete result[i + index]
                        return e
                    }
                    for (let index = 1; temp(index); index++) {
                        delete result[i + index]
                    }
                }
                escapeCharThatActsLikeBrackets.forEach(b => {
                    const regex = RegExp(`\\\\${b}(?!\\\\)[\\s\\S]*`, "g")
                    if (a.match(regex)) lookForEscapedChar(b)
                })
            })
        }
        result = result.filter(a => a !== undefined)
        // console.log(result)
        result.forEach((a, i) => {
            let init = () => {
                if (hwt.options["unsafe-input"]) return hwDisplay.innerHTML += `<b class="num unbold">${a}</b>`;
                let b = document.createElement('b');
                b.innerText = a;
                b.classList.add("num");
                b.classList.add('unbold');
                hwDisplay.append(b);
            }
            if (hwt.options['escape-char'] && a.match(scaryDynamicPattern)) {
                let temp = true
                escapeCharThatActsLikeBrackets.forEach(c => {
                    const char = escapeChar.find(e => e.char === c)
                    let isNested = false
                    escapeCharThatActsLikeBrackets.forEach(ch => {
                        if (ch === c) return;
                        if (a.match(RegExp(`\\\\${ch}[\\s\\S]*?\\\\${ch}\\\\`, "g")) && !a.match(RegExp(`\\\\${ch}\\\\${ch}\\\\`, "g"))) isNested = true;
                    })
                    if (isNested) return temp = false;
                    if (!a.match(RegExp(`\\\\${c}[\\s\\S]*?\\\\${c}\\\\`, "g"))) return;
                    temp = false
                    char.func(a, hwDisplay)
                })
                if (temp) init()
            } else if ((!(i % 2) && isFirstOneAMatch) || (i % 2 && !isFirstOneAMatch)) {
                init()
            } else {
                if (hwt.options["unsafe-input"]) return hwDisplay.innerHTML += a;
                hwDisplay.append(a)
            }
        })
    })
}
