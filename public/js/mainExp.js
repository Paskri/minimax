import { Debris } from './classesExp.js';
import {
    aStar,
    autoFire,
    calculateDist,
    defineAStarGrid,
    generateImages,
    lineOfSight,
    nextTurn,
} from './functions.js';
import { minesGroups } from './datasExp.js'; //state
import { CountdownTimer } from './CountDown.js';
import {
    openTransferModal,
    closeTransferModal,
} from './transferModalFunctions.js';
import { openProduceModal } from './produceModalFunction.js';
// ************* Global variables *************
let coveredCells = [];
let eCoveredCells = [];
let rangedCells = [];
let eRangedCells = [];
let selectedUnit = {};
let game = {};
let currentPlayer = 0;
let debris = [];
let units = [];
let gameStarted = true;
let deployNewUnit = false;
let deployableCells = [];
let btnState = {
    visible: false,
    displayLife: false,
    displayStatus: false,
    displayRanges: false,
    displayGridNumbers: false,
    displayTeamColors: false,
};

// ************* HTML elements **************
function getBtn(item, key) {
    console.log(item, key);
    const btn = document.querySelector(`#${item}`);
    btn.addEventListener('click', (e) => {
        btnState[key] = !btnState[key];
        btn.classList.toggle('active');
    });
}
// ************ Buttons handling ************
//display ressources
getBtn('visible', 'visible');

// display hit-points
getBtn('hit-points', 'displayLife');

// display status
getBtn('status', 'displayStatus');

// display ranges
getBtn('ranges', 'displayRanges');

// display grid numbers
getBtn('grid-numbers', 'displayGridNumbers');

// display grid numbers
getBtn('team', 'displayTeamColors');

const turnPlayer = document.querySelector('#turnPlayer');

//DOM elements
const domElements = {};
const elements = [
    'player',
    'id',
    'color',
    'type',
    'coords',
    'attack',
    'shots',
    'range',
    'ammo',
    'armor',
    'life',
    'radar',
    'speed',
    'cost',
    'cargo',
];
elements.forEach((element) => {
    const domElement = document.querySelector(`#${element}`);
    domElements[element] = domElement;
});
let modeBtnContainer = document.querySelector('#mode-btn-container');
let endTurn = document.querySelector('#endturn');
let turnDisplay = document.querySelector('#turn');

// ************* Canvas Context **************
const chess = document.querySelector('#chess');
const cctx = chess.getContext('2d');
const grid = document.querySelector('#grid');
const ctx = grid.getContext('2d');

const countDown = new CountdownTimer(() => {
    const client = game.clients.filter(
        (client) => client.playerId === currentPlayer,
    );
    if (client.length > 0) {
        const clientId = client[0].clientId;
        const payLoad = {
            method: 'endTurn',
            clientId: clientId,
            game: game,
        };
        console.log('sending:', payLoad);
        ws.send(JSON.stringify(payLoad));
    } else {
        console.error('No client found for currentPlayer');
    }
});
countDown.start()

//**************** Units images ****************
const images = generateImages();

// ******************** WebSocket connection handling ***********************
let ws = new WebSocket('ws://192.168.1.131:9090');
// getting connection params in local storage
const localStorageClient = localStorage.getItem('clientId');
let oldClientId = null;
if (localStorageClient !== 'undefined' || localStorageClient !== null) {
    oldClientId = JSON.parse(localStorageClient);
} else {
    oldClientId = null;
}

const localStorageGame = localStorage.getItem('game');
if (localStorageGame !== 'undefined' || localStorageGame !== null) {
    game = JSON.parse(localStorageGame);
} else {
    game = null;
}
// *************** WebSocket Responses handling *****************
ws.onmessage = (message) => {
    //message.data
    const response = JSON.parse(message.data);
    console.log('Server Response : ', response);

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
        };
        console.log('Sending : ', payLoad);
        ws.send(JSON.stringify(payLoad));
    }

    // UPDATE CLIENT
    if (response.method === 'updateClient') {
        const clientId = response.clientId;
        const message = response.message;

        game = response.game;
        units = response.game.units ? response.game.units : [];
        debris = response.game.debris ? response.game.debris : [];

        localStorage.setItem('clientId', JSON.stringify(clientId));
        localStorage.setItem('game', JSON.stringify(game));
        if (Object.keys(game).length === 0) {
            const payLoad = {
                method: 'createFullGame',
                clientId: clientId,
            };
            console.log('Sending : ', payLoad);
            ws.send(JSON.stringify(payLoad));
        } else {
            // trouver dans la partie le client concerné
            const currentClient = game.clients.filter(
                (client) => client.clientId === clientId,
            );
            if (currentClient.length > 0) {
                currentPlayer = currentClient[0].playerId;
                // updating DOM
                turnPlayer.innerHTML = currentPlayer;
            } else {
                const payLoad = {
                    method: 'createFullGame',
                    clientId: clientId,
                };
                console.log('Sending : ', payLoad);
                ws.send(JSON.stringify(payLoad));
            }
        }
    }

    // CREATE FULL GAME
    if (response.method === 'createFullGame') {
        currentPlayer = response.currentPlayer;
        turnPlayer.innerHTML = currentPlayer;
        game = response.game;
        units = game.units ? game.units : [];
        debris = game.debris ? game.debris : [];
        localStorage.setItem('game', JSON.stringify(game));
    }

    // ******* RESPONSES *******

    // updateGame
    if (response.method === 'updateGame') {
        game = response.game;
        units = game.units;
        debris = game.debris;
        selectedUnit = selectedUnit ? units[selectedUnit.id] : {};
        //console.log('CurrentProd: ', game.units[3].currentProd)
    }

    if (response.method === 'UNACTIVATED') {
        // unit move UNACTIVATED
        if (response.method === 'move') {
            //    const unitId = response.unitId
            //    const route = response.route
            //    const unit = units[unitId]
            //    unit.route = route
            //    unit.moving = true
            //    unit.animStep = 0
        }

        // move and fire UNACTIVATED
        if (response.method === 'moveAndFire') {
            //const unitId = response.unitId
            //const route = response.route
            //const unit = units[unitId]
            //unit.route = route
            //unit.moving = true
            //unit.animStep = 0
        }

        // unit fire UNACTIVATED
        if (response.method === 'fire') {
            //    const agressor = response.agressor
            //    const target = response.target
            //    const game = response.game
            //    //tir
            //    units[agressor].firing = true
            //    // mise à jour datas
            //    units[target].onFire = true
            //    units[target].agrId = agressor
            //    units[agressor].targetX = units[target].x
            //    units[agressor].targetY = units[target].y
            //    units[agressor].targetId = target
            //    units[agressor].currentSpecs.ammo--
            //    ammo.innerHTML =
            //        units[agressor].currentSpecs.ammo + '/' + units[agressor].specs.ammo
            //    //définir angle de tir
            //    let x = units[target].x - units[agressor].x
            //    let y = units[target].y - units[agressor].y
            //    let fireAngle = (Math.atan2(y, x) * (180 / Math.PI) + 90) % 360
            //    units[agressor].angle = fireAngle
            //    //removing eventual moveAndFire
            //    units[agressor].moveAndFire = false
        }

        // autoFire UNACTIVATED
        if (response.method === 'autoFire') {
            //    let agressors = response.agressors
            //    const agressor = response.agressors[0]
            //    const target = response.target
            //    const game = response.game
            //
            //    //console.log(agressor, target)
            //    if (
            //        units[agressor].currentSpecs.shots > 0 &&
            //        units[agressor].currentSpecs.ammo > 0
            //    ) {
            //        //units[agressor].firing = true
            //        units[agressor].autoFiring = true
            //        //mise à jour datas
            //        units[target].onAutoFire = true
            //        //units[target].agrId = agressor
            //        units[target].agrIds = agressors
            //        units[agressor].targetX = units[target].x
            //        units[agressor].targetY = units[target].y
            //        units[agressor].targetId = target
            //        units[agressor].currentSpecs.ammo--
            //        ammo.innerHTML =
            //            units[agressor].currentSpecs.ammo + '/' + units[agressor].specs.ammo
            //        //définir angle de tir
            //        let x = units[target].x - units[agressor].x
            //        let y = units[target].y - units[agressor].y
            //        let fireAngle = (Math.atan2(y, x) * (180 / Math.PI) + 90) % 360
            //        units[agressor].angle = fireAngle
            //
            //    } else {
            //        //desactive autoFiring puis supprime l'agresseur de la liste
            //        units[agressors[0]].autoFiring = false
            //        units[agressor].targetX = null;
            //        units[agressor].targetY = null;
            //        units[agressor].targetId = null;
            //        agressors.shift()
            //        if (agressors.length > 0) {
            //            const payLoad = {
            //                method: 'autoFire',
            //                agressors: agressors,
            //                target: target,
            //                gameId: game.id,
            //            }
            //            console.log('sending : ', payLoad)
            //            ws.send(JSON.stringify(payLoad))
            //        } else {
            //            //supprimer autofire sur l'unité en question
            //            units[target].onAutoFire = false
            //            units[target].agrIds = []
            //        }
            //    }
        }

        // repairing UNACTIVATED
        if (response.method === 'repairUnit') {
            //const unitId = response.unitId
            //units[unitId].currentSpecs.life = units[unitId].specs.life
        }

        // supplying UNACTIVATED
        if (response.method === 'supplyUnit') {
            //const unitId = response.unitId
            //units[unitId].currentSpecs.ammo = units[unitId].specs.ammo
        }
    }

    // start count down UNACTIVATED
    if (response.method === 'startCount') {
        countDown.start();
    }

    // end turn
    if (response.method === 'endTurn') {
        const clientId = response.clientId;
        const game = response.game;
        countDown.adjustTimer();
    }

    // next turn
    if (response.method === 'nextTurn') {
        const game = response.game;
        nextTurn(selectedUnit, game, units);
        countDown.stop();
        countDown.start();
    }
};

//creating map
let map = [];
for (let i = 0; i < 20; i++) {
    map[i] = [];
    for (let j = 0; j < 17; j++) {
        map[i][j] = {};
    }
}

//creating debrisMap
let debrisMap = [];
for (let i = 0; i < 20; i++) {
    debrisMap[i] = [];
    for (let j = 0; j < 17; j++) {
        debrisMap[i][j] = {};
    }
}

// ************************** Listeners **************************
endTurn.addEventListener('click', (e) => {
    //execution de tous les mouvement en attente

    const client = game.clients.filter(
        (client) => client.playerId === currentPlayer,
    );
    const clientId = client[0].clientId;
    endTurn.classList.add('active');
    const payLoad = {
        method: 'endTurn',
        clientId: clientId,
        game: game,
    };
    console.log('sending : ', payLoad);
    ws.send(JSON.stringify(payLoad));
});

grid.addEventListener('click', (e) => {
    console.log('selectedUnit: ', selectedUnit, 'click on ');
    if (gameStarted) {
        deployNewUnit = false;
        let payLoad = {};
        let calculatedRoute = [];
        const rect = grid.getBoundingClientRect();
        let selected = {
            x: Math.floor((e.clientX - rect.left) / 50),
            y: Math.floor((e.clientY - rect.top) / 50),
        };
        const targetUnit = map[selected.x][selected.y];

        // removing eventual mode buttons
        modeBtnContainer.setAttribute(
            'style',
            'display: none; top: -100px; left: -100px',
        );
        // Visibilité radar
        const visible =
            coveredCells.find(
                (cell) => cell.x === selected.x && cell.y === selected.y,
            ) !== undefined;
        console.log('click target on map: ', targetUnit, 'coords: x = ', selected.x, ' y = ', selected.y, ' visible: ', visible)


        // is target neighbor ?
        let isNeighbor = false;
        if (selectedUnit) {
            isNeighbor =
                calculateDist(
                    targetUnit.x,
                    targetUnit.y,
                    selectedUnit.x,
                    selectedUnit.y,
                ) < 2;
        }

        // selectedUnit and click on cell containing friend
        // unit which need to be repaired or resupplied
        if (
            selectedUnit &&
            Object.keys(selectedUnit).length > 0 &&
            targetUnit &&
            targetUnit.player === selectedUnit.player &&
            ((selectedUnit.canRepair &&
                targetUnit.currentSpecs.life < targetUnit.specs.life) ||
                (selectedUnit.canSupply &&
                    targetUnit.currentSpecs.ammo < targetUnit.specs.ammo) ||
                (selectedUnit.canCargo && targetUnit.canCargo)) &&
            isNeighbor &&
            ['repair', 'supply', 'transfer'].includes(selectedUnit.activeModes[0])
        ) {
            console.log('Click Case 1')
            //repairing unit
            if (
                selectedUnit.canRepair &&
                selectedUnit.activeModes.includes('repair') &&
                targetUnit.currentSpecs.life < targetUnit.specs.life &&
                isNeighbor
            ) {
                //launching repair animation or sound
                const payLoad = {
                    method: 'repairUnit',
                    unitId: targetUnit.id,
                    gameId: game.id,
                };
                console.log('Sending : ', payLoad);
                ws.send(JSON.stringify(payLoad));
                grid.style.cursor = 'default';
            }

            //supplying unit
            else if (
                selectedUnit.canSupply &&
                selectedUnit.activeModes.includes('supply') &&
                targetUnit.currentSpecs.ammo < targetUnit.specs.ammo &&
                isNeighbor
            ) {
                //launching reSuplly animation or sound
                const payLoad = {
                    method: 'supplyUnit',
                    unitId: targetUnit.id,
                    gameId: game.id,
                };
                console.log('Sending : ', payLoad);
                ws.send(JSON.stringify(payLoad));
                grid.style.cursor = 'default';
            }

            //transfer cargo
            else if (
                selectedUnit.canCargo &&
                selectedUnit.activeModes.includes('transfer') &&
                targetUnit.canCargo &&
                selectedUnit.id !== targetUnit.id &&
                isNeighbor
            ) {
                openTransferModal(
                    selectedUnit,
                    images[selectedUnit.type],
                    targetUnit,
                    images[targetUnit.type],
                    game,
                    ws,
                );
            }
        }

        // selected unit and click on an visible ennemy
        else if (
            selectedUnit &&
            Object.keys(selectedUnit).length > 0 &&
            Object.keys(map[selected.x][selected.y]).length > 0 &&
            map[selected.x][selected.y].player !== selectedUnit.player &&
            selectedUnit.currentSpecs.shots > 0 &&
            visible &&
            selectedUnit.player === currentPlayer
        ) {
            console.log('click case 2')
            let sUnit = selectedUnit;
            let target = map[selected.x][selected.y];
            // checking if target in range
            const dist = calculateDist(target.x, target.y, sUnit.x, sUnit.y);
            const isLineOfSight = lineOfSight(
                map,
                selectedUnit.x,
                selectedUnit.y,
                target.x,
                target.y,
            );

            //target In range : Firing
            if (
                sUnit.specs.range >= dist &&
                sUnit.currentSpecs.ammo > 0 &&
                (isLineOfSight || sUnit.type === 'artillery' || target.type === 'wall')
            ) {
                payLoad = {
                    method: 'fire',
                    agressor: sUnit.id,
                    target: target.id,
                    gameId: game.id,
                };
                console.log('sending : ', payLoad);
                ws.send(JSON.stringify(payLoad));
            }
            //Out of range: move and fire
            else if (
                (sUnit.specs.range < dist || !isLineOfSight) &&
                sUnit.currentSpecs.ammo > 0
            ) {
                const aStarGrid = defineAStarGrid(map);
                //Calculating optimal route
                let calculatedRoute = aStar(
                    aStarGrid[selectedUnit.x][selectedUnit.y],
                    aStarGrid[selected.x][selected.y],
                    aStarGrid,
                    true,
                );
                //Removing useless moves
                calculatedRoute.forEach((coords, index) => {
                    const dist = calculateDist(
                        selected.x,
                        selected.y,
                        coords.x,
                        coords.y,
                    );
                    let inSight = true;
                    if (!isLineOfSight) {
                        inSight = lineOfSight(
                            map,
                            coords.x,
                            coords.y,
                            selected.x,
                            selected.y,
                        );
                    }

                    if (dist <= selectedUnit.specs.range && inSight) {
                        calculatedRoute = calculatedRoute.slice(0, index + 1);
                    }
                });
                //Sending datas
                payLoad = {
                    method: 'moveAndFire',
                    unitId: selectedUnit.id,
                    route: calculatedRoute,
                    target: { x: selected.x, y: selected.y },
                    targetId: target.id,
                    gameId: game.id,
                };
                console.log('sending : ', payLoad);
                ws.send(JSON.stringify(payLoad));
            }
            // Not in range or not in sight
            else {
                console.log('Not in range or not in sight');
            }
        }

        // selected unit and click on empty place, wreck or invisible ennemy
        // --> Move or deploy new unit or cannot move while constructing
        else if (
            (selectedUnit &&
                Object.keys(selectedUnit).length > 0 &&
                selectedUnit.x >= 0 &&
                selectedUnit.y >= 0 &&
                selectedUnit.player === currentPlayer &&
                (Object.keys(targetUnit).length === 0 || targetUnit.walkable === true)) ||
            (Object.keys(targetUnit).length > 0 && !visible)
        ) {
            console.log('Click case 3', selectedUnit)
            if (selectedUnit.canProduce && selectedUnit.producing) {
                console.log('Unit cannot move while constructing');
                if (selectedUnit.currentProd.turnsRemain <= 0) {
                    const payLoad = {
                        method: 'deployNewUnit',
                        unitId: selectedUnit.id,
                        coords: { x: selected.x, y: selected.y },
                        gameId: game.id,
                    };
                    console.log('sending : ', payLoad);
                    ws.send(JSON.stringify(payLoad));
                }
            }
            else if (selectedUnit.canScrap && selectedUnit.scrapping) {
                console.log('Unit cannot move while constructing');
            }
            // Mouvement
            //unit already moving
            else if (selectedUnit && Object.values(selectedUnit).length > 0 && selectedUnit.moving === true) {
                //stop
                const currentIndex = selectedUnit.route.findIndex(
                    (coords) =>
                        coords.x === selectedUnit.x && coords.y === selectedUnit.y,
                );
                units[selectedUnit.id].route = [selectedUnit.route[currentIndex + 1]];
                const payLoad = {
                    method: 'stop',
                    unit: selectedUnit,
                    gameId: game.id,
                };
                console.log('sending : ', payLoad);
                ws.send(JSON.stringify(payLoad));
            } else if (selectedUnit && Object.values(selectedUnit).length > 0) {
                // target and route
                selectedUnit.objX = selected.x;
                selectedUnit.objY = selected.y;

                // map clone for route search
                const aStarGrid = defineAStarGrid(map);

                //A* implementation - calculating optimised route
                const calculatedRoute = aStar(
                    aStarGrid[selectedUnit.x][selectedUnit.y],
                    aStarGrid[selected.x][selected.y],
                    aStarGrid,
                );
                // if possible route
                if (calculatedRoute.length > 0) {
                    payLoad = {
                        method: 'move',
                        unitId: selectedUnit.id,
                        route: calculatedRoute,
                        gameId: game.id,
                    };
                    console.log('sending : ', payLoad);
                    ws.send(JSON.stringify(payLoad));
                } else {
                    console.log('Destination impossible à atteindre');
                }
            }
        }

        // selecting a unit
        else if (
            selected.x != null &&
            selected.y != null &&
            Object.keys(targetUnit).length > 0 &&
            visible &&
            targetUnit.player === currentPlayer
        ) {
            console.log('Case 4 : Selecting à unit')
            selectedUnit = targetUnit;
            if (targetUnit.canProduce && targetUnit.currentProd.turnsRemain <= 0) {
                deployNewUnit = true;
            }
            console.log('Values: se: ', selectedUnit, ' ok se: ', Object.keys(selectedUnit).length, ' se x: ',
                selectedUnit.x, ' se y: ',
                selectedUnit.y, ' se player: ',
                selectedUnit.player, ' se current player: ', currentPlayer, ' tu walkable: ', targetUnit.walkable, ' visible: ', visible)
        }
    }
});

grid.addEventListener('contextmenu', (event) => {
    // Empêche le menu contextuel par défaut
    event.preventDefault();
    if (gameStarted) {
        //définir position du click
        const rect = grid.getBoundingClientRect();
        const xClick = Math.floor((event.clientX - rect.left) / 50);
        const yClick = Math.floor((event.clientY - rect.top) / 50);
        console;
        if (
            selectedUnit &&
            Object.keys(selectedUnit).length > 0 &&
            selectedUnit.x === xClick &&
            selectedUnit.y === yClick &&
            selectedUnit.player === currentPlayer
        ) {
            console.log(selectedUnit);
            const modeBtnContainer = document.querySelector('#mode-btn-container');
            modeBtnContainer.innerHTML = '';
            let modesArray = [];

            function handleModeClick(e, mode, selectedUnit) {
                //allready active
                //if (selectedUnit.activeModes.includes(mode)) return;
                //
                if (['move', 'repair', 'supply', 'transfer'].includes(mode)) {
                    const currentModebtn = document.querySelector(
                        `.${selectedUnit.activeModes[0]}`,
                    );
                    currentModebtn.classList.remove('active');
                    const newActiveBtn = document.querySelector(`.${mode}`);
                    newActiveBtn.classList.add('active');
                    selectedUnit.activeModes = [mode];
                } else if (mode === 'fire') {
                    //toggle
                } else if (mode === 'sentry') {
                    //toggle
                } else if (mode === 'produce') {
                    //openning production modal
                    openProduceModal(selectedUnit, images, game.id, ws);
                } else if (mode === 'scrap') {
                    //Launching scrap function
                    if (selectedUnit.activeModes[0] !== 'scrap') {
                        if (
                            Object.values(debrisMap[selectedUnit.x][selectedUnit.y]).length > 0
                        ) {
                            console.log('Débris présent');
                            // scrap 12 par tour max
                            const payLoad = {
                                method: 'scrap',
                                unitId: selectedUnit.id,
                                gameId: game.id,
                                toggle: true
                            };
                            console.log('Sending : ', payLoad);
                            ws.send(JSON.stringify(payLoad));
                        } else {
                            console.log('pas de débris');
                        }
                    } else {
                        console.log('End scrapping')
                        const payLoad = {
                            method: 'scrap',
                            unitId: selectedUnit.id,
                            gameId: game.id,
                            toggle: false
                        };
                        console.log('Sending : ', payLoad);
                        ws.send(JSON.stringify(payLoad));
                    }
                } else if (mode === 'exploit') {
                    if (selectedUnit.activeModes[0] !== 'exploit') {
                        const mineIndex = minesGroups.findIndex(mine => mine.x === selectedUnit.x && mine.y === selectedUnit.y)
                        if (
                            mineIndex !== -1
                        ) {
                            console.log('Mine Founded');
                            // scrap 12 par tour max
                            const payLoad = {
                                method: 'exploit',
                                unitId: selectedUnit.id,
                                gameId: game.id,
                                toggle: true
                            };
                            console.log('Sending : ', payLoad);
                            ws.send(JSON.stringify(payLoad));
                        } else {
                            console.log('No mine at this place');
                        }
                    } else {
                        console.log('End exploit')
                        const payLoad = {
                            method: 'exploit',
                            unitId: selectedUnit.id,
                            gameId: game.id,
                            toggle: false
                        };
                        console.log('Sending : ', payLoad);
                        ws.send(JSON.stringify(payLoad));
                    }
                }
                modeBtnContainer.setAttribute(
                    'style',
                    'top: -100px; left: -100px; display: none;',
                );
                modeBtnContainer.innerHTML = '';
            }
            // possible modes : move, fire, sentry(toogle), repair, supply, transfer
            // construction mode array
            selectedUnit.modes.forEach((mode) => {
                const btn = document.createElement('div');
                btn.setAttribute('id', 'mode-btn');
                btn.classList.add(mode);
                if (selectedUnit.activeModes.includes(mode)) {
                    btn.classList.add('active');
                }
                btn.innerHTML = mode.charAt(0).toUpperCase() + mode.slice(1);
                btn.onclick = (e) => handleModeClick(e, mode, selectedUnit);
                modeBtnContainer.appendChild(btn);
            });

            modeBtnContainer.setAttribute(
                'style',
                `top: ${selectedUnit.y * 50 + 20}px; left: ${selectedUnit.x * 50 + 65}px`,
            );
        }
        //si context click on ennemi unit selecting ennemi unit
        else if (
            Object.keys(map[xClick][yClick]).length > 0 &&
            map[xClick][yClick].player !== currentPlayer
        ) {
            selectedUnit = map[xClick][yClick];
        }
        // si click sur autre
        else {
            selectedUnit = {};
        }
    }
});

grid.addEventListener('mousemove', (event) => {
    if (gameStarted && selectedUnit && Object.keys(selectedUnit).length > 0) {
        const rect = grid.getBoundingClientRect();
        const cellX = Math.floor((event.clientX - rect.left) / 50);
        const cellY = Math.floor((event.clientY - rect.top) / 50);

        const isTargetCell = units.some(
            (unit) =>
                unit &&
                unit.x === cellX &&
                unit.y === cellY &&
                unit.player !== selectedUnit.player,
        );
        //si peut être rechargé ou réparé
        let isSupplyable = false;
        if (cellX === selectedUnit.x && cellY === selectedUnit.y) {
            isSupplyable = false;
        } else {
            isSupplyable = units.some(
                (unit) =>
                    unit &&
                    unit.x === cellX &&
                    unit.y === cellY &&
                    unit.player === selectedUnit.player,
            );
        }
        let isTranferable = false;
        if (cellX === selectedUnit.x && cellY === selectedUnit.y) {
            isTranferable = false;
        } else {
            isTranferable = units.some(
                (unit) =>
                    unit &&
                    unit.x === cellX &&
                    unit.y === cellY &&
                    unit.player === selectedUnit.player,
            );
        }

        //check si à portée de tir
        const dist = calculateDist(selectedUnit.x, selectedUnit.y, cellX, cellY);
        const isVisible =
            coveredCells.find((cell) => cell.x === cellX && cell.y === cellY) !==
            undefined;
        const isLineOfSight = lineOfSight(
            map,
            selectedUnit.x,
            selectedUnit.y,
            cellX,
            cellY,
        );
        const isInRange = dist <= selectedUnit.specs.range;
        const isWall =
            map[cellX] && map[cellX][cellY] && map[cellX][cellY].type === 'wall';
        const isArtillery = selectedUnit.type === 'artillery';
        // console.log('isTargetCell: ', isTargetCell, 'isVibible: ', isVisible, ' isLineOfSight: ', isLineOfSight, ' isInRange: ', isInRange, ' isWall: ', isWall, ' isArtillery: ', isArtillery)

        if (
            isTargetCell &&
            (isLineOfSight || selectedUnit.type === 'artillery' || isWall) &&
            isInRange &&
            selectedUnit.player === currentPlayer &&
            selectedUnit.currentSpecs.ammo > 0 &&
            selectedUnit.currentSpecs.shots > 0
        ) {
            grid.style.cursor = 'crosshair';
        } else if (
            isTargetCell &&
            (!isInRange || !isLineOfSight) &&
            selectedUnit.player === currentPlayer &&
            isVisible &&
            selectedUnit.currentSpecs.ammo > 0 &&
            selectedUnit.currentSpecs.shots > 0
        ) {
            grid.style.cursor = 'move';
        } else if (
            isSupplyable &&
            dist <= 1.5 &&
            selectedUnit.player === currentPlayer
        ) {
            //inclure condition en fonction de l'unitée selectionner si canSupply ou si canRepair
            const mouseHoveredUnit = map[cellX][cellY];
            //si unité canSupply et pas max munition sur cible

            if (
                selectedUnit.canSupply &&
                selectedUnit.activeModes.includes('supply') &&
                mouseHoveredUnit.currentSpecs.ammo < mouseHoveredUnit.specs.ammo &&
                selectedUnit.player === currentPlayer
            ) {
                console.log('can supply');
                grid.style.cursor = 'progress';
            } else if (
                selectedUnit.canRepair &&
                selectedUnit.activeModes.includes('repair') &&
                mouseHoveredUnit.currentSpecs.life < mouseHoveredUnit.specs.life &&
                selectedUnit.player === currentPlayer
            ) {
                console.log('can repair');
                grid.style.cursor = 'progress';
            } else if (
                selectedUnit.canCargo &&
                selectedUnit.activeModes.includes('transfer') &&
                mouseHoveredUnit.canCargo &&
                selectedUnit.player === currentPlayer
            ) {
                console.log('can transfer');
                grid.style.cursor = 'url("../img/transfer-cursor.png"), auto';
            } else {
            }
        } else {
            grid.style.cursor = 'default';
        }
    }
});

/*******************************   DRAW   *******************************/
function draw() {
    //updating selectedUnit displayed datas
    const dataContainer = document.querySelector('#datas');
    if (selectedUnit && Object.keys(selectedUnit).length > 0) {
        //updating displayed infos
        let uById = units[selectedUnit.id];
        if (uById && Object.values(uById).length > 0)
            for (const element in domElements) {
                //console.log('For: ', element, domElements[element])
                const de = domElements[element];
                if (['player', 'id', 'color', 'type'].includes(element)) {
                    de.innerHTML = uById[element];
                } else if (element === 'coords') {
                    de.innerHTML = uById.x + ' ' + uById.y;
                } else if (
                    ['attack', 'range', 'armor', 'radar', 'cost'].includes(element)
                ) {
                    de.innerHTML = uById.specs[element];
                } else if (element === 'cargo') {
                    de.innerHTML = uById.canCargo
                        ? uById.currentSpecs[element] + '/' + uById.specs[element]
                        : 'Not capable';
                } else {
                    de.innerHTML = uById.currentSpecs[element] + '/' + uById.specs[element];
                }
            }

        //datas
        dataContainer.innerHTML = '';

        Object.keys(selectedUnit).forEach((key) => {
            const div = document.createElement('div');
            div.innerHTML = `${key} : ${selectedUnit[key]}`;
            dataContainer.appendChild(div);
        });
    } else {
        for (const element in domElements) {
            domElements[element].innerHTML = ' -- ';
        }
        dataContainer.innerHTML = 'Empty ! select a unit !!';
    }

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

    cctx.clearRect(0, 0, chess.width, chess.height);
    ctx.clearRect(0, 0, grid.width, grid.height);
    // Chess lines
    for (let i = 0; i < 21; i++) {
        ctx.beginPath();
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 1;
        ctx.moveTo(i * 50, 0);
        ctx.lineTo(i * 50, 850);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * 50);
        ctx.lineTo(1000, i * 50);
        ctx.stroke();
    }

    // ************** Radar ****************
    // Creating an array with all cells covered by current player radarS
    coveredCells = [];
    eCoveredCells = [];
    units.forEach((unit) => {
        if (unit && Object.values(unit).length > 0) {
            const radarRange = unit.specs.radar * 50;
            const cellSize = 50;
            const mapWidth = 20;
            const mapHeight = 17;
            let centerX = unit.x * cellSize + cellSize / 2;
            let centerY = unit.y * cellSize + cellSize / 2;

            // Calculer les bornes du carré englobant le cercle de portée
            let minX = Math.max(0, Math.floor((centerX - radarRange) / cellSize));
            let maxX = Math.min(
                mapWidth - 1,
                Math.ceil((centerX + radarRange) / cellSize),
            );
            let minY = Math.max(0, Math.floor((centerY - radarRange) / cellSize));
            let maxY = Math.min(
                mapHeight - 1,
                Math.ceil((centerY + radarRange) / cellSize),
            );
            // Parcourir uniquement les cases dans le carré englobant
            for (let y = minY; y <= maxY; y++) {
                for (let x = minX; x <= maxX; x++) {
                    // Calculer les coordonnées du centre de la case actuelle
                    let cellCenterX = x * cellSize + cellSize / 2;
                    let cellCenterY = y * cellSize + cellSize / 2;

                    // Calculer la distance entre le centre de la case et le centre de l'unité
                    let distance = calculateDist(
                        cellCenterX,
                        cellCenterY,
                        centerX,
                        centerY,
                    );
                    if (unit.player === currentPlayer) {
                        // vérifier si la cellule est déjà présente dans coveredCells
                        const alreadyIn =
                            coveredCells.find((cell) => cell.x === x && cell.y === y) !==
                            undefined;
                        // Vérifier si la distance est inférieure ou égale au rayon de la portée
                        if (distance <= radarRange && !alreadyIn) {
                            // Ajouter les coordonnées de la case au tableau
                            coveredCells.push({ x: x, y: y });
                        }
                    } else {
                        // vérifier si la cellule est déjà présente dans coveredCells
                        const alreadyIn =
                            eCoveredCells.find((cell) => cell.x === x && cell.y === y) !==
                            undefined;
                        // Vérifier si la distance est inférieure ou égale au rayon de la portée
                        if (distance <= radarRange && !alreadyIn) {
                            // Ajouter les coordonnées de la case au tableau
                            eCoveredCells.push({ x: x, y: y });
                        }
                    }
                }
            }
        }
    });

    // ************** Weapon range **************
    // Creating an array with all cells ranged by ennemi
    // for testing if entering in
    rangedCells = [];
    eRangedCells = [];
    units.forEach((unit, index) => {
        if (unit && Object.values(unit).length > 0) {
            const range = unit.specs.range * 50;
            const cellSize = 50;
            const mapWidth = 20;
            const mapHeight = 17;
            let centerX = unit.x * cellSize + cellSize / 2;
            let centerY = unit.y * cellSize + cellSize / 2;

            // Calculer les bornes du carré englobant le cercle de portée
            let minX = Math.max(0, Math.floor((centerX - range) / cellSize));
            let maxX = Math.min(
                mapWidth - 1,
                Math.ceil((centerX + range) / cellSize),
            );
            let minY = Math.max(0, Math.floor((centerY - range) / cellSize));
            let maxY = Math.min(
                mapHeight - 1,
                Math.ceil((centerY + range) / cellSize),
            );
            // Parcourir uniquement les cases dans le carré englobant
            for (let y = minY; y <= maxY; y++) {
                for (let x = minX; x <= maxX; x++) {
                    // Calculer les coordonnées du centre de la case actuelle
                    let cellCenterX = x * cellSize + cellSize / 2;
                    let cellCenterY = y * cellSize + cellSize / 2;

                    // Calculer la distance entre le centre de la case et le centre de l'unité
                    let distance = calculateDist(
                        cellCenterX,
                        cellCenterY,
                        centerX,
                        centerY,
                    );
                    if (unit.player === currentPlayer) {
                        // vérifier si la cellule est déjà présente dans coveredCells
                        const alreadyIn = rangedCells.findIndex(
                            (cell) => cell.x === x && cell.y === y,
                        );
                        // Vérifier si la distance est inférieure ou égale au rayon de la portée
                        if (distance <= range && alreadyIn === -1) {
                            // Ajouter les coordonnées de la case au tableau
                            rangedCells.push({ x: x, y: y, ids: [unit.id] });
                        } else if (distance <= range && alreadyIn !== -1) {
                            // si case déjà présente rajouter id unité
                            rangedCells[alreadyIn].ids.push(unit.id);
                        }
                    } else {
                        // vérifier si la cellule est déjà présente dans coveredCells
                        const alreadyIn = eRangedCells.findIndex(
                            (cell) => cell.x === x && cell.y === y,
                        );
                        // Vérifier si la distance est inférieure ou égale au rayon de la portée
                        if (distance <= range && alreadyIn === -1) {
                            // Ajouter les coordonnées de la case au tableau
                            eRangedCells.push({ x: x, y: y, ids: [unit.id] });
                        } else if (distance <= range && alreadyIn !== -1) {
                            // si case déjà présente rajouter id unité
                            eRangedCells[alreadyIn].ids.push(unit.id);
                        }
                    }
                }
            }
        }
    });

    // grid coords
    if (btnState.displayGridNumbers) {
        for (let i = 0; i < 20; i++) {
            for (let j = 0; j < 17; j++) {
                const visibleOnGrid =
                    coveredCells.find((cell) => cell.x === i && cell.y === j) !==
                    undefined;
                //si pas d'unité unité et si visible
                if (
                    !Object.keys(map[i][j]).length > 0 ||
                    (Object.keys(map[i][j]).length > 0 && !visibleOnGrid)
                ) {
                    cctx.font = '10px DejaVu Sans';
                    cctx.fillStyle = '#222';
                    cctx.fillText(`${i} - ${j}`, i * 50 + 5, j * 50 + 12);
                }
            }
        }
    }

    // Drawing debris
    debris.forEach((d) => {
        const visible =
            coveredCells.find((cell) => cell.x === d.x && cell.y === d.y) !==
            undefined;
        if (visible) {
            debrisMap[d.x][d.y] = d;
            cctx.drawImage(images.wreck, d.x * 50, d.y * 50, 50, 50);
        }

    });

    //drawing units
    units.forEach((unit) => {
        if (unit && Object.values(unit).length > 0) {
            // Si unité adverse tester si présente dans les cases radar du joueur courant
            // invisible si unité n'appartient pas au joueur courant
            const visible =
                coveredCells.find((cell) => cell.x === unit.x && cell.y === unit.y) !==
                undefined;

            const baseX = unit.x * 50 + 10 * unit.animStep * unit.travelToX + 25;
            const baseY = unit.y * 50 + 10 * unit.animStep * unit.travelToY + 25;

            //getting image
            let img = images[unit.type];

            // life displaying
            if (
                btnState.displayLife &&
                (unit.player === currentPlayer || visible) &&
                !unit.destroyed
            ) {
                //life displaying
                ctx.beginPath();
                ctx.strokeStyle = 'black';
                ctx.strokeRect(unit.x * 50 + 2, unit.y * 50 + 46, 46, 2);
                ctx.stroke();
                let life = Math.round((46 / unit.specs.life) * unit.currentSpecs.life);
                ctx.beginPath();
                ctx.fillStyle = '#00FF00';
                ctx.fillRect(unit.x * 50 + 2, unit.y * 50 + 46, life > 0 ? life : 0, 2);
                ctx.stroke();

                //ammo displaying

                if (unit.canFire) {
                    ctx.beginPath();
                    ctx.strokeStyle = 'black';
                    ctx.strokeRect(unit.x * 50 + 2, unit.y * 50 + 42, 46, 2);
                    ctx.stroke();
                    let ammo = Math.round(
                        (46 / unit.specs.ammo) * unit.currentSpecs.ammo,
                    );
                    ctx.beginPath();
                    ctx.fillStyle = '#FFFF00';
                    ctx.fillRect(
                        unit.x * 50 + 2,
                        unit.y * 50 + 42,
                        ammo >= 0 ? ammo : 0,
                        2,
                    );
                    ctx.stroke();
                }
                if (unit.canCargo) {
                    ctx.beginPath();
                    ctx.strokeStyle = 'black';
                    ctx.strokeRect(unit.x * 50 + 2, unit.y * 50 + 42, 46, 2);
                    ctx.stroke();
                    let cargo = Math.round(
                        (46 / unit.specs.cargo) * unit.currentSpecs.cargo,
                    );
                    ctx.beginPath();
                    ctx.fillStyle = 'purple';
                    ctx.fillRect(
                        unit.x * 50 + 2,
                        unit.y * 50 + 42,
                        cargo >= 0 ? cargo : 0,
                        2,
                    );
                    ctx.stroke();
                }
            }

            // Unit status displaying
            if (
                btnState.displayStatus &&
                (unit.player === currentPlayer || visible) &&
                !unit.destroyed
            ) {
                if (unit.currentSpecs.speed >= 1) {
                    ctx.font = '14px DejaVu Sans';
                    ctx.fillStyle = '#00FF00';
                    ctx.fillText('⇑', unit.x * 50 - 1, unit.y * 50 + 12);
                }
                if (unit.currentSpecs.shots > 0) {
                    ctx.beginPath();
                    ctx.fillStyle = 'brown';
                    ctx.fillRect(unit.x * 50 + 44, unit.y * 50 + 7, 4, 6);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.fillStyle = '#444';
                    ctx.moveTo(unit.x * 50 + 44, unit.y * 50 + 7);
                    ctx.lineTo(unit.x * 50 + 48, unit.y * 50 + 7);
                    ctx.lineTo(unit.x * 50 + 46, unit.y * 50 + 1);
                    ctx.closePath();
                    ctx.fill();
                }
            }

            // team color squares
            if (
                btnState.displayTeamColors &&
                (unit.player === currentPlayer || visible) &&
                !unit.destroyed
            ) {
                ctx.beginPath();
                ctx.strokeStyle = unit.color;
                ctx.strokeRect(unit.x * 50, unit.y * 50, 50, 50);
                ctx.stroke();
            }

            //Unit production options
            if (unit.canProduce && (unit.player === currentPlayer || visible)) {
                if (unit.producing) {
                    cctx.save();
                    cctx.translate(baseX, baseY);
                    cctx.rotate((unit.angle * Math.PI) / 180);
                    cctx.drawImage(images['construct'], -25, -25, 50, 50);
                    cctx.restore();
                }
                if (unit.producing && unit.currentProd.turnsRemain <= 0) {
                    ctx.font = '16px DejaVu Sans';
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillText('New', unit.x * 50 + 8, unit.y * 50 + 20);
                    ctx.fillText('Unit', unit.x * 50 + 10, unit.y * 50 + 40);
                    // get empty neighbor cells
                    const emptyNeighborCells = [];
                    if (
                        deployNewUnit &&
                        selectedUnit.x === unit.x &&
                        selectedUnit.y === unit.y
                    ) {
                        for (let x = -1; x < 2; x++) {
                            for (let y = -1; y < 2; y++) {
                                const cellX = unit.x + x;
                                const cellY = unit.y + y;
                                if (cellX >= 0 && cellX < 20 && cellY >= 0 && cellY < 17) {
                                    if (
                                        map[cellX][cellY] &&
                                        !Object.keys(map[cellX][cellY]).length > 0
                                    ) {
                                        //push data in array for further use
                                        if (
                                            !deployableCells.some(
                                                (cell) => cell.x === cellX && cell.y === cellY,
                                            )
                                        ) {
                                            deployableCells.push({ x: cellX, y: cellY });
                                        }

                                        ctx.font = '14px DejaVu Sans';
                                        ctx.fillStyle = '#FFFFFF';
                                        ctx.fillText('Deploy', cellX * 50 + 8, cellY * 50 + 20);
                                        ctx.fillText('Here', cellX * 50 + 8, cellY * 50 + 40);
                                    }
                                }
                            }
                        }
                    }
                }
            }

            //unit scrapping options
            if (((unit.canScrap && unit.scrapping) || (unit.canExploit && unit.exploiting)) && (unit.player === currentPlayer || visible)) {
                cctx.save();
                cctx.translate(baseX, baseY);
                cctx.rotate((unit.angle * Math.PI) / 180);
                cctx.drawImage(images['construct'], -25, -25, 50, 50);
                cctx.restore();

            }
            //base unit
            if (unit.player === currentPlayer || visible) {
                if (unit.type === 'wall') {
                    cctx.save();
                    cctx.translate(baseX, baseY);
                    cctx.rotate((unit.angle * Math.PI) / 180);
                    cctx.drawImage(img, -25, -25, 50, 50);
                    cctx.restore();
                } else {
                    cctx.save();
                    cctx.translate(baseX, baseY);
                    cctx.rotate((unit.angle * Math.PI) / 180);
                    cctx.drawImage(img, -17, -17, 34, 34);
                    cctx.restore();
                    cctx.save();
                    cctx.translate(baseX, baseY);
                    cctx.rotate((unit.angle * Math.PI) / 180);
                    cctx.fillStyle = unit.color;
                    switch (unit.type) {
                        case 'tank':
                            cctx.fillRect(-13, -15, 4, 4);
                            cctx.fillRect(9, 11, 4, 4);
                            break;
                        case 'gun':
                            cctx.fillRect(-13, -1, 4, 4);
                            cctx.fillRect(10, 9, 4, 4);
                            break;
                        case 'scout':
                            cctx.fillRect(-2, 10, 4, 4);
                            break;
                        case 'qg':
                            cctx.fillRect(-14, -15, 4, 4);
                            cctx.fillRect(10, 11, 4, 4);
                            break;
                        case 'repair':
                            cctx.fillRect(-15, -15, 4, 4);
                            cctx.fillRect(11, 11, 4, 4);
                            break;
                        case 'supply':
                            cctx.fillRect(-10, -15, 4, 4);
                            cctx.fillRect(6, 11, 4, 4);
                            break;
                        case 'artillery':
                            cctx.fillRect(-10, -13, 4, 4);
                            cctx.fillRect(6, 12, 4, 4);
                            break;
                        case 'miner':
                            cctx.fillRect(-14, -15, 4, 4);
                            cctx.fillRect(10, 11, 4, 4);
                            break;
                        case 'bulldozer':
                            cctx.fillRect(-7, -13, 4, 4);
                            cctx.fillRect(6, 5, 4, 4);
                            break;
                    }
                    cctx.restore();
                }

                //drawing player colors
            }

            //put unit on map
            map[unit.x][unit.y] = unit;

            //units movements
            if (unit.moving === true && unit.route.length > 0) {
                // calculating potential move cost
                let cost =
                    unit.x !== unit.route[0].x && unit.y !== unit.route[0].y ? 1.4 : 1;
                //No more speed points
                if (unit.currentSpecs.speed < cost) {
                    unit.moving = false;
                    unit.animStep = 0;
                    unit.travelToX = null;
                    unit.travelToY = null;
                    if (unit.player === currentPlayer) {
                        const payLoad = {
                            method: 'endMove',
                            unit: unit,
                            gameId: game.id,
                        };
                        console.log('sending : ', payLoad);
                        ws.send(JSON.stringify(payLoad));
                    }

                    // Sentry
                    const isRanged = eRangedCells.findIndex(
                        (cell) => cell.x === unit.x && cell.y === unit.y,
                    );
                    const eVisible =
                        eCoveredCells.find(
                            (cell) => cell.x === unit.x && cell.y === unit.y,
                        ) !== undefined;

                    if (isRanged !== -1 && unit.player === currentPlayer && eVisible) {
                        const cleanedRangedCells = eRangedCells[isRanged].ids.filter(
                            (id) => {
                                return (
                                    units[id].currentSpecs.ammo > 0 &&
                                    units[id].currentSpecs.shots > 0
                                );
                            },
                        );
                        if (cleanedRangedCells.length > 0) {
                            unit.onAutoFire = true;
                            const payLoad = {
                                method: 'autoFire',
                                agressors: cleanedRangedCells,
                                target: unit.id,
                                gameId: game.id,
                            };
                            console.log('sending : ', payLoad, 'Cost autofire');
                            ws.send(JSON.stringify(payLoad));
                        } else {
                            console.log('No valid agressors');
                        }
                    }
                } else if (unit.animStep < 5) {
                    unit.animStep++;
                } else {
                    unit.animStep = 0;

                    //Removing unit from map
                    map[unit.x][unit.y] = {};

                    //substract movement cost (x10 to avoid floating issues)
                    unit.currentSpecs.speed =
                        (unit.currentSpecs.speed * 10 - cost * 10) / 10;

                    // Updating DOM values
                    speed.innerHTML = unit.currentSpecs.speed + '/' + unit.specs.speed;

                    //New coords
                    unit.x = unit.route[0].x;
                    unit.y = unit.route[0].y;

                    //Putting unit on map at new position
                    map[unit.route[0].x][unit.route[0].y] = unit;
                    unit.route.shift();
                    // updating unit position and route

                    // defining rotation to next point if needed
                    if (unit.route.length > 0) {
                        let aX = unit.route[0].x - unit.x;
                        let aY = unit.route[0].y - unit.y;
                        let angle = 0;
                        unit.travelToX = aX;
                        unit.travelToY = aY;
                        if (aX === 1 && aY === 0) {
                            angle = 90;
                        } else if (aX === -1 && aY === 0) {
                            angle = -90;
                        } else if (aX === 0 && aY === 1) {
                            angle = 180;
                        } else if (aX === 0 && aY === -1) {
                            angle = 0;
                        } else if (aX === 1 && aY === 1) {
                            angle = 135;
                        } else if (aX === -1 && aY === 1) {
                            angle = -135;
                        } else if (aX === 1 && aY === -1) {
                            angle = 45;
                        } else if (aX === -1 && aY === -1) {
                            angle = -45;
                        }
                        unit.angle = angle;
                    } else if (
                        unit.route.length === 0 ||
                        (unit.route.length > 0 && unit.currentSpecs.speed < 1)
                    ) {
                        unit.travelToX = null;
                        unit.travelToY = null;
                        unit.moving = false;
                        if (unit.player === currentPlayer) {
                            const payLoad = {
                                method: 'endMove',
                                unit: unit,
                                gameId: game.id,
                            };
                            console.log('sending : ', payLoad);
                            ws.send(JSON.stringify(payLoad));
                        }

                        // Movement end :
                        // SENTRY
                        const isRanged = eRangedCells.findIndex(
                            (cell) => cell.x === unit.x && cell.y === unit.y,
                        );
                        const eVisible =
                            eCoveredCells.find(
                                (cell) => cell.x === unit.x && cell.y === unit.y,
                            ) !== undefined;

                        if (isRanged !== -1 && unit.player === currentPlayer && eVisible) {
                            const cleanedRangedCells = eRangedCells[isRanged].ids.filter(
                                (id) => {
                                    return (
                                        units[id].currentSpecs.ammo > 0 &&
                                        units[id].currentSpecs.shots > 0
                                    );
                                },
                            );
                            if (cleanedRangedCells.length > 0) {
                                unit.onAutoFire = true;
                                const payLoad = {
                                    method: 'autoFire',
                                    agressors: cleanedRangedCells,
                                    target: unit.id,
                                    gameId: game.id,
                                };
                                console.log('sending : ', payLoad, 'Initial autofire');
                                ws.send(JSON.stringify(payLoad));
                            } else {
                                console.log('No valid agressors');
                            }
                        }
                        // MOVE AND FIRE
                        if (unit.moveAndFire && !unit.onAutoFire) {
                            console.log('move and fire condition fullfilled');
                            const targetId = map[unit.objX][unit.objY].id;
                            const payLoad = {
                                method: 'fire',
                                agressor: unit.id,
                                target: targetId,
                                gameId: game.id,
                            };
                            console.log('sending : ', payLoad);
                            ws.send(JSON.stringify(payLoad));
                        }
                    }
                    // map update
                    map[unit.x][unit.y] = unit;
                }
            }

            //unit firing
            if (unit.firing === true && !unit.autofiring) {
                if (unit.fireStep === 0) {
                    unit.fireStep++;
                    units[unit.targetId].fireStep++;
                } else if (unit.fireStep === 1 || unit.fireStep === 2) {
                    cctx.save();
                    cctx.translate(baseX, baseY);
                    cctx.rotate((unit.angle * Math.PI) / 180);
                    cctx.drawImage(fire, -17, -48, 34, 34);
                    cctx.restore();
                    unit.fireStep++;
                    units[unit.targetId].fireStep++;
                }
            }

            // Unit under fire & destroyed launching
            if (
                unit.onFire === true &&
                (unit.fireStep === 3 || unit.fireStep === 4) &&
                !unit.onAutoFire
            ) {
                cctx.save();
                cctx.translate(baseX, baseY);
                cctx.rotate((unit.angle * Math.PI) / 180);
                cctx.drawImage(impact, -17, -17, 34, 34);
                cctx.restore();
                unit.fireStep++;
                units[unit.agrId].fireStep++;
                const agressor = units[unit.agrId];
                if (unit.fireStep === 4) {
                    let payLoad = {};
                    //if autofire launching second eventual fire
                    if (agressor.autoFire) {
                        payLoad = {
                            method: 'fire',
                            agressor: agressor.id,
                            target: unit.id,
                            gameId: game.id,
                        };
                    }
                    // Else ending fire to preserve fragmented fire
                    else {
                        payLoad = {
                            method: 'endFire',
                            agressor: agressor.id,
                            target: unit.id,
                            gameId: game.id,
                        };
                    }

                    console.log('sending : ', payLoad);
                    ws.send(JSON.stringify(payLoad));
                }
            }

            // Unit autofiring Beware fractionned animation
            if (unit.autoFiring === true && unit.player !== currentPlayer) {
                if (unit.autoFireStep === 0) {
                    unit.autoFireStep++;
                    units[unit.targetId].autoFireStep++;
                } else if (unit.autoFireStep === 1 || unit.autoFireStep === 2) {
                    cctx.save();
                    cctx.translate(baseX, baseY);
                    cctx.rotate((unit.angle * Math.PI) / 180);
                    cctx.drawImage(fire, -17, -48, 34, 34);
                    cctx.restore();
                    unit.autoFireStep++;
                    units[unit.targetId].autoFireStep++;
                }
            }

            // Unit under autoFire & destroyed launching
            if (
                unit.onAutoFire === true &&
                (unit.autoFireStep === 3 || unit.autoFireStep === 4)
            ) {
                cctx.save();
                cctx.translate(baseX, baseY);
                cctx.rotate((unit.angle * Math.PI) / 180);
                cctx.drawImage(impact, -17, -17, 34, 34);
                cctx.restore();
                unit.autoFireStep++;

                let payLoad = {};
                if (unit.autoFireStep > 4) {
                    if (unit.currentSpecs.life <= 0) {
                        payLoad = {
                            method: 'autoFire',
                            agressors: unit.agrIds,
                            target: unit.id,
                            gameId: game.id,
                            destroyed: true,
                        };
                    } else if (unit.currentSpecs.life > 0 && unit.agrIds.length > 0) {
                        payLoad = {
                            method: 'autoFire',
                            agressors: unit.agrIds,
                            target: unit.id,
                            gameId: game.id,
                            destroyed: false,
                        };
                    }
                    console.log('sending : ', payLoad, 'steps autoFire');
                    ws.send(JSON.stringify(payLoad));
                }
            }

            // Unit destroyed animation
            if (unit.destroyed) {
                if (unit.destroyStep === 5) {
                    let dX = unit.x;
                    let dY = unit.y;
                    let qty = unit.specs.cost;
                    // Deleting destroyed unit
                    map[dX][dY] = {};

                    // Creating debris
                    let d = new Debris(debris, dX, dY, qty);

                    // Stopping animation/deleting unit
                    const payLoad = {
                        method: 'destroyUnit',
                        unitId: unit.id,
                        wreck: d,
                        gameId: game.id,
                    };
                    console.log('sending : ', payLoad);
                    ws.send(JSON.stringify(payLoad));
                    //selectedUnit = {}
                } else {
                    cctx.save();
                    cctx.translate(baseX, baseY);
                    cctx.rotate((unit.angle * Math.PI) / 180);
                    if (unit.destroyStep === 0 || unit.destroyStep === 4) {
                        cctx.drawImage(impact, -17, -17, 34, 34);
                    } else if (unit.destroyStep === 1 || unit.destroyStep === 3) {
                        cctx.drawImage(bigimpact, -27, -27, 50, 50);
                    } else if (unit.destroyStep === 1 || unit.destroyStep === 3) {
                        cctx.drawImage(bigimpact, -50, -50, 75, 75);
                    }
                    cctx.restore();
                    unit.destroyStep++;
                }
                if (unit.player === currentPlayer && selectedUnit.id === unit.id) {

                    selectedUnit = {};
                }
            }
        }
    });

    // Selected Unit green square, range circles, route
    if (selectedUnit && Object.keys(selectedUnit).length > 0) {
        if (units[selectedUnit.id] && units[selectedUnit.id].moving === false) {
            // green rectangle while unit selected
            ctx.beginPath();
            ctx.strokeStyle = '#00FF00';
            ctx.strokeRect(selectedUnit.x * 50 + 1, selectedUnit.y * 50 + 1, 48, 48);
            ctx.stroke();

            //Ranges displaying
            if (btnState.displayRanges) {
                //adding speed circle
                ctx.beginPath();
                ctx.arc(
                    selectedUnit.x * 50 + 25,
                    selectedUnit.y * 50 + 25,
                    selectedUnit.currentSpecs.speed * 50,
                    0,
                    Math.PI * 2,
                );
                ctx.stroke();
                //adding radar circle
                ctx.beginPath();
                ctx.strokeStyle = 'gold';
                ctx.arc(
                    selectedUnit.x * 50 + 25,
                    selectedUnit.y * 50 + 25,
                    selectedUnit.specs.radar * 50,
                    0,
                    Math.PI * 2,
                );
                ctx.stroke();
                //adding range circle
                ctx.beginPath();
                ctx.strokeStyle = 'red';
                ctx.arc(
                    selectedUnit.x * 50 + 25,
                    selectedUnit.y * 50 + 25,
                    selectedUnit.specs.range * 50,
                    0,
                    Math.PI * 2,
                );
                ctx.stroke();
            }
        }

        //Route drawing while unit selected and objective square selected
        if (selectedUnit && selectedUnit.route.length > 0) {
            let move = 0;
            let step = 0;
            let previousStep = 1;
            selectedUnit.route.forEach((coords) => {
                let max = selectedUnit.specs.speed;
                let cost =
                    selectedUnit.x !== selectedUnit.route[0].x &&
                        selectedUnit.y !== selectedUnit.route[0].y
                        ? 1.4
                        : 1;
                move += cost;

                step = Math.floor(move / max) + 1;
                let stepColor = 'orange';
                if (step !== previousStep) {
                    previousStep = step;
                    stepColor = 'red';
                }
                ctx.beginPath();
                ctx.strokeStyle = stepColor;
                ctx.arc(coords.x * 50 + 25, coords.y * 50 + 25, 2, 0, Math.PI * 2);
                ctx.stroke();
                ctx.fontStyle = 'black';
                ctx.font = '10px Arial';
                ctx.fillText(
                    `${parseFloat(move.toFixed(2))} - ${step}`,
                    coords.x * 50 + 10,
                    coords.y * 50 + 25,
                );
            });
        }
    }

    // Drawing ressources
    minesGroups.forEach((mine) => {
        if (btnState.visible) {
            let color = mine.color;
            let value = mine.qty;
            let i = mine.x;
            let j = mine.y;
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.arc(i * 50 + 25, j * 50 + 25, 20, 0, Math.PI * 2); //x,y,d,pi
            ctx.stroke();
            ctx.beginPath();
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.fillStyle = color;
            ctx.fillText(value, i * 50 + 25, j * 50 + 32);
        }
    });
}

setInterval(draw, 40);
