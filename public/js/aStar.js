class Node {
    constructor(x, y, walkable = true) {
        this.x = x;
        this.y = y;
        this.walkable = walkable;
        this.g = 0;
        this.h = 0;
        this.f = 0;
        this.parent = null;
    }
}

function heuristic(nodeA, nodeB) {
    // Manhattan 
    return Math.abs(nodeA.x - nodeB.x) + Math.abs(nodeA.y - nodeB.y);
}

function getNeighbors(node, grid) {
    const neighbors = [];
    const directions = [
        [0, -1], [0, 1], [-1, 0], [1, 0]
    ];
    for (let dir of directions) {
        const newX = node.x + dir[0];
        const newY = node.y + dir[1];
        if (newX >= 0 && newX < grid.length && newY >= 0 && newY < grid[0].length) {
            neighbors.push(grid[newX][newY]);
        }
    }
    return neighbors;
}

function aStar(start, goal, grid) {
    const openSet = [start];
    const closedSet = new Set();

    start.g = 0;
    start.h = heuristic(start, goal);
    start.f = start.g + start.h;

    while (openSet.length > 0) {
        // Get the node with the lowest f value
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

        for (let neighbor of getNeighbors(current, grid)) {
            if (!neighbor.walkable || closedSet.has(neighbor)) {
                continue;
            }

            const tentativeG = current.g + 1;

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

    // No path found
    return [];
}

// Example usage
//const grid = [];
//for (let i = 0; i < 10; i++) {
//    const row = [];
//    for (let j = 0; j < 10; j++) {
//        row.push(new Node(i, j));
//    }
//    grid.push(row);
//}

// Add obstacles
//grid[3][3].walkable = false;
//grid[3][4].walkable = false;
//grid[3][5].walkable = false;
//
//const start = grid[0][0];
//const goal = grid[9][9];
//
//const path = aStar(start, goal, grid);
//
//if (path.length > 0) {
//    console.log("Path found:");
//    for (let node of path) {
//        console.log(`(${node.x}, ${node.y})`);
//    }
//} else {
//    console.log("No path found.");
//}
