// ************* HTML elements **************
let visible = false

// ************ Buttons handling ************
// display hit-points
let displayLife = false
const lifeBtn = document.querySelector('#hit-points')
lifeBtn.addEventListener('click', (e) => {
    displayLife = !displayLife
    lifeBtn.classList.toggle('active')
})

// display status
let displayStatus = false
const statusBtn = document.querySelector('#status')
statusBtn.addEventListener('click', (e) => {
    displayStatus = !displayStatus
    statusBtn.classList.toggle('active')
})

// display ranges
let displayRanges = false
const rangesBtn = document.querySelector('#ranges')
rangesBtn.addEventListener('click', (e) => {
    displayRanges = !displayRanges
    rangesBtn.classList.toggle('active')
})

const turnPlayer = document.querySelector('#turnPlayer')

//DOM elements
let specs = document.querySelector('#specs')
let player = specs.querySelector('#player')
let id = document.querySelector('#id')
let color = specs.querySelector('#color')
let type = specs.querySelector('#type')
let coords = specs.querySelector('#coords')
let attack = specs.querySelector('#attack')
let shots = specs.querySelector('#shots')
let range = specs.querySelector('#range')
let ammo = specs.querySelector('#ammo')
let armor = specs.querySelector('#armor')
let life = specs.querySelector('#life')
let radar = specs.querySelector('#radar')
let speed = specs.querySelector('#speed')
let costs = specs.querySelector('#costs')

let endTurn = document.querySelector('#endturn')
let turnDisplay = document.querySelector('#turn')

// ************* Canvas Context **************
const chess = document.querySelector('#chess')
const cctx = chess.getContext('2d')
const grid = document.querySelector('#grid')
const ctx = grid.getContext('2d')

// ************* Global variables *************
let coveredCells = []
let eCoveredCells = []
let rangedCells = []
let eRangedCells = []
let selectedUnit = {}
let game = {}
let currentPlayer = 0
let debris = []
let gameStarted = true


//**************** Units images ****************
let tank = document.querySelector('#tank')
let scout = document.querySelector('#scout')
let gun = document.querySelector('#gun')
let artillery = document.querySelector('#artillery')
let qg = document.querySelector('#qg')
let repair = document.querySelector('#repair')
let supply = document.querySelector('#supply')
let fire = document.querySelector('#fire')
let impact = document.querySelector('#impact')
let bigimpact = document.querySelector('#bigimpact')
let wreck = document.querySelector('#debris')

// ******************** WebSocket connection handling ***********************
let ws = new WebSocket('ws://192.168.1.16:9090')
// getting connection params in local storage
const localStorageClient = localStorage.getItem('clientId')
let oldClientId = null
if (localStorageClient !== 'undefined' || localStorageClient !== null) {
    oldClientId = JSON.parse(localStorageClient)
} else {
    oldClientId = null
}

const localStorageGame = localStorage.getItem('game')
if (localStorageGame !== 'undefined' || localStorageGame !== null) {
    game = JSON.parse(localStorageGame)
} else {
    game = null
}

// *************** WebSocket Responses handling *****************
ws.onmessage = (message) => {
    //message.data
    const response = JSON.parse(message.data)
    console.log('Server Response : ', response)

    // ******* METHODS ********
    // CONNECTION
    if (response.method === 'connect') {
        const clientId = response.clientId;
        console.log('connected and clientId set succefully ', clientId);
        // updating with
        const payLoad = {
            method: 'updateClient',
            clientId: clientId,
            oldClientId: oldClientId,
        }
        console.log('Sending : ', payLoad)
        ws.send(JSON.stringify(payLoad))
    }

    // UPDATE CLIENT
    if (response.method === 'updateClient') {
        const clientId = response.clientId
        const message = response.message
        game = response.game
        //console.log(message, ' --> Partie à créer de toute pièce')
        localStorage.setItem('clientId', JSON.stringify(clientId))
        localStorage.setItem('game', JSON.stringify(game))
        if (Object.keys(game).length === 0) {
            const payLoad = {
                method: 'createFullGame',
                clientId: clientId,
            }
            console.log('Sending : ', payLoad)
            ws.send(JSON.stringify(payLoad))
        } else {
            // trouver dans la partie le client concerné
            const currentClient = game.clients.filter(
                (client) => client.clientId === clientId
            )
            if (currentClient.length > 0) {
                currentPlayer = currentClient[0].playerId
                // updating DOM
                turnPlayer.innerHTML = currentPlayer
            } else {
                const payLoad = {
                    method: 'createFullGame',
                    clientId: clientId,
                }
                console.log('Sending : ', payLoad)
                ws.send(JSON.stringify(payLoad))
            }
        }
    }

    // CREATE FULL GAME
    if (response.method === 'createFullGame') {
        currentPlayer = response.currentPlayer
        turnPlayer.innerHTML = currentPlayer
        game = response.game
        localStorage.setItem('game', JSON.stringify(game))
    }

    // ******* RESPONSES *******
    // unit move
    if (response.method === 'move') {
        const unitId = response.unitId
        const route = response.route
        const unit = units[unitId]
        unit.route = route
        unit.moving = true
        unit.animStep = 0
    }

    // move and fire
    if (response.method === 'moveAndFire') {
        const unitId = response.unitId
        const route = response.route
        const unit = units[unitId]
        unit.route = route
        unit.moving = true
        unit.animStep = 0
    }

    // unit fire
    if (response.method === 'fire') {
        const agressor = response.agressor
        const target = response.target
        const game = response.game
        //tir
        units[agressor].firing = true
        // mise à jour datas
        units[target].onFire = true
        units[target].agrId = agressor
        units[agressor].targetX = units[target].x
        units[agressor].targetY = units[target].y
        units[agressor].targetId = target
        units[agressor].currentSpecs.ammo--
        ammo.innerHTML =
            units[agressor].currentSpecs.ammo + '/' + units[agressor].specs.ammo
        //définir angle de tir
        let x = units[target].x - units[agressor].x
        let y = units[target].y - units[agressor].y
        let fireAngle = (Math.atan2(y, x) * (180 / Math.PI) + 90) % 360
        units[agressor].angle = fireAngle
        //removing eventual moveAndFire
        units[agressor].moveAndFire = false
    }

    // autoFire
    if (response.method === 'autoFire') {
        let agressors = response.agressors
        const agressor = response.agressors[0]
        const target = response.target
        const game = response.game

        //console.log(agressor, target)
        if (
            units[agressor].currentSpecs.shots > 0 &&
            units[agressor].currentSpecs.ammo > 0
        ) {
            //units[agressor].firing = true
            units[agressor].autoFiring = true
            //mise à jour datas
            units[target].onAutoFire = true
            //units[target].agrId = agressor
            units[target].agrIds = agressors
            units[agressor].targetX = units[target].x
            units[agressor].targetY = units[target].y
            units[agressor].targetId = target
            units[agressor].currentSpecs.ammo--
            ammo.innerHTML =
                units[agressor].currentSpecs.ammo + '/' + units[agressor].specs.ammo
            //définir angle de tir
            let x = units[target].x - units[agressor].x
            let y = units[target].y - units[agressor].y
            let fireAngle = (Math.atan2(y, x) * (180 / Math.PI) + 90) % 360
            units[agressor].angle = fireAngle
        } else {
            //desactive autoFiring puis supprime l'adresseur de la liste
            units[agressors[0]].autoFiring = false
            units[agressor].targetX = null;
            units[agressor].targetY = null;
            units[agressor].targetId = null;
            agressors.shift()
            if (agressors.length > 0) {
                const payLoad = {
                    method: 'autoFire',
                    agressors: agressors,
                    target: target,
                    game: game,
                }
                console.log('sending : ', payLoad)
                ws.send(JSON.stringify(payLoad))
            } else {
                //supprimer autofire sur l'unité en question
                units[target].onAutoFire = false
                units[target].agrIds = []
            }
        }
    }

    // repairing
    if (response.method === 'repairUnit') {
        const unitId = response.unitId
        units[unitId].currentSpecs.life = units[unitId].specs.life
    }

    // supplying
    if (response.method === 'supplyUnit') {
        const unitId = response.unitId
        units[unitId].currentSpecs.ammo = units[unitId].specs.ammo
    }
    // start count down 
    if (response.method === 'startCount') {
        startCountdown()
        gameStarted = true
    }
    // end turn
    if (response.method === 'endTurn') {
        const clientId = response.clientId
        const game = response.game
        if (timer > 30) {
            timer = 30
        }
    }

    // next turn
    if (response.method === 'nextTurn') {
        nextTurn(selectedUnit)
    }
}

//creating map
let map = []
for (let i = 0; i < 20; i++) {
    map[i] = []
    for (let j = 0; j < 17; j++) {
        map[i][j] = {}
    }
}

//creating debrisMap
let debrisMap = []
for (let i = 0; i < 20; i++) {
    debrisMap[i] = []
    for (let j = 0; j < 17; j++) {
        debrisMap[i][j] = {}
    }
}

// ************************** Listeners **************************
endTurn.addEventListener('click', (e) => {
    //execution de tous les mouvement en attente ??
    //console.log(game.clients)

    const client = game.clients.filter(
        (client) => client.playerId === currentPlayer
    )
    const clientId = client[0].clientId
    endTurn.classList.add('active')
    const payLoad = {
        method: 'endTurn',
        clientId: clientId,
        game: game,
    }
    console.log('sending : ', payLoad)
    ws.send(JSON.stringify(payLoad))
})

grid.addEventListener('click', (e) => {
    if (gameStarted) {
        let payLoad = {}
        let calculatedRoute = []
        const rect = grid.getBoundingClientRect()
        let selected = {
            x: Math.floor((e.clientX - rect.left) / 50),
            y: Math.floor((e.clientY - rect.top) / 50),
        }
        const targetUnit = map[selected.x][selected.y]
        // radar visibility
        const visible =
            coveredCells.find(
                (cell) => cell.x === selected.x && cell.y === selected.y
            ) !== undefined

        // unit selected and click on ally for repair, supply or transfer
        if (
            Object.keys(selectedUnit).length > 0 &&
            targetUnit &&
            targetUnit.player === selectedUnit.player &&
            ((selectedUnit.canRepair &&
                targetUnit.currentSpecs.life < targetUnit.specs.life) ||
                (selectedUnit.canSupply &&
                    targetUnit.currentSpecs.ammo < targetUnit.specs.ammo))
        ) {
            const isNeighbor = calculateDist(targetUnit.x, targetUnit.y, selectedUnit.x, selectedUnit.y) < 2
            if (
                selectedUnit.canRepair &&
                targetUnit.currentSpecs.life < targetUnit.specs.life &&
                isNeighbor
            ) {
                const payLoad = {
                    method: 'repairUnit',
                    unitId: targetUnit.id,
                    game: game,
                }
                console.log('Sending : ', payLoad)
                ws.send(JSON.stringify(payLoad))
                grid.style.cursor = 'default'
            }
            if (
                selectedUnit.canSupply &&
                targetUnit.currentSpecs.ammo < targetUnit.specs.ammo &&
                isNeighbor
            ) {
                const payLoad = {
                    method: 'supplyUnit',
                    unitId: targetUnit.id,
                    game: game,
                }
                console.log('Sending : ', payLoad)
                ws.send(JSON.stringify(payLoad))
                grid.style.cursor = 'default'
            }
        }

        //Si unité selectionnée et clic sur case contenant une unité adverse, visible
        else if (
            Object.keys(selectedUnit).length > 0 &&
            Object.keys(map[selected.x][selected.y]).length > 0 &&
            map[selected.x][selected.y].player !== selectedUnit.player &&
            selectedUnit.currentSpecs.shots > 0 &&
            visible &&
            selectedUnit.player === currentPlayer
        ) {
            let sUnit = selectedUnit
            let target = map[selected.x][selected.y]
            // checking if target in range then firing
            const dist = calculateDist(target.x, target.y, sUnit.x, sUnit.y)
            if (sUnit.specs.range >= dist && sUnit.currentSpecs.ammo > 0) {
                payLoad = {
                    method: 'fire',
                    agressor: sUnit.id,
                    target: target.id,
                    game: game,
                }
                console.log('sending : ', payLoad)
                ws.send(JSON.stringify(payLoad))
            }
            //si unité hors portée: move and fire
            else if (sUnit.specs.range < dist && sUnit.currentSpecs.ammo > 0) {
                // si objectif et route déjà défini et click sur une autre unité
                // redéfinir route
                if (Object.keys(selectedUnit.route).length > 0) {
                    if (
                        selected.x != selectedUnit.objX ||
                        selected.y != selectedUnit.objY
                    ) {
                        // créer clone de carte pour recherche
                        const aStarGrid = defineAStarGrid(map)
                        //implémentation de A* - Calcul de la route optimale
                        const calculatedRoute = aStar(
                            aStarGrid[selectedUnit.x][selectedUnit.y],
                            aStarGrid[selected.x][selected.y],
                            aStarGrid,
                            true
                        )
                        selectedUnit.route = calculatedRoute
                    }
                }
                selectedUnit.objX = selected.x
                selectedUnit.objY = selected.y
                //route définie avancer et tirer
                if (selectedUnit.route.length > 0) {
                    //move and fire
                    selectedUnit.moveAndFire = true
                    //calculating when unit is at range
                    selectedUnit.route.forEach((coords, index) => {
                        const dist = calculateDist(selected.x, selected.y, coords.x, coords.y)

                        if (dist <= selectedUnit.specs.range) {
                            selectedUnit.route = selectedUnit.route.slice(0, index + 1)
                        }
                    })
                    payLoad = {
                        method: 'moveAndFire',
                        unitId: selectedUnit.id,
                        route: selectedUnit.route,
                        game: game,
                    }
                    console.log('sending : ', payLoad)
                    ws.send(JSON.stringify(payLoad))
                } else {
                    // créer clone de carte pour recherche
                    const aStarGrid = defineAStarGrid(map)
                    //implémentation de A* - Calcul de la route optimale
                    const calculatedRoute = aStar(
                        aStarGrid[selectedUnit.x][selectedUnit.y],
                        aStarGrid[selected.x][selected.y],
                        aStarGrid,
                        true
                    )
                    selectedUnit.route = calculatedRoute
                }
            } else {
                console.log('Not in range')
            }
        }

        //si unité selectionnée et click sur case vide ou sur débris ou sur unité adverse invisible
        else if (
            selectedUnit &&
            selectedUnit.x != null &&
            selectedUnit.y != null &&

            selectedUnit.player === currentPlayer &&
            (Object.keys(targetUnit).length === 0 ||
                targetUnit.walkable === true) ||
            (Object.keys(targetUnit).length > 0 && !visible)
        ) {
            // Mouvement
            // définir objectif et chemin
            selectedUnit.objX = selected.x
            selectedUnit.objY = selected.y

            // créer clone de carte pour recherche
            const aStarGrid = defineAStarGrid(map)

            //implémentation de A* - Calcul de la route optimale
            const calculatedRoute = aStar(
                aStarGrid[selectedUnit.x][selectedUnit.y],
                aStarGrid[selected.x][selected.y],
                aStarGrid
            )
            selectedUnit.route = calculatedRoute
            //sending request
            payLoad = {
                method: 'move',
                unitId: selectedUnit.id,
                route: selectedUnit.route,
                game: game,
            }
            console.log('sending : ', payLoad)
            ws.send(JSON.stringify(payLoad))
        }

        // selectionner une unité
        else if (
            selected.x != null &&
            selected.y != null &&
            Object.keys(targetUnit).length > 0 &&
            visible &&
            targetUnit.player === currentPlayer
        ) {
            //console.log('case 2')
            //console.log('Unit selected : ', map[selected.x][selected.y])
            selectedUnit = targetUnit
            if (Object.keys(selectedUnit).length > 0) {
                //updating displayed infos
                let uById = units[selectedUnit.id]
                player.innerHTML = uById.player
                id.innerHTML = uById.id
                color.innerHTML = uById.color
                type.innerHTML = uById.type
                coords.innerHTML = uById.x + ' ' + uById.y
                attack.innerHTML = uById.specs.attack
                shots.innerHTML = uById.currentSpecs.shots + '/' + uById.specs.shots
                range.innerHTML = uById.specs.range
                ammo.innerHTML = uById.currentSpecs.ammo + '/' + uById.specs.ammo
                armor.innerHTML = uById.specs.armor
                life.innerHTML = uById.currentSpecs.life + '/' + uById.specs.life
                radar.innerHTML = uById.specs.radar
                speed.innerHTML = uById.currentSpecs.speed + '/' + uById.specs.speed
                costs.innerHTML = uById.specs.cost
            }
        }
    }

})

grid.addEventListener('contextmenu', (event) => {
    // Empêche le menu contextuel par défaut
    event.preventDefault()
    if (gameStarted) {
        //définir position du click
        const rect = grid.getBoundingClientRect()
        const xClick = Math.floor((event.clientX - rect.left) / 50)
        const yClick = Math.floor((event.clientY - rect.top) / 50)

        if (
            Object.keys(selectedUnit).length > 0 &&
            selectedUnit.x === xClick &&
            selectedUnit.y === yClick
        ) {
            //displaying context menu
            //console.log('Diplaying context menu ... ')
        }
        //si context click on ennemi unit selecting ennemi unit
        else if (
            Object.keys(map[xClick][yClick]).length > 0 &&
            map[xClick][yClick].player !== currentPlayer
        ) {
            //console.log('selecting ennemi unit')
            selectedUnit = map[xClick][yClick]
            player.innerHTML = selectedUnit.player
            id.innerHTML = selectedUnit.id
            color.innerHTML = selectedUnit.color
            type.innerHTML = selectedUnit.type
            coords.innerHTML = selectedUnit.x + ' ' + selectedUnit.y
            attack.innerHTML = selectedUnit.specs.attack
            shots.innerHTML =
                selectedUnit.currentSpecs.shots + '/' + selectedUnit.specs.shots
            range.innerHTML = selectedUnit.specs.range
            ammo.innerHTML =
                selectedUnit.currentSpecs.ammo + '/' + selectedUnit.specs.ammo
            armor.innerHTML = selectedUnit.specs.armor
            life.innerHTML =
                selectedUnit.currentSpecs.life + '/' + selectedUnit.specs.life
            radar.innerHTML = selectedUnit.specs.radar
            speed.innerHTML =
                selectedUnit.currentSpecs.speed + '/' + selectedUnit.specs.speed
            costs.innerHTML = selectedUnit.specs.cost
        } else {
            player.innerHTML = ''
            id.innerHTML = ''
            color.innerHTML = ''
            type.innerHTML = ''
            coords.innerHTML = ''
            attack.innerHTML = ''
            shots.innerHTML = ''
            range.innerHTML = ''
            ammo.innerHTML = ''
            armor.innerHTML = ''
            life.innerHTML = ''
            radar.innerHTML = ''
            speed.innerHTML = ''
            costs.innerHTML = ''
            selectedUnit = []
        }
    }

})

grid.addEventListener('mousemove', (event) => {
    if (gameStarted) {
        if (Object.keys(selectedUnit).length > 0) {
            const rect = grid.getBoundingClientRect()
            const cellX = Math.floor((event.clientX - rect.left) / 50)
            const cellY = Math.floor((event.clientY - rect.top) / 50)

            const isTargetCell = units.some(
                (unit) =>
                    unit.x === cellX &&
                    unit.y === cellY &&
                    unit.player !== selectedUnit.player
            )
            //si peut être rechargé ou réparé
            let isSupplyable = false
            if (cellX === selectedUnit.x && cellY === selectedUnit.y) {
                isSupplyable = false
            } else {
                isSupplyable = units.some(
                    (unit) =>
                        unit.x === cellX &&
                        unit.y === cellY &&
                        unit.player === selectedUnit.player
                )
            }

            //check si à portée de tir
            const dist = calculateDist(selectedUnit.x, selectedUnit.y, cellX, cellY)
            const isVisible = coveredCells.find(cell => cell.x === cellX && cell.y === cellY) !== undefined
            //console.log(isVisible)
            if (
                isTargetCell &&
                dist <= selectedUnit.specs.range &&
                selectedUnit.player === currentPlayer
            ) {
                grid.style.cursor = 'crosshair'
            } else if (
                isTargetCell &&
                dist > selectedUnit.specs.range &&
                selectedUnit.player === currentPlayer
                && isVisible
            ) {
                grid.style.cursor = 'move'
            } else if (
                isSupplyable &&
                dist <= 1.5 &&
                selectedUnit.player === currentPlayer
            ) {
                //inclure condition en fonction de l'unitée selectionner si canSupply ou si canRepair
                const mouseHoveredUnit = map[cellX][cellY]
                //si unité canSupply et pas max munition sur cible

                if (
                    selectedUnit.canSupply &&
                    mouseHoveredUnit.currentSpecs.ammo < mouseHoveredUnit.specs.ammo &&
                    selectedUnit.player === currentPlayer
                ) {
                    grid.style.cursor = 'progress'
                } else if (
                    selectedUnit.canRepair &&
                    mouseHoveredUnit.currentSpecs.life < mouseHoveredUnit.specs.life &&
                    selectedUnit.player === currentPlayer
                ) {
                    grid.style.cursor = 'progress'
                } else {
                    grid.style.cursor = 'default'
                }
            } else {
                grid.style.cursor = 'default'
            }
        }
    }

})

/************************************   DRAW   ************************************/
function draw() {
    //victory conditions
    //const filteredPlayer1 = units.filter((unit) => unit.player === 1)
    //const filteredPlayer2 = units.filter((unit) => unit.player === 2)
    //const qgPlayer1 =
    //    filteredPlayer1.find((unit) => unit.type === 'qg') !== undefined
    //const qgPlayer2 =
    //    filteredPlayer2.find((unit) => unit.type === 'qg') !== undefined
    //
    //if (filteredPlayer1.length === 0 || !qgPlayer1) {
    //    console.log('Player 2 win the game')
    //    console.log('Player 1 GAME OVER')
    //} else if (filteredPlayer2.length === 0 || !qgPlayer2) {
    //    console.log('Player 1 win the game')
    //    console.log('Player 2 GAME OVER')
    //}

    cctx.clearRect(0, 0, chess.width, chess.height)
    ctx.clearRect(0, 0, grid.width, grid.height)
    // Chess lines
    for (let i = 0; i < 21; i++) {
        ctx.beginPath()
        ctx.strokeStyle = 'grey'
        ctx.lineWidth = 1
        ctx.moveTo(i * 50, 0)
        ctx.lineTo(i * 50, 850)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(0, i * 50)
        ctx.lineTo(1000, i * 50)
        ctx.stroke()
    }

    // Drawing debris
    debris.forEach((d) => {
        cctx.drawImage(wreck, d.x * 50, d.y * 50, 50, 50)
    })
    // ************** Radar ****************
    // Creating an array with all cells covered by current player radarS
    coveredCells = []
    eCoveredCells = []
    units.forEach((unit) => {
        const radarRange = unit.specs.radar * 50
        const cellSize = 50
        const mapWidth = 20
        const mapHeight = 17
        let centerX = unit.x * cellSize + cellSize / 2
        let centerY = unit.y * cellSize + cellSize / 2

        // Calculer les bornes du carré englobant le cercle de portée
        let minX = Math.max(0, Math.floor((centerX - radarRange) / cellSize))
        let maxX = Math.min(
            mapWidth - 1,
            Math.ceil((centerX + radarRange) / cellSize)
        )
        let minY = Math.max(0, Math.floor((centerY - radarRange) / cellSize))
        let maxY = Math.min(
            mapHeight - 1,
            Math.ceil((centerY + radarRange) / cellSize)
        )
        // Parcourir uniquement les cases dans le carré englobant
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                // Calculer les coordonnées du centre de la case actuelle
                let cellCenterX = x * cellSize + cellSize / 2
                let cellCenterY = y * cellSize + cellSize / 2

                // Calculer la distance entre le centre de la case et le centre de l'unité
                let distance = calculateDist(
                    cellCenterX,
                    cellCenterY,
                    centerX,
                    centerY
                )
                if (unit.player === currentPlayer) {
                    // vérifier si la cellule est déjà présente dans coveredCells
                    const alreadyIn =
                        coveredCells.find((cell) => cell.x === x && cell.y === y) !==
                        undefined
                    // Vérifier si la distance est inférieure ou égale au rayon de la portée
                    if (distance <= radarRange && !alreadyIn) {
                        // Ajouter les coordonnées de la case au tableau
                        coveredCells.push({ x: x, y: y })
                    }
                } else {
                    // vérifier si la cellule est déjà présente dans coveredCells
                    const alreadyIn =
                        eCoveredCells.find((cell) => cell.x === x && cell.y === y) !==
                        undefined
                    // Vérifier si la distance est inférieure ou égale au rayon de la portée
                    if (distance <= radarRange && !alreadyIn) {
                        // Ajouter les coordonnées de la case au tableau
                        eCoveredCells.push({ x: x, y: y })
                    }
                }
            }
        }
    })

    // ************** Weapon range **************
    // Creating an array with all cells ranged by ennemi
    // for testing if entering in
    rangedCells = []
    eRangedCells = []
    units.forEach((unit, index) => {
        const range = unit.specs.range * 50
        const cellSize = 50
        const mapWidth = 20
        const mapHeight = 17
        let centerX = unit.x * cellSize + cellSize / 2
        let centerY = unit.y * cellSize + cellSize / 2

        // Calculer les bornes du carré englobant le cercle de portée
        let minX = Math.max(0, Math.floor((centerX - range) / cellSize))
        let maxX = Math.min(mapWidth - 1, Math.ceil((centerX + range) / cellSize))
        let minY = Math.max(0, Math.floor((centerY - range) / cellSize))
        let maxY = Math.min(
            mapHeight - 1,
            Math.ceil((centerY + range) / cellSize)
        )

        // Parcourir uniquement les cases dans le carré englobant
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                // Calculer les coordonnées du centre de la case actuelle
                let cellCenterX = x * cellSize + cellSize / 2
                let cellCenterY = y * cellSize + cellSize / 2

                // Calculer la distance entre le centre de la case et le centre de l'unité
                let distance = calculateDist(
                    cellCenterX,
                    cellCenterY,
                    centerX,
                    centerY
                )
                if (unit.player === currentPlayer) {
                    // vérifier si la cellule est déjà présente dans coveredCells
                    const alreadyIn = rangedCells.findIndex(
                        (cell) => cell.x === x && cell.y === y
                    )
                    // Vérifier si la distance est inférieure ou égale au rayon de la portée
                    if (distance <= range && alreadyIn === -1) {
                        // Ajouter les coordonnées de la case au tableau
                        rangedCells.push({ x: x, y: y, ids: [unit.id] })
                    } else if (distance <= range && alreadyIn !== -1) {
                        // si case déjà présente rajouter id unité
                        rangedCells[alreadyIn].ids.push(unit.id)
                    }
                } else {
                    // vérifier si la cellule est déjà présente dans coveredCells
                    const alreadyIn = eRangedCells.findIndex(
                        (cell) => cell.x === x && cell.y === y
                    )
                    // Vérifier si la distance est inférieure ou égale au rayon de la portée
                    if (distance <= range && alreadyIn === -1) {
                        // Ajouter les coordonnées de la case au tableau
                        eRangedCells.push({ x: x, y: y, ids: [unit.id] })
                    } else if (distance <= range && alreadyIn !== -1) {
                        // si case déjà présente rajouter id unité
                        eRangedCells[alreadyIn].ids.push(unit.id)
                    }
                }
            }
        }
    })

    //drawing units
    units.forEach((unit) => {
        // if Ennemy unit checking if visible by current player
        // => invisible if current player not owner
        const visible =
            coveredCells.find((cell) => cell.x === unit.x && cell.y === unit.y) !==
            undefined

        const baseX = unit.x * 50 + 10 * unit.animStep * unit.travelToX + 25
        const baseY = unit.y * 50 + 10 * unit.animStep * unit.travelToY + 25
        let img =
            unit.type === 'tank'
                ? tank
                : unit.type === 'scout'
                    ? scout
                    : unit.type === 'gun'
                        ? gun
                        : unit.type === 'qg'
                            ? qg
                            : unit.type === 'repair'
                                ? repair
                                : unit.type === 'supply'
                                    ? supply
                                    : artillery

        // life displaying
        if (displayLife && (unit.player === currentPlayer || visible)) {
            ctx.beginPath()
            ctx.strokeStyle = 'black'
            ctx.strokeRect(unit.x * 50 + 2, unit.y * 50 + 44, 46, 4)
            ctx.stroke()

            let life = Math.round((46 / unit.specs.life) * unit.currentSpecs.life)
            ctx.beginPath()
            ctx.fillStyle = 'green'
            ctx.fillRect(unit.x * 50 + 2, unit.y * 50 + 44, life, 4)
            ctx.stroke()
        }

        // Unit status displaying
        if (displayStatus && (unit.player === currentPlayer || visible)) {
            if (unit.currentSpecs.speed >= 1) {
                ctx.font = '14px DejaVu Sans'
                ctx.fillStyle = 'darkgreen'
                ctx.fillText('⇑', unit.x * 50 - 1, unit.y * 50 + 12)
            }
            if (unit.currentSpecs.shots > 0) {
                ctx.beginPath()
                ctx.fillStyle = 'brown'
                ctx.fillRect(unit.x * 50 + 44, unit.y * 50 + 7, 4, 6)
                ctx.stroke()
                ctx.beginPath()
                ctx.fillStyle = 'grey'
                ctx.moveTo(unit.x * 50 + 44, unit.y * 50 + 7)
                ctx.lineTo(unit.x * 50 + 48, unit.y * 50 + 7)
                ctx.lineTo(unit.x * 50 + 46, unit.y * 50 + 1)
                ctx.closePath()
                ctx.fill()
            }
        }

        //base unit
        if (unit.player === currentPlayer || visible) {
            cctx.save()
            cctx.translate(baseX, baseY)
            cctx.rotate((unit.angle * Math.PI) / 180)
            cctx.drawImage(img, -17, -17, 34, 34)
            cctx.restore()

            //drawing player colors
            cctx.save()
            cctx.translate(baseX, baseY)
            cctx.rotate((unit.angle * Math.PI) / 180)
            cctx.fillStyle = unit.color
            switch (unit.type) {
                case 'tank':
                    cctx.fillRect(-13, -15, 4, 4)
                    cctx.fillRect(9, 11, 4, 4)
                    break
                case 'gun':
                    cctx.fillRect(-13, -1, 4, 4)
                    cctx.fillRect(10, 9, 4, 4)
                    break
                case 'scout':
                    cctx.fillRect(-2, 10, 4, 4)
                    break
                case 'qg':
                    cctx.fillRect(-14, -15, 4, 4)
                    cctx.fillRect(10, 11, 4, 4)
                    break
                case 'repair':
                    cctx.fillRect(-15, -15, 4, 4)
                    cctx.fillRect(11, 11, 4, 4)
                    break
                case 'supply':
                    cctx.fillRect(-10, -15, 4, 4)
                    cctx.fillRect(6, 11, 4, 4)
                    break
                case 'artillery':
                    cctx.fillRect(-10, -13, 4, 4)
                    cctx.fillRect(6, 12, 4, 4)
                    break
            }
            cctx.restore()
        }
        // Put unit on map
        map[unit.x][unit.y] = unit



        //units movements
        if (unit.moving === true && unit.route.length > 0) {
            // Calculate potential move cost
            let cost =
                unit.x !== unit.route[0].x && unit.y !== unit.route[0].y ? 1.4 : 1
            // if no more move points (speed)
            if (unit.currentSpecs.speed < cost) {
                unit.moving = false
                unit.animStep = 0
                unit.travelToX = 0
                unit.travelToY = 0
                // Sentry

                autoFire(eRangedCells, unit, eCoveredCells, currentPlayer, game, ws)

            }
            else if (unit.animStep < 5) {
                unit.animStep++
            }
            else {
                unit.animStep = 0

                // delete unit on map
                map[unit.x][unit.y] = []

                // Minus cost
                unit.currentSpecs.speed -= cost

                // Updating Dom
                speed.innerHTML =
                    unit.currentSpecs.speed + '/' + unit.specs.speed

                // New coords to selected unit
                unit.x = unit.route[0].x
                unit.y = unit.route[0].y

                // Unit on map at new position
                map[unit.route[0].x][unit.route[0].y] = unit
                unit.route.shift()

                // Defining rotation to next point if needed
                if (unit.route.length > 0) {
                    let aX = unit.route[0].x - unit.x
                    let aY = unit.route[0].y - unit.y
                    let angle = 0
                    unit.travelToX = aX
                    unit.travelToY = aY
                    if (aX === 1 && aY === 0) {
                        angle = 90
                    } else if (aX === -1 && aY === 0) {
                        angle = -90
                    } else if (aX === 0 && aY === 1) {
                        angle = 180
                    } else if (aX === 0 && aY === -1) {
                        angle = 0
                    } else if (aX === 1 && aY === 1) {
                        angle = 135
                    } else if (aX === -1 && aY === 1) {
                        angle = -135
                    } else if (aX === 1 && aY === -1) {
                        angle = 45
                    } else if (aX === -1 && aY === -1) {
                        angle = -45
                    }
                    unit.angle = angle
                }

                else if (unit.route.length === 0 || (unit.route.length > 0 && unit.currentSpecs.speed < 1)) {
                    unit.travelToX = 0
                    unit.travelToY = 0
                    unit.moving = false

                    // FIN DE MOUVEMENT : 
                    // SENTRY
                    autoFire(eRangedCells, unit, eCoveredCells, currentPlayer, game, ws)

                    // MOVE AND FIRE 
                    if (unit.moveAndFire) {
                        const targetId = map[unit.objX][unit.objY].id
                        const payLoad = {
                            method: 'fire',
                            agressor: unit.id,
                            target: targetId,
                            game: game,
                        }
                        console.log('sending : ', payLoad)
                        ws.send(JSON.stringify(payLoad))
                    }
                }

                // updating fire count / moves
                if (unit.type !== 'scout') {
                    const maxMove = unit.specs.speed
                    const maxShots = unit.specs.shots
                    const treshold = maxMove / maxShots
                    const currentSpeed = unit.currentSpecs.speed
                    let remainingShots = maxShots
                    for (let i = 1; i < maxShots + 1; i++) {
                        if (currentSpeed < maxMove / i) {
                            remainingShots--
                        }
                    }
                    unit.currentSpecs.shots = remainingShots
                    shots.innerHTML = unit.currentSpecs.shots + '/' + unit.specs.shots
                }

                // Updating map
                map[unit.x][unit.y] = unit
            }
        }

        //unit firing Beware fractionned animation
        if (unit.firing === true) {
            if (unit.fireStep === 0) {
                unit.fireStep++
                units[unit.targetId].fireStep++
            } else if (unit.fireStep === 1 || unit.fireStep === 2) {
                cctx.save()
                cctx.translate(baseX, baseY)
                cctx.rotate((unit.angle * Math.PI) / 180)
                cctx.drawImage(fire, -17, -48, 34, 34)
                cctx.restore()
                unit.fireStep++
                units[unit.targetId].fireStep++
            }
        }

        // Unit autofiring
        if (unit.autoFiring === true) {
            if (unit.autoFireStep === 0) {
                unit.autoFireStep++
                units[unit.targetId].autoFireStep++
            }
            else if (unit.autoFireStep === 1 || unit.autoFireStep === 2) {
                cctx.save()
                cctx.translate(baseX, baseY)
                cctx.rotate((unit.angle * Math.PI) / 180)
                cctx.drawImage(fire, -17, -48, 34, 34)
                cctx.restore()
                unit.autoFireStep++
                units[unit.targetId].autoFireStep++
            }
        }

        // unit under autoFire
        if (
            (unit.onAutoFire === true && unit.autoFireStep === 3) ||
            unit.autoFireStep === 4
        ) {
            cctx.save()
            cctx.translate(baseX, baseY)
            cctx.rotate((unit.angle * Math.PI) / 180)
            cctx.drawImage(impact, -17, -17, 34, 34)
            cctx.restore()
            unit.autoFireStep++
            // End of animation - reinitializing
            unit.onAutoFire = false
            unit.autoFireStep = 0
            unit.targetId = null
            units[unit.agrIds[0]].autoFireStep = 0
            units[unit.agrIds[0]].autoFiring = false

            // updating shots
            units[unit.agrIds[0]].currentSpecs.shots--
            shots.innerHTML =
                units[unit.agrIds[0]].currentSpecs.shots +
                '/' +
                units[unit.agrIds[0]].specs.shots
            // updating life points
            unit.currentSpecs.life -=
                units[unit.agrIds[0]].specs.attack - unit.specs.armor
            //unit.agrIds[0] = null
            // si détruit => lancer animation de destruction
            if (unit.currentSpecs.life <= 0) {
                unit.destroyed = true
                unit.destroyStep = 0
            } else if (unit.agrIds.length > 0) {
                const payLoad = {
                    method: 'autoFire',
                    agressors: unit.agrIds,
                    target: unit.id,
                    game: game,
                }
                console.log('sending : ', payLoad)
                ws.send(JSON.stringify(payLoad))
            }
        }

        //unit under fire & destroyed launching
        if ((unit.onFire === true && unit.fireStep === 3) || unit.fireStep === 4) {
            cctx.save()
            cctx.translate(baseX, baseY)
            cctx.rotate((unit.angle * Math.PI) / 180)
            cctx.drawImage(impact, -17, -17, 34, 34)
            cctx.restore()
            unit.fireStep++
            // End of animation - reinitializing
            unit.onFire = false
            unit.fireStep = 0
            unit.targetId = null
            units[unit.agrId].fireStep = 0
            units[unit.agrId].firing = false

            // updating shots
            units[unit.agrId].currentSpecs.shots--
            shots.innerHTML =
                units[unit.agrId].currentSpecs.shots +
                '/' +
                units[unit.agrId].specs.shots
            // updating life points
            unit.currentSpecs.life -=
                units[unit.agrId].specs.attack - unit.specs.armor
            unit.agrId = null
            // si détruit => lancer animation de destruction
            if (unit.currentSpecs.life <= 0) {
                unit.destroyed = true
                unit.destroyStep = 0
            } else if (unit.agrIds.length > 0) {
                payLoad = {
                    method: 'autoFire',
                    agressors: unit.agrIds,
                    target: unit.id,
                    game: game,
                }
                console.log('sending : ', payLoad)
                ws.send(JSON.stringify(payLoad))
            }
        }

        //unit destroyed animation
        if (unit.destroyed) {
            if (unit.destroyStep === 5) {
                let dX = unit.x
                let dY = unit.y
                let qty = unit.specs.cost
                //deleting destroyed unit
                map[dX][dY] = {}
                //creating debris
                let d = new Debris(debris, dX, dY, qty)

                //updating debris list
                //checking if there's already something at this place
                const dIndex = debris.findIndex((d) => d.x === dX && d.y === dY)
                if (dIndex >= 0) {
                    debris[dIndex].qty += qty
                    debrisMap[dX][dY] = debris[dIndex]
                } else {
                    debris.push(d)
                    debrisMap[dX][dY] = d
                }

                //stopping animation/deleting unit
                unit.destroyStep = 0
                delete units[unit.id]
            } else {
                cctx.save()
                cctx.translate(baseX, baseY)
                cctx.rotate((unit.angle * Math.PI) / 180)
                if (unit.destroyStep === 0 || unit.destroyStep === 4) {
                    cctx.drawImage(impact, -17, -17, 34, 34)
                } else if (unit.destroyStep === 1 || unit.destroyStep === 3) {
                    cctx.drawImage(bigimpact, -27, -27, 50, 50)
                } else if (unit.destroyStep === 1 || unit.destroyStep === 3) {
                    cctx.drawImage(bigimpact, -50, -50, 75, 75)
                }
                cctx.restore()
                unit.destroyStep++
            }
            if (unit.player === currentPlayer) {
                selectedUnit = {}
            }
        }
    })

    //selected Unit green square, range circles, route
    if (Object.keys(selectedUnit).length > 0) {
        if (units[selectedUnit.id] && units[selectedUnit.id].moving === false) {
            // green rectangle while unit selected
            ctx.beginPath()
            ctx.strokeStyle = 'green'
            ctx.strokeRect(selectedUnit.x * 50 + 1, selectedUnit.y * 50 + 1, 48, 48)
            ctx.stroke()

            //Ranges displaying
            if (displayRanges) {
                //adding speed circle
                ctx.beginPath()
                ctx.arc(
                    selectedUnit.x * 50 + 25,
                    selectedUnit.y * 50 + 25,
                    selectedUnit.currentSpecs.speed * 50,
                    0,
                    Math.PI * 2
                )
                ctx.stroke()
                //adding radar circle
                ctx.beginPath()
                ctx.strokeStyle = 'gold'
                ctx.arc(
                    selectedUnit.x * 50 + 25,
                    selectedUnit.y * 50 + 25,
                    selectedUnit.specs.radar * 50,
                    0,
                    Math.PI * 2
                )
                ctx.stroke()
                //adding range circle
                ctx.beginPath()
                ctx.strokeStyle = 'red'
                ctx.arc(
                    selectedUnit.x * 50 + 25,
                    selectedUnit.y * 50 + 25,
                    selectedUnit.specs.range * 50,
                    0,
                    Math.PI * 2
                )
                ctx.stroke()
            }
        }

        //Route drawing while unit selected and objective square selected
        if (selectedUnit.route.length > 0) {
            let move = 0
            let step = 0
            let previousStep = 1
            selectedUnit.route.forEach((coords) => {
                let max = selectedUnit.specs.speed
                let cost =
                    selectedUnit.x !== selectedUnit.route[0].x &&
                        selectedUnit.y !== selectedUnit.route[0].y
                        ? 1.4
                        : 1
                move += cost

                step = Math.floor(move / max) + 1
                let stepColor = 'orange'
                if (step !== previousStep) {
                    previousStep = step
                    stepColor = 'red'
                }
                ctx.beginPath()
                ctx.strokeStyle = stepColor
                ctx.arc(coords.x * 50 + 25, coords.y * 50 + 25, 2, 0, Math.PI * 2)
                ctx.stroke()
                ctx.fontStyle = 'black'
                ctx.font = '10px Arial'
                ctx.fillText(
                    `${parseFloat(move.toFixed(2))} - ${step}`,
                    coords.x * 50 + 10,
                    coords.y * 50 + 25
                )
            })
        }
    }

    //drawing ressources
    minesGroups.forEach((mines) => {
        if (visible) {
            for (let mine in mines) {
                let color = mines[mine][0]
                let value = mines[mine][3]
                let i = mines[mine][1]
                let j = mines[mine][2]

                ctx.beginPath()
                ctx.strokeStyle = color
                ctx.lineWidth = 3
                ctx.arc(i * 50 + 25, j * 50 + 25, 20, 0, Math.PI * 2) //x,y,d,pi
                ctx.stroke()
                ctx.beginPath()
                ctx.font = '20px Arial'
                ctx.textAlign = 'center'
                ctx.fillStyle = color
                ctx.fillText(value, i * 50 + 25, j * 50 + 32)
            }
        }
    })
}

//function loadImages(images, callback) {
//    let loadedImages = 0
//    let numImages = images.length
//
//    images.forEach((image) => {
//        image.onload = () => {
//            loadedImages++
//            if (loadedImages === numImages) {
//                callback()
//            }
//        }
//    })
//}

setInterval(draw, 40)
//loadImages([tank, scout, gun], draw);
