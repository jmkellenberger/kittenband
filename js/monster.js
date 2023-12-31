class Monster {
    constructor(tile, sprite, hp) {
        this.move(tile);
        this.sprite = sprite;
        this.hp = hp;
        this.teleportCounter = 2;

        this.facing = { x: -1, y: 0 }

        this.x;
        this.y;

        this.offsetX = 0;
        this.offsetY = 0;
    }

    tile() {
        return getTile(this.x, this.y);
    }

    update() {
        this.teleportCounter--;
        if (this.stunned || this.teleportCounter > 0) {
            this.stunned = false;
            return;
        }
        this.doStuff();
    }

    doStuff() {
        let neighbors = this.tile().getAdjacentPassableNeighbors();
        neighbors = neighbors.filter(t => !t.monster || t.monster.isPlayer);
        if (neighbors.length) {
            neighbors.sort((a, b) => a.dist(player.tile) - b.dist(player.tile));
            let newTile = neighbors[0];
            this.tryMove(newTile.x - this.tile().x, newTile.y - this.tile().y);
        }
    }

    getDisplayX() {
        return this.tile().x + this.offsetX;
    }

    getDisplayY() {
        return this.tile().y + this.offsetY;
    }

    draw() {
        if (this.teleportCounter > 0) {
            drawSprite(10, this.getDisplayX(), this.getDisplayY());
        } else {
            drawSprite(this.sprite, this.getDisplayX(), this.getDisplayY());
            this.drawHp();
        }


        this.offsetX -= Math.sign(this.offsetX) * (1 / 8);
        this.offsetY -= Math.sign(this.offsetY) * (1 / 8);
    }

    drawHp() {
        for (let i = 0; i < this.hp; i++) {
            drawSprite(
                9,
                this.getDisplayX() + (i % 3) * (5 / 16),
                this.getDisplayY() - Math.floor(i / 3) * (5 / 16)
            );
        }
    }

    tryMove(dx, dy) {
        this.facing = { x: dx, y: dy }
        let newTile = this.tile().getNeighbor(dx, dy);
        if (newTile.passable) {
            if (!newTile.monster) {
                this.move(newTile);
            } else {
                if (this.isPlayer != newTile.monster.isPlayer) {
                    this.attackedThisTurn = true;
                    newTile.monster.stunned = true;
                    newTile.monster.hit(1);

                    shakeAmount = 5;

                    this.offsetX = (newTile.x - this.tile().x) / 2;
                    this.offsetY = (newTile.y - this.tile().y) / 2;
                }
            }
            return true;
        }
    }

    addSpell() {
        let newSpell = shuffle(Object.keys(spells))[0];
        this.spells.push(newSpell);
    }

    castSpell(index) {
        let spellName = this.spells[index];
        if (spellName) {
            this.spells.splice(index, 1);
            spells[spellName]();
            playSound("spell");
            tick();
        }
    }

    heal(damage) {
        this.hp = Math.min(maxHp, this.hp + damage)
    }

    hit(damage) {
        this.hp -= damage;
        if (this.hp <= 0) {
            this.die();
        }

        if (this.isPlayer) {
            playSound('hit1');
        } else {
            playSound('hit2');
        }
    }

    die() {
        this.dead = true;
        this.tile().monster = null;
        this.sprite = 1;
    }

    move(tile) {
        if (this.tile()) {
            this.tile().monster = null;

            this.offsetX = this.tile().x - tile.x;
            this.offsetY = this.tile().y - tile.y;
        }
        this.x = tile.x;
        this.y = tile.y;
        tile.monster = this;

        tile.stepOn(this);
    }
}

class Player extends Monster {
    constructor(tile) {
        super(tile, 0, 3);
        this.isPlayer = true;
        this.teleportCounter = 0;

        this.spells = [];
    }

    tryMove(dx, dy) {
        if (super.tryMove(dx, dy)) { tick(); }
    }
}

class Snek extends Monster {
    constructor(tile) {
        super(tile, 4, 2);
    }

    doStuff() {
        this.attackedThisTurn = false;
        super.doStuff();
        if (!this.attackedThisTurn) {
            super.doStuff()
        }
    }
}

class Jelly extends Monster {
    constructor(tile) {
        super(tile, 5, 3);
    }

    update() {
        let startedStunned = this.stunned;
        super.update();
        if (!startedStunned) {
            this.stunned = true;
        }
    }
}

class Fly extends Monster {
    constructor(tile) {
        super(tile, 6, 1);
    }

    doStuff() {
        let neighbors = this.tile().getAdjacentPassableNeighbors();
        if (neighbors.length) {
            let newTile = neighbors[0];
            this.tryMove(newTile.x - this.tile().x, newTile.y - this.tile().y);
        }
    }
}

class Shroom extends Monster {
    constructor(tile) {
        super(tile, 7, 2);
    }
}

class Tenty extends Monster {
    constructor(tile) {
        super(tile, 8, 2);
    }

    doStuff() {
        let neighbors = this.tile().getAdjacentNeighbors().filter((t) => !t.passable && inBounds(t.x, t.y));
        if (neighbors.length) {
            neighbors[0].replace(Floor);
            this.heal(1)
        } else {
            super.doStuff();
        }
    }
}
