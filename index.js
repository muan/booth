const video = document.querySelector('#video')
const device = document.querySelector('#device')
const ratio = document.querySelector('#ratio')
const list = document.querySelector('#list')
const dimensions = {
  '16:9': {width: 1024, height: 576},
  '3:2': {width: 1020, height: 680}
}

init()

async function init() {
  let options = ``

  // Get permissions before listing
  await setWebcam()

  for (const input of await navigator.mediaDevices.enumerateDevices()) {
    if (input.kind !== 'videoinput') continue
    options += `<option value="${input.deviceId}">${input.label}</option>`
  }
  device.innerHTML = options
}

async function setWebcam() {
  const {width, height} = dimensions[ratio.value || '16:9']
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      deviceId: device.value, 
      width: {ideal: width},
      height: {ideal: height}
    }
  })
  video.srcObject = stream
  
  video.onloadedmetadata = function(e) {
    video.play()
  }
}

function snap() {
  const canvas = document.createElement('canvas')
  const d = dimensions[ratio.value]
  canvas.width = d.width
  canvas.height = d.height
  document.body.append(canvas)
  
  const context = canvas.getContext('2d')
  if (video.classList.contains('flipped')) {
    context.translate(d.width, 0)
    context.scale(-1, 1)
  }
  context.fillStyle = '#000000'
  context.fillRect(0, 0, d.width, d.height)
  context.drawImage(video, 0, 0)
  const dataURL = canvas.toDataURL('image/png')
  const date = new Date()
  const time = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
  const li = document.createElement('li')
  const hasDialog = !!window.HTMLDialogElement
  const previewHTML = hasDialog ? `<button data-dialog="i${date.getTime()}"><img alt="${time}" src="${dataURL}" class="thumbnail"></button>
    <dialog id="i${date.getTime()}"><img alt="${time}" src="${dataURL}"></dialog>` : 
    `<a href="${dataURL}" target="_blank"><img alt="${time}" src="${dataURL}" class="thumbnail"></a>`
  li.innerHTML = `
    ${previewHTML}<br>
    <a href="${dataURL}" class="dl-link" download="Photo ${date.toISOString().split('T')[0]} ${date.toLocaleTimeString().replace(/:/g, '.')}.png">save</a>
    <button class="js-discard">discard</button>`
  list.prepend(li)
  canvas.remove()
}

device.addEventListener('change', setWebcam)
ratio.addEventListener('change', setWebcam)

document.querySelector('#snap').addEventListener('click', snap)

document.querySelector('#flip').addEventListener('click', function() {
  video.classList.toggle('flipped', !video.classList.contains('flipped'))
})

document.addEventListener('click', function(event) {
  const dialogID = event.target.closest('button')?.getAttribute('data-dialog')
  if (dialogID) document.getElementById(dialogID).showModal()
  if (event.target.tagName === 'DIALOG') event.target.close()
  if (event.target.classList.contains('js-discard')) {
    if(!confirm('are you sure?')) return
    event.target.closest('li').remove()
  }
})

document.querySelector('#snap3').addEventListener('click', function(e) {
  const count = document.querySelector('#count')
  const button = e.currentTarget
  button.disabled = true
  count.innerText = '- 3'
  setTimeout(function() { count.innerText = '- 2' }, 1000)
  setTimeout(function() { count.innerText = '- 1' }, 2000)
  setTimeout(function() { 
    count.innerText = '';
    button.disabled = false
  }, 3000)
  setTimeout(snap, 3000)
})
