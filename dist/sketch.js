import { setupGameBFS } from "./main.js";
window.setup = setup;
window.draw = draw;
window.preload = preload;
window.keyPressed = keyPressed;
var canvasSize = 500;
var isMoving = false;
var spriteSheet;
var sprites = {};
var game;
var minMoves;
var numMoves = 0;
var spriteScale;
var xAnchor;
var yAnchor;
var xsize = 10;
var ysize = 10;
var currentSeed = "";
var undoStack = [];
// Get today's date in dd/mm/yyyy format
function getTodaysDate() {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
}
// Expose variables to global scope for HTML access
window.gameState = {
    get numMoves() { return numMoves; },
    get minMoves() { return minMoves; },
    get currentSeed() { return currentSeed; }
};
function updateHTML() {
    // Update the HTML elements with current values
    const movesElement = document.getElementById('moves');
    const targetElement = document.getElementById('target');
    const seedElement = document.getElementById('seed-display');
    if (movesElement)
        movesElement.textContent = numMoves;
    if (targetElement)
        targetElement.textContent = minMoves;
    if (seedElement)
        seedElement.textContent = currentSeed;
}
function setupSeedControls() {
    const seedButton = document.getElementById('seed-button');
    const seedInput = document.getElementById('seed-input');
    if (seedButton && seedInput) {
        seedButton.addEventListener('click', () => {
            const newSeed = seedInput.value.trim() || getTodaysDate();
            game = undefined;
            draw();
            loadNewGame(newSeed);
            seedInput.value = ''; // Clear the input
        });
        // Allow Enter key to trigger new game
        seedInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                seedInput.blur();
                seedButton.click();
            }
        });
    }
}
function loadNewGame(seed = null) {
    console.log("Loading new game");
    currentSeed = seed || getTodaysDate();
    [game, minMoves] = setupGameBFS(xsize, ysize, currentSeed);
    undoStack = [];
    undoStack.push(game.clone());
    numMoves = 0;
    updateHTML();
    draw();
}
function preload() {
    spriteSheet = loadImage("foondatiles.png");
}
function setup() {
    // Create canvas in the container div
    const canvas = createCanvas(canvasSize, canvasSize);
    canvas.parent('canvas-container');
    noSmooth();
    const spriteNames = ["bg1", "bg2", "wall", "blob", "star", "slash", "backslash", "dl", "dr", "ur", "ul", "ball", "hole", "grate", "filled"];
    for (let i = 0; i < spriteNames.length; i++) {
        const y = i * 32;
        const sprite = spriteSheet.get(0, y, 32, 32);
        sprites[spriteNames[i]] = sprite;
    }
    const params = getURLParams();
    // Load game with URL seed if it exists, otherwise use default
    if (params.seed) {
        const urlSeed = params.seed;
        loadNewGame(urlSeed);
    }
    else {
        // Initialize with today's date as default seed
        loadNewGame();
    }
    let longer = max(xsize, ysize);
    spriteScale = canvasSize / longer;
    xAnchor = canvasSize / 2 - (spriteScale * xsize / 2);
    yAnchor = canvasSize / 2 - (spriteScale * ysize / 2);
    // Setup seed controls after DOM is ready
    setupSeedControls();
    noLoop();
}
function place(sprname, x, y) {
    image(sprites[sprname], xAnchor + x * spriteScale, yAnchor + y * spriteScale, spriteScale, spriteScale);
}
function drawChecker() {
    for (let x = 0; x < xsize; x++) {
        for (let y = 0; y < ysize; y++) {
            let bg = (x + y) % 2 == 0 ? 'bg1' : 'bg2';
            place(bg, x, y);
        }
    }
}
function drawGame() {
    for (let x = 0; x < xsize; x++) {
        for (let y = 0; y < ysize; y++) {
            let c = game.getCell({ x, y });
            if (c.tile) {
                switch (c.tile.kind) {
                    case 'Wall':
                        place('wall', x, y);
                        break;
                    case 'Star':
                        place('star', x, y);
                        break;
                    case 'Grate':
                        place('grate', x, y);
                        break;
                    case 'Hole':
                        if (c.tile.filled) {
                            place('filled', x, y);
                        }
                        else {
                            place('hole', x, y);
                        }
                        ;
                        break;
                    case 'Slash':
                        if (c.tile.facingUp) {
                            place('slash', x, y);
                        }
                        else {
                            place('backslash', x, y);
                        }
                        ;
                        break;
                    case 'Triangle': {
                        if (c.tile.facing == 'up') {
                            place('ul', x, y);
                        }
                        else if (c.tile.facing == 'down') {
                            place('dr', x, y);
                        }
                        else if (c.tile.facing == 'left') {
                            place('dl', x, y);
                        }
                        else {
                            place('ur', x, y);
                        }
                        break;
                    }
                }
            }
            if (c.entity) {
                if (c.entity.kind == 'Blob') {
                    place('blob', x, y);
                }
                else {
                    place('ball', x, y);
                }
            }
        }
    }
}
function draw() {
    if (game) {
        drawChecker();
        drawGame();
    }
    else {
        background(255);
    }
    noLoop();
}
function keyPressed() {
    if (key === 'r') {
        game = undoStack[0].clone();
        numMoves = 0; // Reset move counter
        updateHTML(); // Update HTML display
        draw();
        return;
    }
    if (key === 'z') {
        if (undoStack.length > 1) {
            undoStack.pop();
            game = undoStack[undoStack.length - 1].clone();
            numMoves -= 1;
            updateHTML();
            draw();
            return;
        }
    }
    let gen;
    if (keyCode === UP_ARROW) {
        gen = game.blobImpluse('up');
    }
    else if (keyCode === DOWN_ARROW) {
        gen = game.blobImpluse('down');
    }
    else if (keyCode === LEFT_ARROW) {
        gen = game.blobImpluse('left');
    }
    else if (keyCode === RIGHT_ARROW) {
        gen = game.blobImpluse('right');
    }
    if (gen && !isMoving) {
        numMoves += 1;
        updateHTML(); // Update HTML when moves change
        isMoving = true;
        animateMovement(gen);
    }
}
function animateMovement(generator) {
    const result = generator.next();
    if (!result.done) {
        drawChecker();
        drawGame();
        // Add delay before next frame (300ms = 0.3 seconds)
        setTimeout(() => animateMovement(generator), 1);
    }
    else {
        isMoving = false;
        undoStack.push(game.clone());
    }
}
