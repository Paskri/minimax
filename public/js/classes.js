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

class Commons {
    constructor() {
        this.walkable = false;
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
        this.onFire = 0;
        this.onAutoFire = 0;
        this.agrId = null;
        this.agrIds = [];
        this.rangedCells = []
    }
}

class Tank extends Commons {
    constructor(units, x, y, player, color, angle) {
        this.id = units.length;
        this.type = 'tank';
        this.x = x;
        this.y = y;
        this.player = player;
        this.color = color;
        this.angle = angle;
        this.canRepair = false;
        this.canSupply = false;

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
            cost: 12
        }
    }
}

class Scout extends Commons {
    constructor(units, x, y, player, color, angle) {
        this.id = units.length;
        this.type = 'scout';
        this.x = x;
        this.y = y;
        this.player = player;
        this.color = color;
        this.angle = angle;
        this.canRepair = false;
        this.canSupply = false;

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
            cost: 9
        }
    }
}

class Gun extends Commons {
    constructor(units, x, y, player, color, angle) {
        this.id = units.length;
        this.type = 'gun';
        this.x = x;
        this.y = y;
        this.player = player;
        this.color = color;
        this.angle = angle;
        this.canRepair = false;
        this.canSupply = false;

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
            cost: 24
        }
    }
}

class Radar extends Commons {
    constructor(units, x, y, player, color, angle) {
        this.id = units.length;
        this.type = 'radar';
        this.x = x;
        this.y = y;
        this.player = player;
        this.color = color;
        this.angle = angle;
        this.canRepair = false;
        this.canSupply = false;

        this.currentSpecs = {
            shots: 2,
            ammo: 14,
            life: 24,
            speed: 12
        };
        this.specs = {
            attack: 18,
            shots: 2,
            range: 6,
            ammo: 14,
            armor: 4,
            life: 24,
            radar: 5,
            speed: 12,
            cost: 24
        };
    }
}

class Repair extends Commons {
    constructor(units, x, y, player, color, angle) {
        this.id = units.length;
        this.type = 'repair';
        this.x = x;
        this.y = y;
        this.player = player;
        this.color = color;
        this.angle = angle;
        this.canRepair = true;
        this.canSupply = false;

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
            cargo: 40
        };
    }
}

class Supply extends Commons {
    constructor(units, x, y, player, color, angle) {
        this.id = units.length;
        this.type = 'supply';
        this.x = x;
        this.y = y;
        this.player = player;
        this.color = color;
        this.angle = angle;
        this.canRepair = false;
        this.canSupply = true;

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
            cargo: 50
        }
    }
}

class Qg extends Commons {
    constructor(units, x, y, player, color, angle) {
        this.id = units.length;
        this.type = 'qg';
        this.x = x;
        this.y = y;
        this.player = player;
        this.color = color;
        this.angle = angle;

        this.currentSpecs = {
            shots: 0,
            ammo: 0,
            life: 56,
            speed: 7
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
            cost: 24
        }
    }
}

class Artillery extends Commons {
    constructor(units, x, y, player, color, angle) {
        this.id = units.length;
        this.type = 'artillery';
        this.x = x;
        this.y = y;
        this.player = player;
        this.color = color;
        this.angle = angle;
        this.canRepair = false;
        this.canSupply = false;

        this.currentSpecs = {
            shots: 1,
            ammo: 6,
            life: 24,
            speed: 6
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
            cost: 36
        }
    }
}

class Debris {
    constructor(debris, x, y, qty) {
        this.id = debris.length;
        this.x = x;
        this.y = y;
        this.qty = qty;
        this.walkable = true
    }
}

