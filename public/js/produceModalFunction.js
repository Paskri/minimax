import { Artillery, Bulldozer, Gun, Miner, Radar, Repair, Scout, Supply, Tank } from "./classesExp.js"

//Global variables
let productionState = {
  qgId: 0,
  unit: '',
  buildSpeed: 0,
  gameId: '',
  ws: null,
  selectedUnit: {}
}

const canBeProducedArray = [new Scout, new Tank, new Gun, new Artillery, new Radar, new Supply, new Repair, new Bulldozer, new Miner]


/**
 * Updates the display of the selected unit's data.
 *
 * @param {Event | null} e - The event triggered by selecting a unit (can be null).
 * @param {Object} unit - The selected unit with its characteristics.
 * @param {HTMLElement} produceSpeedCost - DOM element containing the unit's production costs.
 */
function updateUnitDatas(e, unit, produceSpeedCost) {
  // updating images
  document.querySelector('#produce-right-img').setAttribute('src', `img/${unit.type}.webp`)

  //updating production numbers
  produceSpeedCost.querySelector('.sc-line1 .c2').innerHTML = unit.specs.production[0].turns
  produceSpeedCost.querySelector('.sc-line2 .c2').innerHTML = unit.specs.production[1].turns
  produceSpeedCost.querySelector('.sc-line3 .c2').innerHTML = unit.specs.production[2].turns
  produceSpeedCost.querySelector('.sc-line1 .c3').innerHTML = unit.specs.production[0].cost
  produceSpeedCost.querySelector('.sc-line2 .c3').innerHTML = unit.specs.production[1].cost
  produceSpeedCost.querySelector('.sc-line3 .c3').innerHTML = unit.specs.production[2].cost

  //updating stats
  const dataSet = ['attack', 'shots', 'range', 'ammo', 'armor', 'life', 'radar', 'speed', 'cost', 'cargo']
  const produceStats = document.querySelector('.produce-stats')
  dataSet.forEach(data => {
    if (data !== 'cargo') {
      produceStats.querySelector(`#${data}`).innerHTML = unit.specs[data]
    } else {
      produceStats.querySelector(`#${data}`).innerHTML = unit.specs[data] ? unit.specs[data] : '---'
    }
  })
  //updating selected unit border
  const borderedUnit = document.querySelector('.unit-line.border')
  borderedUnit && borderedUnit.classList.remove('border')
  if (e) {
    e.currentTarget.classList.add('border')
  }
  //updating production state
  productionState.unit = unit.type

}

function toggleActiveBtn(e) {
  if (e) {
    const activedBtn = document.querySelector('.speed-btn.active')
    activedBtn && activedBtn.classList.remove('active')
    e.target.classList.add('active')
    // updating productionState
    productionState.buildSpeed = parseInt(e.target.dataset.value)
  }

}

function handleBuildClick() {
  if (productionState.selectedUnit.currentSpecs.cargo >= productionState.cost) {
    // to complete when time
  }
  const payLoad = {
    method: 'produceUnit',
    build: { unitType: productionState.unit, buildSpeed: productionState.buildSpeed },
    unitId: productionState.qgId,
    gameId: productionState.gameId,
  }
  console.log('Sending : ', payLoad)
  productionState.ws.send(JSON.stringify(payLoad))
  grid.style.cursor = 'default'

  // Updating current prod datas
  const unitType = productionState.unit
  const unit = canBeProducedArray.find((u) => u.type === unitType)
  const turnsNeeded = unit.specs.production[productionState.buildSpeed].turns
  const costNeeded = unit.specs.production[productionState.buildSpeed].cost
  const datas = { status: 'building', unit: unitType, speed: turnsNeeded, turnsRemain: turnsNeeded, cost: costNeeded }
  productionState.selectedUnit.currentProd = datas
  updateCurrentProduction()
}

function handleCancelClick() {
  console.log('cancelling build')
  //sending cancel order
  const payLoad = {
    method: 'cancelProduce',
    unitId: productionState.qgId,
    gameId: productionState.gameId,
  }
  console.log('Sending : ', payLoad)
  productionState.ws.send(JSON.stringify(payLoad))
  //server handling and updating game
}

function updateCurrentProduction() {
  const producedUnit = productionState.selectedUnit.currentProd
  console.log(producedUnit)
  const unitImg = document.querySelector('.cb-img')
  producedUnit.unit ? unitImg.setAttribute('src', `img/${producedUnit.unit}.webp`) : unitImg.setAttribute('src', ``)
  const turnsLeft = document.querySelector('.cb-datas .c2')
  turnsLeft.textContent = producedUnit.turnsRemain
  const costLeft = document.querySelector('.cb-datas .c3')
  costLeft.textContent = producedUnit.cost
}

/**
 * Opens the unit production modal and initializes necessary event listeners.
 * 
 * @param {Object} selectedUnit - The currently selected unit.
 * @param {Object} images - Collection of unit images.
 * @param {string} gameId - Unique identifier of the current game session.
 * @param {WebSocket} ws - WebSocket connection for sending production actions.
 */
export function openProduceModal(selectedUnit, images, gameId, ws) {
  const modalBackground = document.querySelector('#modal-background')
  modalBackground.setAttribute('style', 'display: flex;')
  modalBackground.addEventListener('click', closeProduceModal)

  const produceContainer = document.querySelector('#produce')
  produceContainer.setAttribute('style', 'display: flex;')

  const produceSpeedCost = produceContainer.querySelector('.produce-speed-and-costs')

  const produceRight = document.querySelector('.produce-right')
  produceRight.innerHTML = ''
  updateUnitDatas(null, canBeProducedArray[0], produceSpeedCost)
  productionState.unit = canBeProducedArray[0].type

  canBeProducedArray.forEach((unit) => {
    const unitLine = document.createElement('div')
    unitLine.classList.add('unit-line')
    productionState.unit === unit.type && unitLine.classList.add('border')
    const title = unit.type.charAt(0).toUpperCase() + unit.type.slice(1)
    unitLine.innerHTML = `<img class="unit-img" src="img/${unit.type}.webp" width="34" height="34" />
          <span class="unit-name">${title}</span>
          <span class="unit-cost">${unit.specs.cost}</span>`
    //saving listener for further remove
    unitLine._listener = (e) => updateUnitDatas(e, unit, produceSpeedCost)
    unitLine.addEventListener('click', unitLine._listener)
    produceRight.appendChild(unitLine)
  })

  //Production speed and costs button
  const productionBtns = produceSpeedCost.querySelectorAll('button')
  //console.log(productionBtns[productionState.buildSpeed])
  productionBtns[productionState.buildSpeed].classList.add('active')

  productionBtns.forEach(btn => {
    btn.addEventListener('click',
      toggleActiveBtn
    )
  })

  //execute production
  productionState.qgId = selectedUnit.id
  productionState.gameId = gameId
  productionState.ws = ws
  productionState.selectedUnit = selectedUnit
  //productionState.cost = null
  const buildBtn = produceContainer.querySelector('.build-btn')
  buildBtn.addEventListener('click', handleBuildClick)
  const cancelBtn = produceContainer.querySelector('.cancel-btn')
  cancelBtn.addEventListener('click', handleCancelClick)
  const closeBtn = produceContainer.querySelector('.close-btn')
  closeBtn.addEventListener('click', closeProduceModal)

  updateCurrentProduction()

}
/* ****** CLOSE ********* */

export function closeProduceModal() {
  const modalBackground = document.querySelector('#modal-background')
  modalBackground.setAttribute('style', 'display: none;')
  modalBackground.removeEventListener('click', closeProduceModal)
  // reseting modal content
  const produceContainer = document.querySelector('#produce')
  produceContainer.setAttribute('style', 'display: none')

  //removing speedBtns listener
  const speedBtns = produceContainer.querySelectorAll('.speed-btn')
  speedBtns.forEach((btn) => {
    btn.removeEventListener('click',
      toggleActiveBtn()
    )
  })
  //removing buildBtn listener
  const buildBtn = produceContainer.querySelector('.build-btn')
  buildBtn.removeEventListener('click', handleBuildClick)

  //removing cancelBtn listener
  const cancelBtn = produceContainer.querySelector('.cancel-btn')
  cancelBtn.removeEventListener('click', handleCancelClick)

  //removing closeBtn listener
  const closeBtn = produceContainer.querySelector('.close-btn')
  closeBtn.removeEventListener('click', closeProduceModal)

  //removing unitLines listener previously saved in unitLineObject
  const unitLines = document.querySelectorAll('.unit-line')
  unitLines.forEach(unitLine => {
    unitLine.removeEventListener('click', unitLine._listener)
    delete unitLine._listener
  })
}