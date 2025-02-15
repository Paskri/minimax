let state = { turn: 1, nbPlayers: 2 }

// générating units
let units = [];
let deployedUnits = [
    { units: units, type: 'gun', x: 6, y: 0, player: 1, color: 'blue', angle: 180 },
    { units: units, type: 'tank', x: 7, y: 0, player: 1, color: 'blue', angle: 180 },
    { units: units, type: 'repair', x: 8, y: 0, player: 1, color: 'blue', angle: 180 },
    { units: units, type: 'qg', x: 9, y: 0, player: 1, color: 'blue', angle: 180 },
    { units: units, type: 'artillery', x: 10, y: 0, player: 1, color: 'blue', angle: 180 },
    { units: units, type: 'supply', x: 11, y: 0, player: 1, color: 'blue', angle: 180 },
    { units: units, type: 'tank', x: 12, y: 0, player: 1, color: 'blue', angle: 180 },
    { units: units, type: 'gun', x: 13, y: 0, player: 1, color: 'blue', angle: 180 },

    { units: units, type: 'scout', x: 6, y: 1, player: 1, color: 'blue', angle: 180 },
    { units: units, type: 'scout', x: 7, y: 1, player: 1, color: 'blue', angle: 180 },
    { units: units, type: 'scout', x: 8, y: 1, player: 1, color: 'blue', angle: 180 },
    { units: units, type: 'scout', x: 9, y: 1, player: 1, color: 'blue', angle: 180 },
    { units: units, type: 'scout', x: 10, y: 1, player: 1, color: 'blue', angle: 180 },
    { units: units, type: 'scout', x: 11, y: 1, player: 1, color: 'blue', angle: 180 },
    { units: units, type: 'scout', x: 12, y: 1, player: 1, color: 'blue', angle: 180 },
    { units: units, type: 'scout', x: 13, y: 1, player: 1, color: 'blue', angle: 180 },

    { units: units, type: 'gun', x: 6, y: 7, player: 2, color: 'red', angle: 0 },
    { units: units, type: 'tank', x: 7, y: 7, player: 2, color: 'red', angle: 0 },
    { units: units, type: 'repair', x: 8, y: 7, player: 2, color: 'red', angle: 0 },
    { units: units, type: 'qg', x: 9, y: 7, player: 2, color: 'red', angle: 0 },
    { units: units, type: 'artillery', x: 10, y: 7, player: 2, color: 'red', angle: 0 },
    { units: units, type: 'supply', x: 11, y: 7, player: 2, color: 'red', angle: 0 },
    { units: units, type: 'tank', x: 12, y: 7, player: 2, color: 'red', angle: 0 },
    { units: units, type: 'gun', x: 13, y: 7, player: 2, color: 'red', angle: 0 },

    { units: units, type: 'scout', x: 7, y: 6, player: 2, color: 'red', angle: 0 },
    { units: units, type: 'scout', x: 8, y: 6, player: 2, color: 'red', angle: 0 },
    { units: units, type: 'scout', x: 6, y: 6, player: 2, color: 'red', angle: 0 },
    { units: units, type: 'scout', x: 9, y: 6, player: 2, color: 'red', angle: 0 },
    { units: units, type: 'scout', x: 11, y: 6, player: 2, color: 'red', angle: 0 },
    { units: units, type: 'scout', x: 12, y: 6, player: 2, color: 'red', angle: 0 },
    { units: units, type: 'scout', x: 13, y: 6, player: 2, color: 'red', angle: 0 },
    { units: units, type: 'scout', x: 10, y: 6, player: 2, color: 'red', angle: 0 },

]

deployedUnits.forEach(unit => {
    if (unit.type === 'tank') {
        units.push(new Tank(unit.units, unit.x, unit.y, unit.player, unit.color, unit.angle))
    } else if (unit.type === 'repair') {
        units.push(new Repair(unit.units, unit.x, unit.y, unit.player, unit.color, unit.angle))
    } else if (unit.type === 'supply') {
        units.push(new Supply(unit.units, unit.x, unit.y, unit.player, unit.color, unit.angle))
    } else if (unit.type === 'qg') {
        units.push(new Qg(unit.units, unit.x, unit.y, unit.player, unit.color, unit.angle))
    } else if (unit.type === 'gun') {
        units.push(new Gun(unit.units, unit.x, unit.y, unit.player, unit.color, unit.angle))
    } else if (unit.type === 'scout') {
        units.push(new Scout(unit.units, unit.x, unit.y, unit.player, unit.color, unit.angle))
    } else if (unit.type === 'artillery') {
        units.push(new Artillery(unit.units, unit.x, unit.y, unit.player, unit.color, unit.angle))
    }
})

let minesGroups = [
    {
        1: ['gold', 3, 2, 12],
        2: ['grey', 2, 1, 5],
        3: ['grey', 4, 1, 4],
        4: ['grey', 2, 3, 3],
        5: ['grey', 4, 3, 4],
    },
    {
        1: ['grey', 6, 5, 13],
        2: ['green', 5, 4, 5],
        3: ['green', 7, 4, 6],
        4: ['green', 5, 6, 4],
        5: ['green', 7, 6, 3],
    },
    {
        1: ['green', 7, 8, 15],
        2: ['grey', 6, 7, 5],
        3: ['grey', 8, 7, 3],
        4: ['grey', 6, 9, 2],
        5: ['grey', 8, 9, 4],
    }
]

