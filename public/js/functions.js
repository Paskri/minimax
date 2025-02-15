import { Node } from "./classesExp.js";

/**
 * Checks if a number is even.
 * 
 * @param {number} number - The number to check.
 * @returns {boolean} `true` if the number is even, otherwise `false`.
 */
export function isEven(number) {
    return number % 2 === 0;
}

/**
 * Checks if a given position (x, y) is an obstacle on the map.
 * 
 * @param {number} x - The x-coordinate of the position to check.
 * @param {number} y - The y-coordinate of the position to check.
 * @param {number} cx - The current x-coordinate (not used in function logic).
 * @param {number} cy - The current y-coordinate (not used in function logic).
 * @returns {boolean} `true` if the position contains an obstacle, otherwise `false`.
 * 
 */
export function isObstacle(x, y, cx, cy) {
    return map[x][y].length > 0;
}

/**
 * Calculates the Euclidean distance between a starting point and a target point.
 * 
 * @param {number} targetX - The x-coordinate of the target point.
 * @param {number} targetY - The y-coordinate of the target point.
 * @param {number} startX - The x-coordinate of the starting point.
 * @param {number} startY - The y-coordinate of the starting point.
 * @returns {number} The distance between the two points.
 * 
 */
export function calculateDist(targetX, targetY, startX, startY) {
    return Math.sqrt(
        Math.pow(targetX - startX, 2) +
        Math.pow(targetY - startY, 2)
    )
}

/* A star */

/**
 * Computes the Chebyshev distance between two nodes.
 * 
 * The Chebyshev distance is useful in grid-based pathfinding where diagonal 
 * movement has the same cost as horizontal or vertical movement.
 * 
 * @param {{x: number, y: number}} nodeA - The first node with x and y coordinates.
 * @param {{x: number, y: number}} nodeB - The second node with x and y coordinates.
 * @returns {number} The Chebyshev distance between the two nodes.
 */
export function heuristic(nodeA, nodeB) {
    // Distance Chebyshev
    return Math.max(Math.abs(nodeA.x - nodeB.x), Math.abs(nodeA.y - nodeB.y));
}

/**
 * Retrieves the neighboring nodes of a given node in a 2D grid.
 * 
 * This function considers all 8 possible neighbors (up, down, left, right, and diagonals).
 * It ensures that neighbors remain within the grid boundaries.
 * 
 * @param {{x: number, y: number}} node - The current node with x and y coordinates.
 * @param {Array<Array<any>>} grid - A 2D array representing the grid.
 * @returns {Array<any>} An array of neighboring nodes.
 * 
 */
function getNeighbors(node, grid) {
    let neighbors = [];
    const directions = [
        [0, -1], [0, 1], [-1, 0], [1, 0],
        [-1, -1], [-1, 1], [1, -1], [1, 1]
    ];
    for (let dir of directions) {
        const newX = node.x + dir[0];
        const newY = node.y + dir[1];
        //si contenu dans la grille
        if (newX >= 0 && newX < grid.length && newY >= 0 && newY < grid[0].length) {
            neighbors.push(grid[newX][newY]);
        }
    }
    return neighbors;
}

/**
 * Implements the A* pathfinding algorithm to find the shortest path between two points in a grid.
 * 
 * @param {{x: number, y: number, walkable: boolean, g?: number, h?: number, f?: number, parent?: any}} start - The starting node.
 * @param {{x: number, y: number, walkable: boolean}} goal - The target node.
 * @param {Array<Array<{x: number, y: number, walkable: boolean}>>} grid - A 2D array representing the grid.
 * @returns {Array<{x: number, y: number}>} An array of nodes representing the shortest path, or an empty array if no path is found.
 * 
 */
export function aStar(start, goal, grid) {
    let OpenSet = [];
    let closedSet = new Set();
    start.g = 0;
    start.h = heuristic(start, goal);
    start.f = start.g + start.h;
    OpenSet.push(start);
    let openSet = OpenSet

    while (openSet.length > 0) {
        //Get the node with the lowest f value
        let current = openSet.reduce((prev, curr) => prev.f < curr.f ? prev : curr);
        // If the goal is reached, reconstruct the path
        if (current === goal) {
            const path = [];
            while (current.parent) {
                path.push(current);
                current = current.parent;
            }
            path.push(start);

            return path.reverse();
        }

        // Remove current from openSet and add to closedSet
        openSet.splice(openSet.indexOf(current), 1);
        closedSet.add(current);
        let neighbors = getNeighbors(current, grid)
        for (let neighbor of neighbors) {
            // continue si walkable = false et attack=false et case != goal
            if ((!neighbor.walkable && !(attack && neighbor === goal)) || closedSet.has(neighbor)) {
                continue;
            }

            let cost = (neighbor.x !== current.x && neighbor.y !== current.y) ? 1.4 : 1;
            const tentativeG = current.g + cost;

            if (!openSet.includes(neighbor)) {
                openSet.push(neighbor);
            } else if (tentativeG >= neighbor.g) {
                continue;
            }

            neighbor.parent = current;
            neighbor.g = tentativeG;
            neighbor.h = heuristic(neighbor, goal);
            neighbor.f = neighbor.g + neighbor.h;
        }
    }
    //No path found
    return [];
}

/**
 * Generates a 2D grid for the A* algorithm based on the given map.
 * 
 * @param {Array<Array<Object>>} map - A 2D array representing the game/map grid, where each cell may contain properties like `walkable`.
 * @returns {Array<Array<Node>>} A 2D array of `Node` objects representing the A* pathfinding grid.
 * 
 */
export function defineAStarGrid(map) {
    let aStarGrid = []
    for (let i = 0; i < 20; i++) {
        aStarGrid[i] = []
        for (let j = 0; j < 17; j++) {
            let walkable = true
            if (Object.keys(map[i][j]).length > 0 && map[i][j].walkable === false) {
                walkable = false
            }
            aStarGrid[i][j] = new Node(i, j, walkable)
        }
    }
    return aStarGrid
}

/**
 * Handles the actions that occur when advancing to the next turn in the game.
 * 
 * This function updates the turn display, resets UI elements, and prepares the game for the next turn.
 * It modifies DOM elements such as the turn counter and countdown status based on the current state.
 * 
 * @param {Object} selectedUnit - The currently selected unit for the turn.
 * @param {Object} game - The current game state, including properties like `turn`.
 * @param {Array<Object>} units - The list of units in the game.
 */
export function nextTurn(selectedUnit, game, units) {
    console.log('Launching Turn : ', game.turn)

    document.querySelector('#turn').innerHTML = game.turn
    const endTurn = document.querySelector('#endturn')
    if (endTurn.classList.contains('active')) {
        endTurn.classList.remove('active')
    }
    const countDown = document.querySelector('#countDown')
    if (countDown.classList.contains('red')) {
        countDown.classList.remove('red')
    }
}

/**
 * Automatically fires on eligible targets based on the current unit's range and visibility.
 * 
 * This function checks if the unit is within the range and if the target is visible. If conditions are met, it sends an 
 * "auto fire" payload to the server for processing, containing a list of eligible aggressors (units that can attack).
 * 
 * @param {Array<Object>} eRangedCells - Array of cells that are within the range of the current unit, each with a list of IDs of possible targets.
 * @param {Object} unit - The current unit that may perform the auto-fire action.
 * @param {Array<Object>} units - Array of all units in the game.
 * @param {Array<Object>} eCoveredCells - Array of cells representing the visible cells in the game.
 * @param {string} currentPlayer - The identifier for the current player.
 * @param {Object} game - The current game state, including the `id` of the game.
 * @param {WebSocket} ws - The WebSocket connection to send the auto-fire payload to the server.
 * 
 */
export function autoFire(eRangedCells, unit, units, eCoveredCells, currentPlayer, game, ws) {
    const isRanged = eRangedCells.findIndex(
        (cell) => cell.x === unit.x && cell.y === unit.y
    )
    const eVisible =
        eCoveredCells.find((cell) => cell.x === unit.x && cell.y === unit.y) !==
        undefined

    if (isRanged !== -1 && unit.player === currentPlayer && eVisible) {
        const cleanedRangedCells = eRangedCells[isRanged].ids.filter(id => {
            return units[id].currentSpecs.ammo > 0 && units[id].currentSpecs.shots > 0;
        });
        console.log('cleanedRangedCells : ', cleanedRangedCells)
        if (cleanedRangedCells.length > 0) {
            unit.onAutoFire = true
            const payLoad = {
                method: 'autoFire',
                agressors: cleanedRangedCells,
                target: unit.id,
                gameId: game.id,
            }
            console.log('sending : ', payLoad)
            ws.send(JSON.stringify(payLoad))
        } else {
            console.log('No valid agressors')
        }
    }
}

/**
 * Generates and returns an object containing image elements for various assets in the game.
 * 
 * This function creates `Image` objects for a list of predefined asset names (e.g., tank, scout, gun). It handles specific 
 * sizes for certain images based on their names and returns an object where each key is the asset name and the value 
 * is the corresponding `Image` object.
 * 
 * @returns {Object} An object where each key is an asset name (string) and each value is the corresponding `Image` object.
 * 
 */
export function generateImages() {
    const imageNames = ['tank', 'scout', 'gun', 'artillery', 'qg', 'repair', 'supply', 'miner', 'bulldozer', 'radar', 'fire', 'impact', 'bigimpact', 'wreck', 'wall', 'construct'];
    const images = {};
    imageNames.forEach(name => {
        const img = new Image();
        if (name !== 'bigimpact' && name !== 'wreck') {
            img.src = `../img/${name}.webp`;
            img.width = 34;
            img.height = 34;
        } else if (name === 'bigimpact') {
            img.src = `../img/impact.webp`;
            img.width = 75;
            img.height = 75;
        } else if (name === 'wreck' || name === 'wall') {
            img.src = `../img/${name}.webp`;
            img.width = 50;
            img.height = 50;
        }
        images[name] = img;
    });
    return images
}

/**
 * Determines if there is a clear line of sight between two points on a grid.
 * 
 * This function uses a raycasting algorithm to check if a direct line from the starting point
 * `(startCol, startRow)` to the target `(targetCol, targetRow)` intersects any obstacles (e.g., walls) in the grid.
 * If an obstacle is encountered, the function returns `false`, indicating that the line of sight is blocked.
 * If no obstacles are encountered, it returns `true`, indicating a clear line of sight.
 * 
 * @param {Array} grid - The game grid represented as a 2D array, where each element is an object that may contain properties like `type`.
 * @param {number} startCol - The starting column index (horizontal position) in the grid.
 * @param {number} startRow - The starting row index (vertical position) in the grid.
 * @param {number} targetCol - The target column index (horizontal position) in the grid.
 * @param {number} targetRow - The target row index (vertical position) in the grid.
 * 
 * @returns {boolean} `true` if there is a clear line of sight between the points, otherwise `false`.
 * 
 */
export function lineOfSight(grid, startCol, startRow, targetCol, targetRow) {
    // Raycast Algorithm
    let x0 = startCol * 50 + 25;
    let y0 = startRow * 50 + 25;
    let x1 = targetCol * 50 + 25;
    let y1 = targetRow * 50 + 25;
    let dx = x1 - x0;
    let dy = y1 - y0;
    let distance = Math.sqrt(dx * dx + dy * dy);
    let stepX = dx / distance;
    let stepY = dy / distance;
    let x = x0;
    let y = y0;

    while (Math.abs(x - x0) < Math.abs(dx) || Math.abs(y - y0) < Math.abs(dy)) {
        let col = Math.floor(x / 50);
        let row = Math.floor(y / 50);
        if (grid[col] && grid[col][row].type === "wall") return false;
        x += stepX * 5;
        y += stepY * 5;
    }

    return true;
}
