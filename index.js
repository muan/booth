const video = document.querySelector('#video')
const device = document.querySelector('#device')
const ratio = document.querySelector('#ratio')
const list = document.querySelector('#list')
const dimensions = {
  '16:9': {width: 800, height: 450},
  '3:2': {width: 600, height: 400}
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
  context.drawImage(video, 0, 0)
  const snapped = document.createElement('img')
  snapped.src = canvas.toDataURL("image/png")
  snapped.alt = `${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`
  const li = document.createElement('li')
  li.append(snapped)
  list.prepend(li)
  canvas.remove()
}

device.addEventListener('change', setWebcam)
ratio.addEventListener('change', setWebcam)

document.querySelector('#snap').addEventListener('click', snap)

document.querySelector('#flip').addEventListener('click', function() {
  video.classList.toggle('flipped', !video.classList.contains('flipped'))
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
