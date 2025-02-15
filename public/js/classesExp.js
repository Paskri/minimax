export class Node {
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

class CommonSpecs {
  constructor() {
    this.objX = null;
    this.objY = null;
    this.route = [];
    this.moving = false;
    this.moveAndFire = false;
    this.animStep = 0;
    this.travelToX = 0;
    this.travelToY = 0;
    this.firing = false;
    this.autoFiring = false;
    this.fireStep = 0;
    this.autoFireStep = 0;
    this.targetX = null;
    this.targetY = null;
    this.targetId = null;
    this.onFire = false;
    this.onAutoFire = false;
    this.agrId = null;
    this.agrIds = [];
    this.rangedCells = [];
    this.destroyed = false;
    this.canBuild = false;
    this.canProduce = false;
    this.canScrap = false;
    this.canRepair = false;
    this.canSupply = false;
    this.canCargo = false;
    this.canFire = false;
    this.canMode = false;
    this.canExploit = false;
    this.modes = [];
    this.activeModes = [];
    this.cargo = 0;
    this.scrapping = false;
  }
}

export class Tank extends CommonSpecs {
  constructor(units = 0, x = 0, y = 0, player = 0, color = '', angle = 0) {
    super();
    this.id = units.length;
    this.type = 'tank';
    this.walkable = false;
    this.x = x;
    this.y = y;
    this.player = player;
    this.color = color;
    this.angle = angle;
    this.canFire = true;
    this.modes = ['fire', 'sentry']
    this.activeModes = ['sentry']

    this.currentSpecs = {
      shots: 2,
      ammo: 14,
      life: 24,
      speed: 6
    };
    this.specs = {
      attack: 16,
      shots: 2,
      range: 4,
      ammo: 14,
      armor: 10,
      life: 24,
      radar: 4,
      speed: 6,
      cost: 12,
      production: [
        { turns: 4, cost: 12, buildStep: 3 },
        { turns: 2, cost: 24, buildStep: 12 },
        { turns: 1, cost: 36, buildStep: 36 }
      ]
    }
  }
}

export class Scout extends CommonSpecs {
  constructor(units = 0, x = 0, y = 0, player = 0, color = '', angle = 0) {
    super();
    this.id = units.length;
    this.type = 'scout';
    this.walkable = false;
    this.x = x;
    this.y = y;
    this.player = player;
    this.color = color;
    this.angle = angle;
    this.canFire = true;
    this.modes = ['fire', 'sentry']
    this.activeModes = ['sentry']

    this.currentSpecs = {
      shots: 1,
      ammo: 10,
      life: 16,
      speed: 12
    };
    this.specs = {
      attack: 12,
      shots: 1,
      range: 3,
      ammo: 10,
      armor: 4,
      life: 16,
      radar: 9,
      speed: 12,
      cost: 9,
      production: [
        { turns: 3, cost: 9, buildStep: 3 },
        { turns: 2, cost: 18, buildStep: 9 },
        { turns: 1, cost: 27, buildStep: 24 }
      ]
    }
  }
}

export class Gun extends CommonSpecs {
  constructor(units = 0, x = 0, y = 0, player = 0, color = '', angle = 0) {
    super();
    this.id = units.length;
    this.type = 'gun';
    this.walkable = false;
    this.x = x;
    this.y = y;
    this.player = player;
    this.color = color;
    this.angle = angle;
    this.canFire = true;
    this.canMode = true;
    this.modes = ['fire', 'sentry']
    this.activeModes = ['sentry']

    this.currentSpecs = {
      shots: 2,
      ammo: 14,
      life: 24,
      speed: 12
    }
    this.specs = {
      attack: 18,
      shots: 2,
      range: 6,
      ammo: 14,
      armor: 4,
      life: 24,
      radar: 5,
      speed: 12,
      cost: 24,
      production: [
        { turns: 8, cost: 24, buildStep: 3 },
        { turns: 4, cost: 48, buildStep: 12 },
        { turns: 2, cost: 72, buildStep: 36 }
      ]
    }
  }
}

export class Radar extends CommonSpecs {
  constructor(units = 0, x = 0, y = 0, player = 0, color = '', angle = 0) {
    super();
    this.id = units.length;
    this.type = 'radar';
    this.walkable = false;
    this.x = x;
    this.y = y;
    this.player = player;
    this.color = color;
    this.angle = angle;

    this.currentSpecs = {
      shots: 0,
      ammo: 0,
      life: 24,
      speed: 7
    };
    this.specs = {
      attack: 0,
      shots: 0,
      range: 0,
      ammo: 0,
      armor: 4,
      life: 24,
      radar: 14,
      speed: 7,
      cost: 12,
      production: [
        { turns: 3, cost: 12, buildStep: 3 },
        { turns: 2, cost: 24, buildStep: 12 },
        { turns: 1, cost: 36, buildStep: 36 }
      ]
    };
  }
}

export class Artillery extends CommonSpecs {
  constructor(units = 0, x = 0, y = 0, player = 0, color = '', angle = 0) {
    super();
    this.id = units.length;
    this.type = 'artillery';
    this.walkable = false;
    this.x = x;
    this.y = y;
    this.player = player;
    this.color = color;
    this.angle = angle;
    this.canMode = true;
    this.canFire = true;
    this.modes = ['fire', 'sentry']
    this.activeModes = ['sentry']

    this.currentSpecs = {
      shots: 1,
      ammo: 6,
      life: 24,
      speed: 6,
    }
    this.specs = {
      attack: 22,
      shots: 1,
      range: 10,
      ammo: 6,
      armor: 4,
      life: 24,
      radar: 4,
      speed: 6,
      cost: 36,
      production: [
        { turns: 12, cost: 36, buildStep: 3 },
        { turns: 6, cost: 72, buildStep: 12 },
        { turns: 3, cost: 108, buildStep: 36 }
      ]
    }
  }
}

export class Repair extends CommonSpecs {
  constructor(units = 0, x = 0, y = 0, player = 0, color = '', angle = 0) {
    super();
    this.id = units.length;
    this.type = 'repair';
    this.walkable = false;
    this.x = x;
    this.y = y;
    this.player = player;
    this.color = color;
    this.angle = angle;
    this.canRepair = true;
    this.canCargo = true;
    this.canMode = true;
    this.modes = ['repair', 'transfer', 'scrap']
    this.activeModes = ['repair']
    this.canScrap = true

    this.currentSpecs = {
      shots: 0,
      ammo: 0,
      life: 20,
      speed: 7,
      cargo: 40
    };
    this.specs = {
      attack: 0,
      shots: 0,
      range: 0,
      ammo: 0,
      armor: 4,
      life: 20,
      radar: 3,
      speed: 7,
      cost: 15,
      cargo: 40,
      production: [
        { turns: 5, cost: 15, buildStep: 3 },
        { turns: 3, cost: 30, buildStep: 10 },
        { turns: 2, cost: 44, buildStep: 22 }
      ]
    }
  }
}



export class Supply extends CommonSpecs {
  constructor(units = 0, x = 0, y = 0, player = 0, color = '', angle = 0) {
    super();
    this.id = units.length;
    this.type = 'supply';
    this.walkable = false;
    this.x = x;
    this.y = y;
    this.player = player;
    this.color = color;
    this.angle = angle;
    this.canSupply = true;
    this.canCargo = true;
    this.canMode = true;
    this.modes = ['supply', 'transfer', 'scrap'];
    this.activeModes = ['supply'];
    this.canScrap = true;
    this.scrapping = false

    this.currentSpecs = {
      shots: 0,
      ammo: 0,
      life: 24,
      speed: 7,
      cargo: 50
    };
    this.specs = {
      attack: 0,
      shots: 0,
      range: 0,
      ammo: 0,
      armor: 4,
      life: 24,
      radar: 3,
      speed: 7,
      cost: 12,
      cargo: 50,
      production: [
        { turns: 4, cost: 12, buildStep: 3 },
        { turns: 2, cost: 24, buildStep: 12 },
        { turns: 1, cost: 36, buildStep: 36 }
      ]
    }
  }
}

export class Miner extends CommonSpecs {
  constructor(units = 0, x = 0, y = 0, player = 0, color = '', angle = 0) {
    super();
    this.id = units.length;
    this.type = 'miner';
    this.walkable = false;
    this.x = x;
    this.y = y;
    this.player = player;
    this.color = color;
    this.angle = angle;
    this.canSupply = true;
    this.canCargo = true;
    this.canMode = true;
    this.canExploit = true;
    this.exploiting = false
    this.modes = ['move', 'transfer', 'exploit'];
    this.activeModes = ['move'];
    this.canScrap = true;
    this.scrapping = false

    this.currentSpecs = {
      shots: 0,
      ammo: 0,
      life: 24,
      speed: 7,
      cargo: 0
    };
    this.specs = {
      attack: 0,
      shots: 0,
      range: 0,
      ammo: 0,
      armor: 4,
      life: 24,
      radar: 3,
      speed: 7,
      cost: 12,
      cargo: 50,
      production: [
        { turns: 4, cost: 12, buildStep: 3 },
        { turns: 2, cost: 24, buildStep: 12 },
        { turns: 1, cost: 36, buildStep: 36 }
      ]
    }
  }
}

export class Bulldozer extends CommonSpecs {
  constructor(units = 0, x = 0, y = 0, player = 0, color = '', angle = 0) {
    super();
    this.id = units.length;
    this.type = 'bulldozer';
    this.walkable = false;
    this.x = x;
    this.y = y;
    this.player = player;
    this.color = color;
    this.angle = angle;
    this.canSupply = true;
    this.canCargo = true;
    this.canMode = true;
    this.modes = ['move', 'transfer', 'scrap'];
    this.activeModes = ['move'];
    this.canScrap = true;

    this.currentSpecs = {
      shots: 0,
      ammo: 0,
      life: 24,
      speed: 7,
      cargo: 0
    };
    this.specs = {
      attack: 0,
      shots: 0,
      range: 0,
      ammo: 0,
      armor: 4,
      life: 24,
      radar: 3,
      speed: 7,
      cost: 12,
      cargo: 50,
      production: [
        { turns: 4, cost: 12, buildStep: 3 },
        { turns: 2, cost: 24, buildStep: 12 },
        { turns: 1, cost: 36, buildStep: 36 }
      ]
    }
  }
}

export class Qg extends CommonSpecs {
  constructor(units = 0, x = 0, y = 0, player = 0, color = '', angle = 0) {
    super();
    this.id = units.length;
    this.type = 'qg';
    this.walkable = false;
    this.x = x;
    this.y = y;
    this.player = player;
    this.color = color;
    this.angle = angle;
    this.canTranfert = true;
    this.canCargo = true;
    this.canMode = true;
    this.modes = ['move', 'transfer', 'produce']
    this.activeModes = ['move']
    this.canProduce = true
    this.producing = false
    this.currentProd = { status: 'stopped', unit: null, speed: 0, turnsRemain: 0, cost: 0 }
    //Status can be stopped, pending, building
    this.currentSpecs = {
      shots: 0,
      ammo: 0,
      life: 56,
      speed: 7,
      cargo: 60
    };
    this.specs = {
      attack: 0,
      shots: 0,
      range: 0,
      ammo: 0,
      armor: 8,
      life: 56,
      radar: 10,
      speed: 3,
      cost: 24,
      cargo: 120,
    }
  }
}



export class Wall extends CommonSpecs {
  constructor(units = 0, x = 0, y = 0, player = 0, color = '', angle = 0) {
    super();
    this.id = units.length;
    this.type = 'wall';
    this.walkable = false;
    this.x = x;
    this.y = y;
    this.player = 0;
    this.color = color;
    this.angle = 0;

    this.currentSpecs = {
      shots: 0,
      ammo: 0,
      life: 36,
      speed: 0
    };
    this.specs = {
      attack: 0,
      shots: 0,
      range: 0,
      ammo: 0,
      armor: 14,
      life: 36,
      radar: 0,
      speed: 0,
      cost: 10,
      production: [
        { turns: 3, cost: 9, buildStep: 3 },
        { turns: 2, cost: 18, buildStep: 9 },
        { turns: 1, cost: 27, buildStep: 27 }
      ]
    }
  }
}

const unitClasses = {
  scout: Scout,
  tank: Tank,
  gun: Gun,
  artillery: Artillery,
  supply: Supply,
  repair: Repair,
  bulldozer: Bulldozer,
  miner: Miner,
  radar: Radar,
}

export function createUnit(unitType, ...params) {
  const NewUnit = unitClasses[unitType];

  if (NewUnit) {
    return new NewUnit(...params);
  } else {
    console.error('Type d’unité inconnu');
    return null;
  }
}

export class Debris {
  constructor(debris, x, y, qty) {
    this.id = debris.length;
    this.x = x;
    this.y = y;
    this.qty = qty;
    this.walkable = true
  }
}

