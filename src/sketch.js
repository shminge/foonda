import { Game, setupGame } from "./main.js";

window.setup = setup;
window.draw = draw;
window.preload = preload;
window.keyPressed = keyPressed;


var canvasSize = 500;

var isMoving = false;

var spriteSheet;
var sprites = {};
var resetPoint;


var game;
var minMoves;
var numMoves = 0;

var spriteScale;
var xAnchor;
var yAnchor;

var xsize = 10;
var ysize = 10;

function preload() {
    spriteSheet = loadImage("foondatiles.png");
}

function loadGame() {
    return setupGame(xsize, ysize, 5);
}


function setup() {
  createCanvas(canvasSize, canvasSize);
  noSmooth();

  const spriteNames = ["bg1","bg2","wall","blob","star","slash", "backslash", "dl", "dr", "ur", "ul", "ball", "hole", "grate", "filled"];

  for (let i = 0; i < spriteNames.length; i++) {
    const y = i*32;
    const sprite = spriteSheet.get(0,y,32,32);
    sprites[spriteNames[i]] = sprite;
  }

  [game, minMoves] = loadGame();
  resetPoint = game.clone();
  
  let longer = max(xsize, ysize);
  spriteScale = canvasSize/longer;
  xAnchor = canvasSize/2 - (spriteScale*xsize/2);
  yAnchor = canvasSize/2 - (spriteScale*ysize/2);

  noLoop();
}


function place(sprname, x, y) {
    image(sprites[sprname], xAnchor + x*spriteScale, yAnchor + y*spriteScale, spriteScale, spriteScale);
}


function drawChecker() {
    for (let x = 0; x < xsize; x++) {
        for (let y = 0; y < ysize; y++) {
            let bg = (x+y) % 2 == 0 ? 'bg1' : 'bg2';
            place(bg,x,y);
        }
    }
}

function drawGame() {
    for (let x = 0; x < xsize; x++) {
        for (let y = 0; y < ysize; y++) {
            let c = game.getCell({x,y});

            if (c.tile) {
                switch (c.tile.kind){
                    case 'Wall': place('wall',x,y); break;
                    case 'Star': place('star',x,y); break;
                    case 'Grate': place('grate',x,y); break;
                    case 'Hole':
                        if (c.tile.filled) {
                            place('filled', x, y);
                        } else {
                            place('hole', x, y);
                        }; break;
                    case 'Slash':
                        if (c.tile.facingUp) {
                            place('slash', x, y);
                        } else {
                            place('backslash', x, y);
                        }; break;
                    case 'Triangle': {
                        if (c.tile.facing == 'up') {
                            place('ul',x,y);
                        } else if (c.tile.facing == 'down') {
                            place('dr', x, y);
                        } else if (c.tile.facing == 'left') {
                            place('dl', x, y);
                        } else {
                            place('ur', x, y);
                        } break;
                        }
                    }
                }

            if (c.entity) {
                if (c.entity.kind == 'Blob') {
                    place('blob',x,y);
                } else {
                    place('ball', x, y);
                }
            }
            
            }
        }
    }




function draw() {
  drawChecker();
  drawGame();
  noLoop();
}



function keyPressed() {
    if (key === 'r') {
        game = resetPoint.clone();
        draw();
        return
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
    } else {
        isMoving = false;
    }
}