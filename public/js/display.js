//HTML elements
const btnCreate = document.getElementById("btnCreate");
const btnJoin = document.getElementById("btnJoin");
const txtGameId = document.getElementById("txtGameId");
const divPlayers = document.getElementById("divPlayers");
const divBoard = document.getElementById("divBoard");
const divGames = document.getElementById("divGames");
const name = document.getElementById("name");
const divPlay = document.getElementById("divPlay");
let clientId = null;
let gameId = null;
let playerColor = null;
let ws = new WebSocket("ws://localhost:9090");

//Wiring events
//Join Btn
btnJoin.addEventListener('click', e => {
    if (gameId === null) {
        gameId = txtGameId.value

    }
    const payLoad = {
        "method": "join",
        "clientId": clientId,
        "gameId": gameId,
        "name": name.value
    }
    console.log('Sending : ', payLoad)

    ws.send(JSON.stringify(payLoad))


})
// creating game
btnCreate.addEventListener('click', e => {

    const payLoad = {
        "method": "create",
        "clientId": clientId
    }
    console.log('Sending : ', payLoad)
    ws.send(JSON.stringify(payLoad))

})

function getPlayersControls(game) {
    const pcs = document.querySelectorAll('.available-container')
    const currentContainer = Array.from(pcs).find((ac) => ac.dataset.game === game.id)
    return currentContainer.querySelector('.players-controls')
}

const localStorageClient = localStorage.getItem('clientId');
let oldClientId = null;
if (localStorageClient !== 'undefined' || localStorageClient !== null) {
    oldClientId = JSON.parse(localStorageClient);
} else {
    oldClientId = null;
}

ws.onmessage = message => {
    //message.data
    const response = JSON.parse(message.data);
    console.log('Server Response : ', response)

    // ******************************* METHODS ********************************

    // Error handling
    if (response.method === "error") {
        const error = response.error;
        console.log("Server error : ", response.message)
    }

    //Connection
    if (response.method === 'connect') {
        clientId = response.clientId;
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

    // Available games
    if (response.method === "available") {
        divGames.innerHTML = ''
        const games = response.games
        for (const game in games) {
            console.log('Game :', game, 'current ClientId: ', clientId)
            let content = document.createElement('div')
            content.classList.add("available-container")
            content.setAttribute('data-game', game)

            let gameInfos = document.createElement('div')
            gameInfos.classList.add('game-infos')
            gameInfos.textContent = 'Game ID: ' + game

            let btnContainer = document.createElement('div')
            btnContainer.classList.add("btn-container")

            let b = document.createElement('button')
            b.classList.add('btn')
            b.textContent = 'Join game'

            let b2 = document.createElement('button')
            b2.classList.add('btn')
            b2.textContent = 'Stop game'

            btnContainer.appendChild(b)
            btnContainer.appendChild(b2)
            gameInfos.appendChild(btnContainer)

            let playersControls = document.createElement('div')
            playersControls.classList.add('players-controls')

            let pcLeft = document.createElement('div')
            pcLeft.classList.add('pc-left')
            let pcRight = document.createElement('div')
            pcRight.classList.add('pc-right')

            playersControls.appendChild(pcLeft)
            playersControls.appendChild(pcRight)

            content.appendChild(gameInfos)
            content.appendChild(playersControls)
            divGames.appendChild(content)



            //join game on click
            b.addEventListener('click', () => {
                if (gameId === null) {
                    gameId = game
                }
                const payLoad = {
                    "method": "join",
                    "clientId": clientId,
                    "gameId": gameId,
                    "name": name.value
                }
                console.log('Sending : ', payLoad)
                ws.send(JSON.stringify(payLoad))


            })
            //destroy game on click
            b2.addEventListener('click', () => {
                if (gameId === null) {
                    gameId = game
                }
                const payLoad = {
                    "method": "destroy",
                    "clientId": clientId,
                    "gameId": gameId
                }
                console.log('Sending : ', payLoad)
                divPlayers.innerHTML = ''
                ws.send(JSON.stringify(payLoad))
            })

        }
    }

    // Updating client Id
    if (response.method === 'updateClient') {
        clientId = response.clientId;
        const message = response.message;

        game = response.game;
        units = response.game.units ? response.game.units : [];
        debris = response.game.debris ? response.game.debris : [];

        localStorage.setItem('clientId', JSON.stringify(clientId));
        localStorage.setItem('game', JSON.stringify(game));

        if (Object.keys(game).length === 0) {
            console.log('UpdateClient: aucune partie crée')
            //const payLoad = {
            //    method: 'createFullGame',
            //    clientId: clientId,
            //};
            //console.log('Sending : ', payLoad);
            //ws.send(JSON.stringify(payLoad));
        } else {
            // trouver dans la partie le client concerné
            const currentClient = game.clients.filter(
                (client) => client.clientId === clientId,
            );
            if (currentClient.length > 0) {
                currentPlayer = currentClient[0].playerId;
                // updating DOM
                //turnPlayer.innerHTML = currentPlayer;
            } else {
                //const payLoad = {
                //    method: 'createFullGame',
                //    clientId: clientId,
                //};
                //console.log('Sending : ', payLoad);
                //ws.send(JSON.stringify(payLoad));
            }
        }
        if (game && Object.values(game).length > 0) {
            const playersControls = getPlayersControls(game)
            updateClients(game, playersControls)
        }

    }

    //updating game creator ID
    if (response.method === 'updateCreator') {
        const clientId = response.clientId
        localStorage.setItem('clientId', JSON.stringify(clientId));
        console.log('Creator id updated in localStorage')
    }

    // ****************************  RESPONSES *******************************
    // create
    if (response.method === "create") {
        gameId = response.game.id;
        //txtGameId.value = gameId
        console.log("Game successfully create with Id ", response.game.id, "with", response.game.balls)
    }

    // join
    if (response.method === "join") {
        const game = response.game;
        const playersControls = getPlayersControls(game)
        //Updating
        updateClients(game, playersControls)
    }
    //quit
    if (response.method === 'quit') {
        const game = response.game
        const playersControls = getPlayersControls(game)
        updateClients(game, playersControls)
    }

    if (response.method === 'start') {
        const clientId = response.clientId
        const game = response.game
        //Stocker les données dans local storage
        localStorage.setItem('clientId', JSON.stringify(clientId));
        localStorage.setItem('game', JSON.stringify(game));
        setTimeout(() => { window.location.href = '/game' }, 1500)
    }
}

/** 
 * Updating connected clients list display
 * @param {array} game 
 * @param {node} playersControls : void
*/
function updateClients(game, playersControls) {
    const pcLeft = playersControls.querySelector('.pc-left')
    const pcRight = playersControls.querySelector('.pc-right')
    pcLeft.innerHTML = ''
    pcRight.innerHTML = ''
    //playersControls.innerHTML = ''

    //player Container
    let playerContainer = document.createElement("div");
    playerContainer.classList.add('players-container')

    // handling clients
    game.clients.forEach(c => {

        //player number, name and color
        let d = document.createElement("div");
        d.classList.add('player')
        d.style.background = c.color;
        d.textContent = 'Player : ' + c.playerId + ' ' + c.name;
        //adding player
        playerContainer.appendChild(d)

        // button Quit
        let b = document.createElement('button')
        b.classList.add('btn')
        b.textContent = 'Quit game'

        pcLeft.appendChild(playerContainer);

        b.addEventListener('click', () => {
            const payLoad = {
                "method": "quit",
                "clientId": clientId,
                "gameId": game.id
            }
            console.log('Sending : ', payLoad)
            ws.send(JSON.stringify(payLoad))
        })


        if (c.clientId === clientId) {
            pcRight.appendChild(b)
            //start game button
            if (game.clients.length >= 2) {
                let b = document.createElement('button')
                b.classList.add('btn')
                b.textContent = 'START GAME'
                pcRight.appendChild(b)
                b.addEventListener('click', () => {
                    const payLoad = {
                        "method": "start",
                        "gameId": game.id
                    }
                    console.log('Sending : ', payLoad)
                    ws.send(JSON.stringify(payLoad))
                })
            }
        }



        if (c.clientId === clientId) playerColor = c.color;
    })
}