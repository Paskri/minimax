// Importer les modules nécessaires
import { debris, minesGroups, units } from './public/js/datasExp.js';
import { createServer } from "http";
import express from "express";
const exstatic = express.static
import path, { join } from "path";
import { server as WebSocketServer } from "websocket";


import { fileURLToPath } from 'url';
import { createUnit } from './public/js/classesExp.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.get("/", (req, res) => res.sendFile(__dirname + "/public/index.html"));
app.get("/game", (req, res) => res.sendFile(__dirname + "/public/game.html"));
/*app.use(express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.webp')) {
            res.setHeader('Content-Type', 'image/webp');
        }
    }
}));*/
app.use(exstatic(join(__dirname, 'public')));

app.listen(9091, () => {
    console.log('Express server is listening on port 9091');
});

const httpServer = createServer();
httpServer.listen(9090, () => {
    console.log('WebSocket server is listening on port 9090');
});

const wsServer = new WebSocketServer({
    httpServer: httpServer,
    autoAcceptConnections: false
});

// Hashmaps
let clients = {}
let games = {}
// function 

function updatingSpeedByShots(units, agressor) {
    if (agressor.type !== 'scout') {
        const maxSpeed = agressor.specs.speed
        const maxShots = agressor.specs.shots

        const treshold = maxSpeed / maxShots
        const currentShots = agressor.currentSpecs.shots
        const currentSpeed = agressor.currentSpecs.speed
        let remainingSpeed = maxSpeed

        remainingSpeed = maxSpeed - (maxSpeed / maxShots)
        agressor.currentSpecs.speed = remainingSpeed
    }
    return units
}

wsServer.on("request", request => {
    //Connect
    const connection = request.accept(null, request.origin);
    connection.on("open", () => console.log("opened connection"));
    connection.on("close", () => console.log("closed connection"));
    connection.on("message", message => {
        try {
            const result = JSON.parse(message.utf8Data);
            console.log('Message : ', result)
            // Message received from the client
            // a user want to create a new game
            if (result.method === "create") {
                const clientId = result.clientId;
                //creating gameId
                const gameId = guid();
                games[gameId] = {
                    "id": gameId,
                    "clients": [],
                    "started": false,
                    "creator": clientId,
                    "turn": 1,
                    "units": units,
                    "debris": debris
                }

                const payLoad = {
                    "method": "create",
                    "game": games[gameId]
                }
                const con = clients[clientId].connection
                con.send(JSON.stringify(payLoad))

                const payLoad2 = {
                    "method": "available",
                    "games": games
                }
                console.log(clients)
                Object.values(clients).forEach((client) => {
                    client.connection.send(JSON.stringify(payLoad2))
                })

            }

            // a client want to join
            if (result.method === "join") {
                const clientId = result.clientId;
                const gameId = result.gameId;
                const name = result.name ? result.name : 'NoName';
                const game = games[gameId];
                if (game.clients.length >= 3) {
                    //sorry, too much players
                    return;
                }
                const color = { "0": "blue", "1": "red", "2": "green" }[game.clients.length]
                // checking if player already joined game.clients
                if (game.clients.find(client => client.clientId === clientId) !== undefined) {

                } else {
                    const playerId = game.clients.length
                    game.clients.push({
                        "clientId": clientId,
                        "color": color,
                        "name": name,
                        "playerId": playerId + 1,
                        "endedTurn": false
                    })

                    const payLoad = {
                        "method": "join",
                        "game": game
                    }
                    //loop through all clients and tell them somebody joined

                    Object.values(clients).forEach(c => {
                        c.connection.send(JSON.stringify(payLoad))
                    });
                }
            }

            // destroying game
            if (result.method === 'destroy') {
                const clientId = result.clientId;
                const gameId = result.gameId;
                const game = games
                delete games[gameId]

                const payLoad2 = {
                    "method": "available",
                    "games": games
                }
                Object.values(clients).forEach(client => {
                    client.connection.send(JSON.stringify(payLoad2))
                });
            }

            // Quiting game
            if (result.method === 'quit') {
                const clientId = result.clientId;
                const gameId = result.gameId;
                const game = games[gameId]
                // deleting client 
                game.clients = game.clients.filter(client => client.clientId !== clientId)
                //console.log()
                const payLoad = {
                    "method": "quit",
                    "game": game,
                    "provClients": '',
                }

                //loop through all clients and tell them somebody quit
                for (const c in clients) {
                    clients[c].connection.send(JSON.stringify(payLoad))
                };
            }

            // Starting game
            if (result.method === 'start') {
                const clientId = result.clientId;
                const gameId = result.gameId;
                const game = games[gameId]
                game.started = true;

                //connection.send(JSON.stringify(payLoad))
                //loop through all clients and tell them somebody quit
                game.clients.forEach(c => {
                    const payLoad = {
                        "clientId": c.clientId,
                        "method": "start",
                        "game": game
                    }
                    clients[c.clientId].connection.send(JSON.stringify(payLoad))
                });
            }

            // update client
            if (result.method === 'updateClient') {
                const clientId = result.clientId
                const oldClientId = result.oldClientId
                let payLoad = { 'message': "rien ne s'est passé" }
                if (clientId !== oldClientId) {
                    if (Object.keys(games).length > 0) { // si partie
                        //updating game client in games
                        let currentGame = {}
                        for (let game in games) {
                            //checking if old client is creator
                            if (games[game].creator === oldClientId) {
                                games[game].creator = clientId
                                payLoad = { "method": "updateCreator", "message": "creator clientId updated", "game": games[game], "clientId": clientId }
                                connection.send(JSON.stringify(payLoad))
                            }

                            games[game].clients.forEach(c => {
                                console.log('client: ', c, ' creator: ',)
                                // Protéger la partie si premier client = createur
                                if (c.clientId !== games[game].creator && c.clientId === oldClientId) {

                                    c.clientId = clientId
                                    //deleting old connection
                                    delete clients[oldClientId]

                                    //saving current clientId in local storage
                                    payLoad = {
                                        "method": "updateClient",
                                        "clientId": clientId,
                                        "game": games[game],
                                        "message": "old clientId updated succesfully"
                                    }
                                } else if (c.clientId === games[game].creator && c.clientId === oldClientId) {
                                    // nouveau client est le créateur donc mise à jour
                                    c.clientId = clientId
                                    // deleting old connection
                                    delete clients[oldClientId]
                                    games[game].creator = clientId
                                    payLoad = {
                                        "method": "updateClient",
                                        "clientId": clientId,
                                        "game": games[game],
                                        "message": "oldClientId === creator"
                                    }
                                } else {
                                    // oldClientId not available in any game
                                    // joining game
                                    payLoad = {
                                        "method": "updateClient",
                                        "clientId": clientId,
                                        "game": games[game],
                                        "message": "oldClientId not available in any game"
                                    }
                                }
                            })
                        }


                    } else {
                        payLoad = {
                            "method": "updateClient",
                            "message": "No game created",
                            "clientId": clientId,
                            "game": {}
                        }
                    }
                    connection.send(JSON.stringify(payLoad))
                }
            }

            // create Full Game for development purpose
            if (result.method === 'createFullGame') {
                const clientId = result.clientId
                let gameId = ''
                if (Object.keys(games).length === 0) {
                    //creating gameId
                    gameId = guid();
                    games[gameId] = {
                        "id": gameId,
                        "clients": [],
                        "started": false,
                        "creator": clientId,
                        "turn": 1,
                        "units": units,
                        "debris": debris
                    }

                    let game = games[gameId]
                    const color = { "0": "blue", "1": "red", "2": "green" }[game.clients.length]
                    // creator join game
                    if (game.clients.find(client => client.clientId === clientId) === undefined) {

                        const playerId = game.clients.length
                        game.clients.push({
                            "clientId": clientId,
                            "color": color,
                            "name": 'john',
                            "playerId": playerId + 1,
                            "endedTurn": false
                        })

                        const payLoad = {
                            "method": "createFullGame",
                            "currentPlayer": playerId + 1,
                            "game": games[gameId]
                        }

                        const con = clients[clientId].connection
                        con.send(JSON.stringify(payLoad))

                    }
                    //const payLoad2 = {
                    //    "method": "availableFullGame",
                    //    "clientId": clientId,
                    //    "game": games[gameId]
                    //}
                    //connection.send(JSON.stringify(payLoad2))
                } else { // partie crée, deuxième client se connecte
                    const [gameId, game] = Object.entries(games)[0];
                    const color = { "0": "blue", "1": "red", "2": "green" }[game.clients.length]
                    // creator join game
                    if (game.clients.find(client => client.clientId === clientId) === undefined) {

                        const playerId = game.clients.length
                        game.clients.push({
                            "clientId": clientId,
                            "color": color,
                            "name": 'john',
                            "playerId": playerId + 1,
                            "endedTurn": false
                        })

                        game.clients.forEach(c => {
                            const payLoad = {
                                "method": "createFullGame",
                                "clientId": clientId,
                                "game": games[gameId],
                                "currentPlayer": c.playerId
                            }
                            clients[c.clientId].connection.send(JSON.stringify(payLoad))
                            const payLoad2 = {
                                "method": "startCount",
                                "game": games[gameId]
                            }
                            clients[c.clientId].connection.send(JSON.stringify(payLoad2))
                        });

                        //const con = clients[clientId].connection
                        //con.send(JSON.stringify(payLoad))
                    }
                }
            }

            // unit moving
            if (result.method === 'move') {
                const unitId = result.unitId
                const route = result.route
                const gameId = result.gameId
                const game = games[gameId]
                const unit = game.units[unitId]

                unit.route = route
                unit.moving = true
                unit.animStep = 0

                const payLoad = {
                    "method": "updateGame",
                    "from": result.method,
                    "game": game
                }
                game.clients.forEach(c => {
                    clients[c.clientId].connection.send(JSON.stringify(payLoad))
                });
            }

            // Unit Stops
            if (result.method === 'stop') {
                const unit = result.unit
                const game = games[result.gameId]
                game.units[unit.id] = unit

                const payLoad = {
                    "method": "updateGame",
                    "from": result.method,
                    "game": game
                }
                game.clients.forEach(c => {
                    clients[c.clientId].connection.send(JSON.stringify(payLoad))
                });
            }

            // ---- UNACTIVATED
            if (result.method === 'updatePosition') {
                //    const unit = result.unit
                //    const gameId = result.gameId
                //    const game = games[gameId]
                //    units[unit.id] = unit
                //    const payLoad = {
                //        "method": "updateGame",
                //        "from": result.method,
                //        "game": game
                //    }
                //    game.clients.forEach(c => {
                //        clients[c.clientId].connection.send(JSON.stringify(payLoad))
                //    });
            }

            // unit move end
            if (result.method === 'endMove') {
                const unit = result.unit
                const gameId = result.gameId
                const game = games[gameId]

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
                    // removing eventual moveAndFire
                    unit.moveAndFire = false
                }
                game.units[unit.id] = unit
                const payLoad = {
                    "method": "updateGame",
                    "from": result.method,
                    "game": games[gameId]
                }
                game.clients.forEach(c => {
                    clients[c.clientId].connection.send(JSON.stringify(payLoad))
                });
            }

            // unit move and fire
            if (result.method === 'moveAndFire') {
                const unitId = result.unitId
                const route = result.route
                const gameId = result.gameId
                const game = games[gameId]
                const unit = game.units[unitId]
                const target = result.target
                const targetId = result.targetId

                unit.route = route
                unit.moving = true
                unit.moveAndFire = true
                unit.animStep = 0
                unit.objX = target.x
                unit.objY = target.y
                unit.targetX = target.x
                unit.targetY = target.y
                unit.targetId = targetId

                const payLoad = {
                    "method": "updateGame",
                    "from": result.method,
                    "game": games[gameId]
                }
                game.clients.forEach(c => {
                    clients[c.clientId].connection.send(JSON.stringify(payLoad))
                });
            }

            // Unit firing
            if (result.method === 'fire') {
                const agressor = result.agressor
                const target = result.target
                const gameId = result.gameId
                const game = games[gameId]
                const units = game.units

                if (units[target].currentSpecs.life <= 0) {
                    //unit on fire destroyed
                    console.log('Firing case 1')
                    units[target].destroyed = true
                    units[target].destroyStep = 0
                    units[target].agrId = null
                    units[target].onFire = false
                    units[target].fireStep = 0
                    units[agressor].firing = false
                    units[agressor].fireStep = 0
                    units[agressor].targetId = null

                } else if (
                    //firing
                    units[target].currentSpecs.life > 0 &&
                    units[agressor].currentSpecs.shots > 0 &&
                    units[agressor].currentSpecs.ammo > 0
                ) {
                    console.log('Firing case 2')
                    //launching animation
                    units[agressor].firing = true
                    units[agressor].fireStep = 0
                    units[target].onFire = true
                    units[target].fireStep = 0
                    //Updating values
                    units[target].agrId = agressor
                    units[agressor].targetX = units[target].x
                    units[agressor].targetY = units[target].y
                    units[agressor].targetId = target
                    units[agressor].currentSpecs.ammo--
                    units[agressor].currentSpecs.shots--
                    updatingSpeedByShots(units, units[agressor])

                    //defining fire angle
                    let x = units[target].x - units[agressor].x
                    let y = units[target].y - units[agressor].y
                    let fireAngle = (Math.atan2(y, x) * (180 / Math.PI) + 90) % 360
                    units[agressor].angle = fireAngle

                    //life points :
                    if (units[agressor].specs.attack - units[target].specs.armor > 0) {
                        units[target].currentSpecs.life -=
                            units[agressor].specs.attack - units[target].specs.armor
                    }
                    // removing fire if autofire disabled
                    //if (!units[agressor].autoFiring) {
                    //    units[target].agrId = null
                    //    units[target].onFire = false
                    //    units[target].fireStep = 0
                    //    units[agressor].firing = false
                    //    units[agressor].fireStep = 0
                    //    units[agressor].targetId = null
                    //}
                } else {
                    //fire end
                    console.log('Firing case 3')
                    units[target].agrId = null
                    units[agressor].firing = false
                    units[agressor].fireStep = 0
                    units[agressor].targetId = null
                    units[target].onFire = false
                    units[target].fireStep = 0
                }

                const payLoad = {
                    "method": "updateGame",
                    "from": result.method,
                    "game": game
                };
                game.clients.forEach(c => {
                    clients[c.clientId].connection.send(JSON.stringify(payLoad))
                });
            }

            // End fire to avoid autofire behavior
            if (result.method === 'endFire') {
                const agressor = result.agressor
                const target = result.target
                const gameId = result.gameId
                const game = games[gameId]
                const units = game.units

                if (units[target].currentSpecs.life <= 0) {
                    //unit on fire destroyed
                    console.log('EndFire case 1')
                    units[target].destroyed = true
                    units[target].destroyStep = 0
                    units[target].agrId = null
                    units[target].onFire = false
                    units[target].fireStep = 0
                    units[agressor].firing = false
                    units[agressor].fireStep = 0
                    units[agressor].targetId = null

                } else {
                    console.log('EndFire case 1')
                    units[target].agrId = null
                    units[agressor].firing = false
                    units[agressor].fireStep = 0
                    units[agressor].targetId = null
                    units[target].onFire = false
                    units[target].fireStep = 0
                }
                const payLoad = {
                    "method": "updateGame",
                    "from": result.method,
                    "game": game
                };
                game.clients.forEach(c => {
                    clients[c.clientId].connection.send(JSON.stringify(payLoad))
                });
            }

            // destroying unit
            if (result.method === 'destroyUnit') {
                const unitId = result.unitId
                const game = games[result.gameId]
                game.units[unitId] = null
                const wreck = result.wreck
                const debris = game.debris

                const dIndex = debris.findIndex((d) => d.x === wreck.x && d.y === wreck.y)
                if (dIndex >= 0) {
                    debris[dIndex].qty += wreck.qty
                } else {
                    debris.push(wreck)
                }

                const payLoad = {
                    "method": "updateGame",
                    "from": result.method,
                    "game": game
                };
                game.clients.forEach(c => {
                    clients[c.clientId].connection.send(JSON.stringify(payLoad))
                });
            }

            // unit entering range Autofiring
            if (result.method === 'autoFire') {
                let agressors = result.agressors
                let agressor = result.agressors[0]
                const target = result.target
                const game = games[result.gameId]
                const units = game.units
                const destroyed = result.destroyed ? result.detroyed : false

                // Agressor can fire
                if (units[target].currentSpecs.life <= 0) {
                    units[target].destroyed = true
                    units[target].destroyStep = 0
                    units[agressor].autoFiring = false
                    units[agressor].targetX = null
                    units[agressor].targetY = null
                    units[agressor].targetId = null
                }
                else if (
                    units[agressor].currentSpecs.shots > 0 &&
                    units[agressor].currentSpecs.ammo > 0 &&
                    units[target].currentSpecs.life > 0
                ) {
                    // datas update
                    units[agressor].autoFiring = true
                    units[target].onAutoFire = true
                    units[target].agrIds = agressors
                    units[agressor].targetX = units[target].x
                    units[agressor].targetY = units[target].y
                    units[agressor].targetId = target
                    units[agressor].currentSpecs.ammo--
                    units[agressor].currentSpecs.shots--
                    updatingSpeedByShots(units, units[agressor])
                    // fire angle
                    let x = units[target].x - units[agressor].x
                    let y = units[target].y - units[agressor].y
                    let fireAngle = (Math.atan2(y, x) * (180 / Math.PI) + 90) % 360
                    units[agressor].angle = fireAngle
                    // removing pvs

                    units[target].currentSpecs.life -=
                        units[agressor].specs.attack - units[target].specs.armor
                }
                // agressor cannot fire again
                else {
                    // unactivating autofire and removing agressor from list
                    units[agressor].autoFiring = false
                    units[agressor].targetX = null;
                    units[agressor].targetY = null;
                    units[agressor].targetId = null;
                    agressors.shift()
                    units[target].agrIds = agressors

                    if (agressors.length > 0) {
                        agressor = agressors[0]
                        units[agressor].autoFiring = true
                        units[agressor].targetX = units[target].x
                        units[agressor].targetY = units[target].y
                        units[agressor].targetId = units[target].id
                        units[agressor].autoFireStep = 0
                        units[target].onAutoFire = true

                    } else {
                        //Removing autofire on unit
                        units[target].onAutoFire = false
                        units[target].agrIds = []
                        //if move and fire lauching fire sequence
                        if (units[target].moveAndFire) {
                            units[target].moveAndFire = false
                            units[target].firing = true
                            units[units[target].targetId].onFire = true
                            units[units[target].targetId].agrId = target
                        }
                    }
                }

                // if canFire and Ammo
                // else check next
                const payLoad = {
                    "method": "updateGame",
                    "from": result.method,
                    "game": game
                }
                game.clients.forEach(c => {
                    clients[c.clientId].connection.send(JSON.stringify(payLoad))
                });
            }

            // repairing unit
            if (result.method === 'repairUnit') {
                const gameId = result.gameId;
                const unitId = result.unitId
                const game = games[gameId]
                const units = game.units
                units[unitId].currentSpecs.life = units[unitId].specs.life
                const payLoad = {
                    "method": "updateGame",
                    "from": result.method,
                    "game": game,
                };
                game.clients.forEach(c => {
                    clients[c.clientId].connection.send(JSON.stringify(payLoad))
                });
            }

            // supplying unit
            if (result.method === 'supplyUnit') {
                const gameId = result.gameId;
                const unitId = result.unitId
                const game = games[gameId]
                const units = game.units
                units[unitId].currentSpecs.ammo = units[unitId].specs.ammo
                const payLoad = {
                    "method": "updateGame",
                    "from": result.method,
                    "game": game,
                };
                game.clients.forEach(c => {
                    clients[c.clientId].connection.send(JSON.stringify(payLoad))
                });
            }

            // transfering cargo
            if (result.method === 'transfer') {
                const gameId = result.gameId;
                const unitId = result.unitId
                const targetId = result.targetId
                const qty = result.qty
                const game = games[gameId]
                const units = game.units
                units[unitId].currentSpecs.cargo -= qty
                units[targetId].currentSpecs.cargo += qty
                const payLoad = {
                    "method": "updateGame",
                    "from": result.method,
                    "game": game,
                };
                game.clients.forEach(c => {
                    clients[c.clientId].connection.send(JSON.stringify(payLoad))
                });
            }

            // Buidling unit
            if (result.method === 'produceUnit') {
                const gameId = result.gameId
                const build = result.build
                const game = games[result.gameId]
                const units = game.units
                const unit = units[result.unitId]

                unit.producing = true
                let newUnit = createUnit(build.unitType)
                const newUnitTurn = newUnit.specs.production[build.buildSpeed].turns
                const newUnitCost = newUnit.specs.production[build.buildSpeed].cost
                let status = ''
                if (unit.currentSpecs.cargo >= newUnitCost / newUnitTurn) {
                    status = 'building'
                } else {
                    status = 'pending'
                }

                unit.currentProd = { status: status, unit: build.unitType, speed: newUnitTurn, turnsRemain: newUnitTurn, cost: newUnitCost }
                newUnit = null
                const payLoad = {
                    "method": "updateGame",
                    "from": result.method,
                    "game": game
                }
                game.clients.forEach(c => {
                    clients[c.clientId].connection.send(JSON.stringify(payLoad))
                });

            }
            //cancelling produce Unit
            if (result.method === 'cancelProduce') {
                const unitId = result.unitId
                const game = games[result.gameId]
                const units = game.units

                units[unitId].producing = false
                units[unitId].currentProd = { status: 'stopped', unit: null, speed: 0, turnsRemain: 0, cost: 0 }

                const payLoad = {
                    "method": "updateGame",
                    "from": result.method,
                    "game": game
                }
                game.clients.forEach(c => {
                    clients[c.clientId].connection.send(JSON.stringify(payLoad))
                });
            }
            //deploying new unit
            if (result.method === 'deployNewUnit') {
                const game = games[result.gameId]
                const units = game.units
                const unit = units[result.unitId]
                const coords = result.coords
                const newUnit = createUnit(unit.currentProd.unit, units, coords.x, coords.y, unit.player, unit.color, 0)
                units.push(newUnit)
                // ending construction
                unit.producing = false
                unit.currentProd = { status: 'stopped', unit: null, speed: 0, turnsRemain: 0, cost: 0 }
                const payLoad = {
                    "method": "updateGame",
                    "from": result.method,
                    "game": game
                }
                game.clients.forEach(c => {
                    clients[c.clientId].connection.send(JSON.stringify(payLoad))
                });

            }

            //scraping metal
            if (result.method === 'scrap') {
                const game = games[result.gameId]
                const units = game.units
                const unit = units[result.unitId]
                const toggle = result.toggle

                if (toggle) {
                    unit.scrapping = true
                    unit.activeModes = ['scrap']
                } else {
                    unit.scrapping = false
                    unit.activeModes = unit.modes[0]
                }

                const payLoad = {
                    "method": "updateGame",
                    "from": result.method,
                    "game": game
                }
                game.clients.forEach(c => {
                    clients[c.clientId].connection.send(JSON.stringify(payLoad))
                });
            }

            //exploiting mine
            if (result.method === 'exploit') {
                const game = games[result.gameId]
                const units = game.units
                const unit = units[result.unitId]
                const toggle = result.toggle

                if (toggle) {
                    unit.exploiting = true
                    unit.activeModes = ['exploit']
                } else {
                    unit.exploiting = false
                    unit.activeModes = unit.modes[0]
                }

                const payLoad = {
                    "method": "updateGame",
                    "from": result.method,
                    "game": game
                }
                game.clients.forEach(c => {
                    clients[c.clientId].connection.send(JSON.stringify(payLoad))
                });
            }

            // end turn
            if (result.method === 'endTurn') {
                const clientId = result.clientId
                let game = games[result.game.id]
                const units = game.units
                const debris = game.debris
                // updating game
                const client = game.clients.filter(client => client.clientId === clientId)
                client[0].endedTurn = true
                let everyBodyEnded = true
                game.clients.forEach(client => {
                    if (!client.endedTurn) {
                        everyBodyEnded = false
                    }
                })
                let payLoad = null
                let payLoad2 = null
                if (everyBodyEnded) {
                    game.turn++
                    payLoad = {
                        "method": "nextTurn",
                        "game": game,
                    }
                    game.clients.forEach(client => {
                        client.endedTurn = false
                    })
                    units.forEach(unit => {
                        if (unit && Object.values(unit).length > 0) {
                            unit.currentSpecs.speed = unit.specs.speed
                            unit.currentSpecs.shots = unit.specs.shots
                            //by turn processes
                            //production handling
                            if (unit.canProduce && unit.producing) {

                                if (unit.currentSpecs.cargo >= unit.currentProd.cost / unit.currentProd.speed) {
                                    unit.currentProd.status = 'building'
                                    unit.currentSpecs.cargo -= unit.currentProd.cost / unit.currentProd.speed
                                    console.log(unit.type + ' construit ' + unit.currentProd.unit + '. ' + unit.currentProd.cost / unit.currentProd.speed + ' déduis de son cargo')
                                    unit.currentProd.turnsRemain--
                                } else {
                                    unit.currentProd.status = 'pending'
                                }

                                if (unit.currentProd.turnsRemain === 0) {
                                    //construction ended
                                    console.log('Construction has Ended')

                                } else {
                                    console.log('Construction current state: ', unit.currentProd)
                                }

                            }
                            // scrapinghandling
                            else if (unit.canScrap && unit.scrapping) {
                                const scrapIndex = debris.findIndex((d) => d.x === unit.x && d.y === unit.y)
                                if (scrapIndex !== -1) {
                                    const scrap = debris[scrapIndex];
                                    if (scrap && scrap.qty > 0 && unit.canScrap && unit.currentSpecs.cargo < unit.specs.cargo) {
                                        const scrapAmount = Math.min(scrap.qty, 12);
                                        const availableSpace = unit.specs.cargo - unit.currentSpecs.cargo;
                                        const collected = Math.min(scrapAmount, availableSpace);
                                        unit.currentSpecs.cargo += collected;
                                        scrap.qty -= collected;

                                        if (scrap.qty <= 0) {
                                            debris.splice(scrapIndex, 1);
                                            unit.scrapping = false
                                        } else if (unit.currentSpecs.cargo === unit.specs.cargo) {
                                            unit.scrapping = false
                                        }
                                    }
                                }

                                const payLoad = {
                                    "method": "updateGame",
                                    "from": result.method,
                                    "game": game
                                }
                                game.clients.forEach(c => {
                                    clients[c.clientId].connection.send(JSON.stringify(payLoad))
                                });
                            } else if (unit.canExploit && unit.exploiting) {
                                const mineIndex = minesGroups.findIndex((mine) => mine.x === unit.x && mine.y === unit.y)
                                if (mineIndex !== -1) {
                                    const mine = minesGroups[mineIndex];
                                    if (mine && unit.canExploit && unit.currentSpecs.cargo < unit.specs.cargo) {
                                        const scrapAmount = 16;
                                        const availableSpace = unit.specs.cargo - unit.currentSpecs.cargo;
                                        const collected = Math.min(scrapAmount, availableSpace);
                                        unit.currentSpecs.cargo += collected;
                                        if (unit.currentSpecs.cargo === unit.specs.cargo) {
                                            unit.exploiting = false
                                        }
                                    }
                                }

                                const payLoad = {
                                    "method": "updateGame",
                                    "from": result.method,
                                    "game": game
                                }
                                game.clients.forEach(c => {
                                    clients[c.clientId].connection.send(JSON.stringify(payLoad))
                                });
                            }
                        }


                    })
                    payLoad2 = {
                        "method": "updateGame",
                        "from": result.method,
                        "game": game
                    }
                } else {
                    payLoad = {
                        "method": "endTurn",
                        "clientId": result.clientId,
                        "game": game
                    }
                }

                game.clients.forEach(c => {
                    clients[c.clientId].connection.send(JSON.stringify(payLoad))
                    if (payLoad2) {
                        clients[c.clientId].connection.send(JSON.stringify(payLoad2))
                    }
                });
            }
        } catch (error) {
            console.error('Error processing message:', error);

            // Optionally send an error message back to the client
            const errorPayload = {
                "method": "error",
                "message": error.message
            };
            connection.send(JSON.stringify(errorPayload));
        }
    })

    // generate a new clienId
    const clientId = guid();
    // to be able to found connection with any clientId
    clients[clientId] = {
        "connection": connection
    }

    const payLoad = {
        "method": "connect",
        "clientId": clientId
    }
    // send back the client connect
    connection.send(JSON.stringify(payLoad))

    const payLoad2 = {
        "method": "available",
        "games": games
    }
    connection.send(JSON.stringify(payLoad2))

})

function updateGameState() {

    for (const g of Object.keys(games)) {
        const game = games[g]
        const payLoad = {
            "method": "update",
            "game": game
        }

        for (const g of Object.keys(games)) {
            games[g].clients.forEach(c => {
                clients[c.clientId].connection.send(JSON.stringify(payLoad))
            })
        }
        setTimeout(updateGameState, 500)
    }


}

function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

// then to call it, plus stitch in '4' in the third group
const guid = () => (S4() + S4() + "-" + S4() + "-4" + S4().substr(0, 3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
