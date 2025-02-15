export function openTransferModal(unitA, imgA, unitB, imgB, game, ws) {
  const modalBackground = document.querySelector('#modal-background')
  modalBackground.setAttribute('style', 'display: flex;')
  modalBackground.addEventListener('click', () => closeTransferModal())

  const transferContainer = document.querySelector('#transfer')
  transferContainer.setAttribute('style', 'display: flex;')

  // updating modal with units datas
  //imgs
  transferContainer.querySelector('#transfer-left-img').setAttribute('src', imgA.getAttribute('src'))
  transferContainer.querySelector('#transfer-right-img').setAttribute('src', imgB.getAttribute('src'))

  //Cargo
  transferContainer.querySelector('.cargo-left-current').innerHTML = unitA.currentSpecs.cargo
  transferContainer.querySelector('.cargo-right-current').innerHTML = unitB.currentSpecs.cargo
  transferContainer.querySelector('.cargo-left-max').innerHTML = unitA.specs.cargo
  transferContainer.querySelector('.cargo-right-max').innerHTML = unitB.specs.cargo

  //transfer bar handling
  let cargoA = unitA.currentSpecs.cargo
  let cargoB = unitB.currentSpecs.cargo

  const maxCargo = cargoA + cargoB
  console.log('cargoA: ', cargoA, ' cargoB: ', cargoB, ' maxCargo: ', maxCargo)
  const transferBar = transferContainer.querySelector('.transfer-bar')
  const progressBar = transferContainer.querySelector('.transfer-progress-bar')
  const cargoADisplay = transferContainer.querySelector('.cargo-left-current')
  const cargoBDisplay = transferContainer.querySelector('.cargo-right-current')

  let isDragging = false

  let step = (100 / (maxCargo))
  let newPercent = cargoB * step
  let percent = 0
  let transfered = 0

  //initializing progressBar
  progressBar.style.width = `${newPercent}%`

  const updateValuesOnBar = (e) => {
    const rect = transferBar.getBoundingClientRect()
    let clicked = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
    percent = (clicked / rect.width) * 100
    newPercent = percent - percent % step
    transfered = Math.floor(newPercent / step) - cargoB
    updateProgressBar()
  }

  const handleLessOrMore = (e, number) => {
    if (newPercent + (step * number) >= 0 &&
      newPercent + (step * number) <= 100) {
      newPercent += step * number
      transfered += number
      updateProgressBar()
    }
  }

  const updateProgressBar = () => {
    progressBar.style.width = `${newPercent}%`
    cargoADisplay.innerHTML = unitA.currentSpecs.cargo - transfered
    cargoBDisplay.innerHTML = unitB.currentSpecs.cargo + transfered
  }

  //listeners
  transferBar.addEventListener('mousedown', (e) => {
    isDragging = true
    updateValuesOnBar(e)
  })

  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      updateValuesOnBar(e)
    }
  })

  document.addEventListener('mouseup', () => {
    isDragging = false
  })

  const lessBtn = transferContainer.querySelector('.less')
  const moreBtn = transferContainer.querySelector('.more')
  lessBtn.onclick = (e) => handleLessOrMore(e, -1)
  moreBtn.onclick = (e) => handleLessOrMore(e, 1)

  const executeBtn = transferContainer.querySelector('#execute-transfer')
  executeBtn.onclick = (e) => {
    const payLoad = {
      method: 'transfer',
      unitId: unitA.id,
      targetId: unitB.id,
      qty: transfered,
      gameId: game.id,
    }
    console.log('Sending : ', payLoad)
    console.log(ws)
    ws.send(JSON.stringify(payLoad))
    closeTransferModal()
  }
}

export function closeTransferModal() {
  const modalBackground = document.querySelector('#modal-background')
  modalBackground.setAttribute('style', 'display: none;')
  modalBackground.removeEventListener('click', () => closeTransferModal())
  // reseting modal content
  const transferContainer = document.querySelector('#transfer')
  const transferBar = transferContainer.querySelector('.transfer-bar')
  // removing listeners
  transferBar.removeEventListener('mousedown', (e) => {
    isDragging = true
    updateValuesOnBar(e)
  })

  transferBar.removeEventListener('mousemove', (e) => {
    if (isDragging) {
      updateValuesOnBar(e)
    }
  })

  document.removeEventListener('mouseup', () => {
    isDragging = false
  })

  transferContainer.setAttribute('style', 'display: none')
}