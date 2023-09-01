
document.querySelector('button').addEventListener('click', () => {
    document.querySelector('#prepare').classList.add('hidden')
    
    document.querySelector('#doing').append(
        document.querySelector('#testing').content.cloneNode(true)
    )

    document.querySelector('.description .start').style.opacity = 1
    document.querySelector('.description .complete').style.opacity = 0

    startTest()
})

document.querySelector('#result').addEventListener('click', () => {
    copyToClipboard(document.querySelector('#result').value)
    toast('복사되었습니다.')
})

function round(num) {
    let m = Number((Math.abs(num) * 10).toPrecision(15));
    return Math.round(m) / 10 * Math.sign(num);
}

function copyToClipboard(val) {
    let t = document.createElement('textarea')
    document.body.appendChild(t)

    t.value = val
    t.select()

    document.execCommand('copy')
    document.body.removeChild(t)
}