const canvas = document.getElementById('canvas')
const hiddenInput = document.getElementById('hidden-input')
const context = canvas.getContext('2d')
const offsetTop = canvas.offsetTop
const offsetLeft = canvas.offsetLeft

canvas.style.border = '1px dotted blue'

canvas.addEventListener('mousedown', e => {
    context.beginPath()
    context.moveTo(e.clientX - offsetLeft, e.clientY - offsetTop);

    canvas.addEventListener('mousemove', move)
    canvas.addEventListener('mouseup', up)

    function up(e) {
        hiddenInput.value = canvas.toDataURL()
        canvas.removeEventListener('mousemove', move)
        canvas.removeEventListener('mouseup', up)
    }

    function move(e) {
        context.lineTo(e.clientX  - offsetLeft, e.clientY  - offsetTop);
        context.stroke()
    }
})
