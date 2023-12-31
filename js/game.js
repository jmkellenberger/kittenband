function setupCanvas() {
    canvas = document.querySelector("canvas");
    ctx = canvas.getContext("2d");

    canvas.width = tileSize * (numTiles + uiWidth);
    canvas.height = tileSize * numTiles;
    canvas.style.width = canvas.width + 'px';
    canvas.style.height = canvas.height + 'px';

    ctx.imageSmoothingEnabled = false;
}

function drawSprite(sprite, x, y) {
    ctx.drawImage(
        spritesheet,
        sprite * 16,
        0,
        16,
        16,
        x * tileSize + shakeX,
        y * tileSize + shakeY,
        tileSize,
        tileSize
    )
}

function drawText(text, size, centered, textY, color) {
    ctx.fillStyle = color;
    ctx.font = size + "px monospace";
    let textX;
    if (centered) {
        textX = (canvas.width - ctx.measureText(text).width) / 2;
    } else {
        textX = canvas.width - uiWidth * tileSize + 25;
    }

    ctx.fillText(text, textX, textY);
}

function draw() {
    if (gameState == "running" || gameState == "dead") {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        screenshake();

        tiles.flat().forEach((t) => t.draw());

        monsters.forEach((m) => m.draw())

        player.draw();

        drawText("Level: " + level, 20, false, 40, "violet");
        drawText("Kittens Rescued: " + score, 20, false, 75, "violet");
        drawSpellList();

    }
}

function drawSpellList() {
    player.spells.forEach((spellName, i) => {
        let spellText = (i + 1) + ") " + (spellName);
        drawText(spellText, 20, false, 110 + i * 40, "aqua");
    });
}

function screenshake() {
    if (shakeAmount) {
        shakeAmount--;
    }
    let shakeAngle = Math.random() * Math.PI * 2;
    shakeX = Math.round(Math.cos(shakeAngle) * shakeAmount);
    shakey = Math.round(Math.sin(shakeAngle) * shakeAmount);
}


function tick() {
    for (let k = monsters.length - 1; k >= 0; k--) {
        if (!monsters[k].dead) {
            monsters[k].update();
        } else {
            monsters.splice(k, 1);
        }
    }

    if (player.dead) {
        addScore(score, false);
        gameState = "dead";
    }

    spawnCounter--;
    if (spawnCounter <= 0) {
        spawnMonster();
        spawnCounter = spawnRate;
        spawnRate--;

    }
}

function drawScores() {
    let scores = getScores();
    if (scores.length) {
        drawText(
            rightPad(["RUN", "SCORE", "TOTAL"]),
            18,
            true,
            canvas.height / 2,
            "white"
        );
        let newestScore = scores.pop();
        scores.sort(function (a, b) {
            return b.totalScore - a.totalScore;
        });
        scores.unshift(newestScore);

        for (let i = 0; i < Math.min(10, scores.length); i++) {
            let scoreText = rightPad([scores[i].run, scores[i].score, scores[i].totalScore]);
            drawText(
                scoreText,
                18,
                true,
                canvas.height / 2 + 24 + i * 24,
                i == 0 ? "aqua" : "violet"
            )
        }
    }
}


function showTitle() {
    ctx.fillStyle = 'rgba(0,0,0,.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    gameState = "title";

    drawText("SAVE THE KITTENS", 40, true, canvas.height / 2 - 110, "white");
    drawText("PRESS ANY KEY TO CONTINUE", 25, true, canvas.height / 2 - 50, "white");
    drawScores();
}


function startGame() {
    level = 1;
    score = 0;

    startLevel(startingHp, randomSpells(numSpells));
    gameState = "running";
}

function startLevel(playerHp, playerSpells) {
    spawnRate = 15;
    spawnCounter = spawnRate;
    generateLevel();
    player = new Player(randomPassableTile());
    player.hp = playerHp
    player.spells = playerSpells

    randomPassableTile().replace(Exit);
}

function getScores() {
    if (localStorage["scores"]) {
        return JSON.parse(localStorage["scores"]);
    } else {
        return [];
    }
}

function addScore(score, won) {
    let scores = getScores();
    let scoreObject = { score: score, run: 1, totalScore: score, active: won };
    let lastScore = scores.pop();
    if (lastScore) {
        if (lastScore.active) {
            scoreObject.run = lastScore.run + 1;
            scoreObject.totalScore += lastScore.totalScore;
        } else {
            scores.push(lastScore);
        }
    }
    scores.push(scoreObject);
    localStorage["scores"] = JSON.stringify(scores);
}

function initSounds() {
    sounds = {
        hit1: new Audio('sounds/hit1.wav'),
        hit2: new Audio('sounds/hit2.wav'),
        kittenRescued: new Audio('sounds/kitten_rescued.wav'),
        kittenSad: new Audio('sounds/kitten_sad.wav'),
        spell: new Audio('sounds/spell.wav'),
        teleport: new Audio('sounds/teleport.wav')
    }
}

function playSound(soundName) {
    sounds[soundName].currentTime = 0;
    sounds[soundName].play();
}
