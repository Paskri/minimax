// ************* Canvas Context **************
const chess = document.querySelector('#chess');
const cctx = chess.getContext('2d');
const grid = document.querySelector('#grid');
const ctx = grid.getContext('2d');
const background = document.querySelector('#background')
const bgctx = background.getContext('2d')

let btnState = {
  visible: false,
  displayLife: false,
  displayStatus: false,
  displayRanges: false,
  displayGridNumbers: true,
  displayTeamColors: false,
};

// ************* HTML elements **************
function getBtn(item, key) {
  //console.log(item, key);
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

class Screen {
  constructor(width, height, gameMapSize) {
    // fixed width
    this.width = width
    this.height = height
    this.canvasSize = { width: width, height: height }
    this.squareWidth = width / 50
    this.squareHeight = height / 50
    this.gameMapSize = gameMapSize
    // zoom feature -> relative displayed pixels
    this.zoom = 1
    this.visiblePixWidth = width
    this.visiblePixHeight = height
    this.visibleSquaresWidth = width / 50
    this.visibleSquaresHeight = height / 50

    this.visibleLeftTop = { x: 0, y: 0 }
    this.visibleRightBottom = { x: width, y: height }
    this.center = { x: width / 2, y: height / 2 }
  }
  updateVisibleSquares() {
    this.visiblePixHeight = Math.floor(this.canvasSize.height / this.zoom)
    this.visiblePixWidth = Math.floor(this.canvasSize.width / this.zoom)
    this.visibleSquaresWidth = Math.floor(this.canvasSize.width / 50 / this.zoom) + 1
    this.visibleSquaresHeight = Math.floor(this.canvasSize.height / 50 / this.zoom) + 1
    this.updateCenter()
  }

  updateCanvasSize() {
    let canvasContainer = document.querySelector('.canvas-container')
    this.width = canvasContainer.clientWidth
    this.height = canvasContainer.clientHeight
    this.canvasSize = { width: canvasContainer.clientWidth, height: canvasContainer.clientHeight }
    //updating canvas attributes
    chess.setAttribute('width', this.canvasSize.width)
    chess.setAttribute('height', this.canvasSize.height)
    grid.setAttribute('width', this.canvasSize.width)
    grid.setAttribute('height', this.canvasSize.height)
    background.setAttribute('width', this.canvasSize.width)
    background.setAttribute('height', this.canvasSize.height)
    //updating visible squares
    this.updateVisibleSquares()
  }

  updateCenter() {
    this.center.x = this.center.x - this.visiblePixWidth / 2 < 0 ? this.visiblePixWidth / 2 : this.center.x
    this.center.y = this.center.y - this.visiblePixHeight / 2 < 0 ? this.visiblePixHeight / 2 : this.center.y
    this.center.x = this.center.x + this.visiblePixWidth / 2 > this.gameMapSize.width ? this.gameMapSize.width - this.visiblePixWidth / 2 : this.center.x
    this.center.y = this.center.y + this.visiblePixHeight / 2 > this.gameMapSize.height ? this.gameMapSize.height - this.visiblePixHeight / 2 : this.center.y
    this.visibleLeftTop.x = this.center.x - this.visiblePixWidth / 2
    this.visibleLeftTop.y = this.center.y - this.visiblePixHeight / 2
    this.visibleRightBottom.x = this.center.x + this.visiblePixWidth / 2
    this.visibleRightBottom.y = this.center.y + this.visiblePixHeight / 2
    //console.log(this.visibleSquaresWidth, this.visibleSquaresHeight)
    //console.log('center: ', this.center)
    //console.log('visibleLeftTop: ', this.visibleLeftTop)
    //console.log('visibleRightBottom: ', this.visibleRightBottom)
  }

  updateZoom(zoomDelta) {
    if (zoomDelta < 0) {
      // molette vers le haut = zoom in
      screen.zoom *= 1.1;
    } else {
      // molette vers le bas = zoom out
      screen.zoom /= 1.1;
    }

    // Zoom Limits
    this.zoom = Math.max(0.5, Math.min(this.zoom, 2));
    this.updateVisibleSquares()
    //console.log('Zoom:', this.zoom, 'VisibleWidth:', this.visiblePixWidth, this.visibleSquaresWidth, 'VisibleHeight:', this.visiblePixHeight, this.visibleSquaresHeight);
  }


}


class Map {
  constructor(width, height) {
    this.size = { width: width, height: height }
    this.width = width
    this.height = height
    this.squareWidth = width / 50
    this.squareHeight = height / 50
  }
}

let canvasSize = { width: 0, height: 0 }

// getting canvas size at start
let canvasContainer = document.querySelector('.canvas-container')
canvasSize = { width: canvasContainer.clientWidth, height: canvasContainer.clientHeight }

window.addEventListener('resize', function (e) {
  screen.updateCanvasSize()
})

let gameMap = new Map(6000, 5100)
let screen = new Screen(canvasSize.width, canvasSize.height, gameMap.size)
screen.updateCanvasSize()

//console.log(miniMap)
let map = [];
for (let i = 0; i < gameMap.squareWidth; i++) {
  map[i] = [];
  for (let j = 0; j < gameMap.squareHeight; j++) {
    map[i][j] = {};
  }
}

// keyboard listener
// interactive map handling
const backgroundImg = document.querySelector('#background-img')
const pressedKeys = {};
window.addEventListener('keydown', function (event) {
  pressedKeys[event.key] = true;
});

window.addEventListener('keyup', function (event) {
  pressedKeys[event.key] = false;
});

grid.addEventListener('wheel', function (event) {
  event.preventDefault();
  screen.updateZoom(event.deltaY)
});

grid.addEventListener('click', function (e) {
  const rect = grid.getBoundingClientRect();
  let selected = {
    x: Math.floor((e.clientX - rect.left)),
    y: Math.floor((e.clientY - rect.top)),
  };

  if (selected.x > screen.canvasSize.width - 244 && selected.y < 244) {
    return
  }
})

// Event Listeners
const coordsDisplay = document.querySelector('.coords-display')
grid.addEventListener('mousemove', function (e) {
  const rect = grid.getBoundingClientRect();
  let selected = {
    x: Math.floor(Math.floor(((e.clientX - rect.left) / screen.zoom + screen.visibleLeftTop.x) / 50)),
    y: Math.floor(Math.floor(((e.clientY - rect.top) / screen.zoom + screen.visibleLeftTop.y) / 50)),
  };
  coordsDisplay.innerHTML = `Coords : ${selected.x} - ${selected.y}`
})

let mouseDown = false
const mouseHandle = (e) => {
  const rect = grid.getBoundingClientRect();
  let selected = {
    x: Math.floor((e.clientX - rect.left)),
    y: Math.floor((e.clientY - rect.top)),
  };

  if (selected.x > screen.canvasSize.width - 244 && selected.y < 244) {
    console.log('scs:', screen.canvasSize)
    screen.center = { x: (selected.x - screen.canvasSize.width + 244) * 25, y: (selected.y - 2) * 25 }
    screen.updateCenter()
  } else {
    mouseDown = false
  }
}

grid.addEventListener('mousedown', function (e) {
  mouseDown = true
  mouseHandle(e)
})
grid.addEventListener('mousemove', function (e) {
  if (!mouseDown) return;
  mouseHandle(e)
})
grid.addEventListener('mouseup', function (e) {
  mouseDown = false
})


function draw() {
  cctx.clearRect(0, 0, chess.width, chess.height);
  ctx.clearRect(0, 0, grid.width, grid.height);
  bgctx.clearRect(0, 0, grid.width, grid.height);
  //zoom handling
  cctx.save();
  cctx.scale(screen.zoom, screen.zoom);
  ctx.save();
  ctx.scale(screen.zoom, screen.zoom);
  bgctx.save();
  bgctx.scale(screen.zoom, screen.zoom);

  // draw visible backgroundImg
  bgctx.drawImage(backgroundImg, -screen.visibleLeftTop.x, -screen.visibleLeftTop.y, gameMap.width, gameMap.height);

  // moving background 
  let moved = false;
  if (pressedKeys['z']) {
    screen.center.y -= 10
    moved = true;
  }
  if (pressedKeys['s']) {
    screen.center.y += 10
    moved = true;
  }
  if (pressedKeys['q']) {
    screen.center.x -= 10
    moved = true;
  }
  if (pressedKeys['d']) {
    screen.center.x += 10
    moved = true;
  }
  if (moved) {
    screen.updateCenter()
  }

  // draw only visible map
  for (let i = 0; i < screen.visibleSquaresWidth + 1; i++) {
    // Vertical
    ctx.beginPath();
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1;
    ctx.moveTo(i * 50 - screen.visibleLeftTop.x % 50, 0);
    ctx.lineTo(i * 50 - screen.visibleLeftTop.x % 50, screen.visiblePixHeight);
    ctx.stroke();
    // Horizontal
  }
  for (let j = 0; j < screen.visibleSquaresHeight + 1; j++) {
    ctx.beginPath();
    ctx.moveTo(0, j * 50 - screen.visibleLeftTop.y % 50);
    ctx.lineTo(screen.visiblePixWidth, j * 50 - screen.visibleLeftTop.y % 50);
    ctx.stroke();
  }
  // grid coords
  if (btnState.displayGridNumbers) {
    for (let i = 0; i < screen.visibleSquaresWidth + 1; i++) {
      for (let j = 0; j < screen.visibleSquaresHeight + 1; j++) {
        cctx.font = '9px DejaVu Sans';
        cctx.fillStyle = '#222';
        let displayedX = i + Math.floor(screen.visibleLeftTop.x / 50)
        let displayedY = j + Math.floor(screen.visibleLeftTop.y / 50)
        cctx.fillText(`${displayedX} - ${displayedY} `, i * 50 + 5 - screen.visibleLeftTop.x % 50, j * 50 + 12 - screen.visibleLeftTop.y % 50);
      }
    }
  }

  ctx.restore();
  cctx.restore();
  bgctx.restore();
  cctx.save();
  cctx.scale(1, 1);
  ctx.save();
  ctx.scale(1, 1);
  bgctx.save();
  bgctx.scale(1, 1);

  // ********** Minimap **********
  // Style du rectangle
  ctx.fillStyle = '#AAAAAA'; // couleur de remplissage
  ctx.strokeStyle = '#000'; // couleur du contour
  ctx.lineWidth = 2;

  // Dessiner le rectangle
  // définir coordonnées et taille relative
  ctx.fillRect(screen.canvasSize.width - 242, 2, 240, 204);     // (x, y, largeur, hauteur)
  ctx.strokeRect(screen.canvasSize.width - 244, 0, 244, 208);
  ctx.drawImage(backgroundImg, screen.canvasSize.width - 242, 2, 240, 204);

  //visible rectangle
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 1;
  // Dessiner le rectangle
  ctx.strokeRect(screen.canvasSize.width - 242 + Math.floor(screen.visibleLeftTop.x / 50 * 2), 2 + Math.floor(screen.visibleLeftTop.y / 50 * 2), screen.visibleSquaresWidth * 2, screen.visibleSquaresHeight * 2);     // (x, y, largeur, hauteur)


  ctx.restore();
  cctx.restore();
  bgctx.restore();

}
function gameLoop() {
  //update();    déplacement de la "caméra"
  draw();     // dessin de la scène (image + éléments canvas)
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
