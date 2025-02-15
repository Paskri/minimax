import { Tank, Scout, Gun, Repair, Qg, Supply, Artillery, Wall, Debris, Miner, Bulldozer, Radar } from './classesExp.js'
//export let state = { turn: 1, nbPlayers: 2 }

// générating units
export let units = [];

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

  { units: units, type: 'gun', x: 6, y: 16, player: 2, color: 'red', angle: 0 },
  { units: units, type: 'tank', x: 7, y: 16, player: 2, color: 'red', angle: 0 },
  { units: units, type: 'repair', x: 8, y: 16, player: 2, color: 'red', angle: 0 },
  { units: units, type: 'qg', x: 9, y: 16, player: 2, color: 'red', angle: 0 },
  { units: units, type: 'artillery', x: 10, y: 16, player: 2, color: 'red', angle: 0 },
  { units: units, type: 'supply', x: 11, y: 16, player: 2, color: 'red', angle: 0 },
  { units: units, type: 'tank', x: 12, y: 16, player: 2, color: 'red', angle: 0 },
  { units: units, type: 'gun', x: 13, y: 16, player: 2, color: 'red', angle: 0 },

  { units: units, type: 'scout', x: 7, y: 15, player: 2, color: 'red', angle: 0 },
  { units: units, type: 'scout', x: 8, y: 15, player: 2, color: 'red', angle: 0 },
  { units: units, type: 'scout', x: 6, y: 15, player: 2, color: 'red', angle: 0 },
  { units: units, type: 'scout', x: 9, y: 15, player: 2, color: 'red', angle: 0 },
  { units: units, type: 'scout', x: 11, y: 15, player: 2, color: 'red', angle: 0 },
  { units: units, type: 'scout', x: 12, y: 15, player: 2, color: 'red', angle: 0 },
  { units: units, type: 'scout', x: 13, y: 15, player: 2, color: 'red', angle: 0 },
  { units: units, type: 'scout', x: 10, y: 15, player: 2, color: 'red', angle: 0 },
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
  } else if (unit.type === 'wall') {
    units.push(new Wall(unit.units, unit.x, unit.y, unit.player, unit.color, unit.angle))
  } else if (unit.type === 'miner') {
    units.push(new Miner(unit.units, unit.x, unit.y, unit.player, unit.color, unit.angle))
  } else if (unit.type === 'bulldozer') {
    units.push(new Bulldozer(unit.units, unit.x, unit.y, unit.player, unit.color, unit.angle))
  } else if (unit.type === 'radar') {
    units.push(new Radar(unit.units, unit.x, unit.y, unit.player, unit.color, unit.angle))
  }
})

export let debris = []
let debrisDensity = 30
for (let i = 0; i <= debrisDensity; i++) {
  const x = Math.floor(Math.random() * 19); //0 to 19
  const y = Math.floor(Math.random() * 12) + 2; //2 to 14
  const qty = Math.floor(Math.random() * 15) + 10; //2 to 14
  if (debris.some((d) => d.x === x && d.y === y) || units.some((u) => u.x === x && u.y === y)) {
    debrisDensity++
  } else {
    debris.push(new Debris(debris, x, y, qty))
  }
}

//generating random walls
let density = 30
for (let i = 0; i <= density; i++) {
  const x = Math.floor(Math.random() * 19); //0 to 19
  const y = Math.floor(Math.random() * 13) + 2; //2 to 14

  if (units.some((unit) => unit.x === x && unit.y === y)) {
    density++
  } else {
    units.push(new Wall(units, x, y, 0, 'transparent', 0))
  }
}

export let minesGroups = [
  { type: 'mineral', color: 'white', x: 2, y: 1, qty: 16 },
  { type: 'mineral', color: 'white', x: 17, y: 1, qty: 16 },
  { type: 'mineral', color: 'white', x: 2, y: 15, qty: 16 },
  { type: 'mineral', color: 'white', x: 17, y: 15, qty: 16 },
]

/*{
  1: ['gold', 3, 2, 12],
  2: ['white', 2, 1, 5],
  3: ['white', 4, 1, 4],
  4: ['white', 2, 3, 3],
  5: ['white', 4, 3, 4],
},
{
  1: ['white', 6, 5, 13],
  2: ['green', 5, 4, 5],
  3: ['green', 7, 4, 6],
  4: ['green', 5, 6, 4],
  5: ['green', 7, 6, 3],
},
{
  1: ['green', 7, 8, 15],
  2: ['white', 6, 7, 5],
  3: ['white', 8, 7, 3],
  4: ['white', 6, 9, 2],
  5: ['white', 8, 9, 4],
}*/