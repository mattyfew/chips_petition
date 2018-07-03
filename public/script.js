const canvas = document.getElementById('canvas')
const hiddenInput = document.getElementById('hidden-input')
const context = canvas.getContext('2d')
const offsetTop = canvas.offsetTop
const offsetLeft = canvas.offsetLeft

canvas.style.border = '1px solid blue'

canvas.addEventListener('mousedown', e => {
    context.beginPath()
    context.moveTo(e.pageX - offsetLeft, e.pageY - offsetTop);

    canvas.addEventListener('mousemove', move)
    canvas.addEventListener('mouseup', e => {
        hiddenInput.value = canvas.toDataURL()
        canvas.removeEventListener('mousemove', move)
    })

    function move(e) {
        context.lineTo(e.pageX  - offsetLeft, e.pageY  - offsetTop);
        context.stroke()
    }
})
