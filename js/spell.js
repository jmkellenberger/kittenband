spells = {
    BLINK: function () { player.move(randomTreasureTile()); },
    SHUFFLE: function () {
        monsters.forEach((m) => {
            m.move(randomPassableTile());
            m.teleportCounter = 2;
        }
        )
    },
    DASH: function () {
        let { x: facingX, y: facingY } = player.facing
        let passable = true
        let current_tile = player.tile();
        let furthest_tile = player.tile();
        let checked_tiles = [player.tile()];
        while (passable) {
            current_tile = current_tile.getNeighbor(facingX, facingY);
            if (current_tile.passable) {
                checked_tiles.push(current_tile);
                furthest_tile = current_tile;
            } else {
                passable = false
            }
        }
        shakeAmount = 20;
        player.move(furthest_tile)

        let targets = monsters.filter((m) => checked_tiles.includes(m.tile()));

        targets.forEach((t) => {
            let neighbors = [t.tile().getNeighbor(facingY, facingX), t.tile().getNeighbor(-facingY, -facingX)].filter((t) => t.passable);
            if (neighbors.length) {
                let new_tile = shuffle(neighbors)[0];
                if (new_tile.monster && !new_tile.monster.isPlayer) {
                    t.hit(2)
                    t.stunned = true
                    new_tile.monster.hit(2)
                    new_tile.monster.stunned = true
                } else {
                    t.move(new_tile)
                }
            } else {
                t.stunned = true
            }
            t.hit(2);
        }
        )
    }
}


function randomSpells(n) { return shuffle(Object.keys(spells)).splice(0, n) }
