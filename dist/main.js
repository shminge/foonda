/* Foonda Remake
- @ blob (dude)
- # wall
- E star (finish)
- * ball (blob hits -> takes spot and launches ball)
- ◢◣◤◥ or  wall/bounce (rotates clockwise after hit)
- / or \ bounce/bounce (also rotates clockwise)
- O hole (wall that can be filled by ball)
- = grate (turns into hole after traversal by blob or ball)
*/
import { v, directionStep, _RNG } from "./utils.js";
import { Wall, BlobChar, Ball, Grate, Hole, Slash, Triangle, Star } from "./classes.js";
import { calcMin, createPuzzle, createPuzzleBFS } from "./generator.js";
//import * as readline from 'readline';
export class Game {
    constructor() {
        this.grid = []; // grid coordinates are grid[x][y]
        this.blobPos = { x: -1, y: -1 };
        /*
    
        play(target: number): void {
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
    
            let playInstance = this.clone();
    
            const validDirections: Direction[] = ["up", "down", "left", "right"];
    
            const promptInput = (n: number) => {
                rl.question("[Move "+ n +"/"+ target+"]: ", (userInput: string) => {
                    const input = userInput.trim().toLowerCase();
    
                    if (input === 'quit') {
                        rl.close();
                        return;
                    } else if (input === 'reset') {
                        playInstance = this.clone();
                        playInstance.displayGrid();
                        promptInput(1);
                        return;
                    } else if (validDirections.includes(input as Direction)) {
                        const gen = playInstance.blobImpluse(input as Direction);
                        for (const _ of gen) {
                            playInstance.displayGrid();
                            console.log();
                        }
                        promptInput(n+1);
                        return;
                    } else {
                        console.log("Invalid input. Try again.");
                        promptInput(n);
                        return;
                    }
                });
            };
    
            playInstance.displayGrid();
            promptInput(1);
        }
            */
    }
    static newGame(gr, bPos) {
        let g = new Game();
        g.grid = gr;
        g.blobPos = bPos;
        g.grid[bPos.x][bPos.y].entity = new BlobChar();
        return g;
    }
    static emptyGrid(n, m = n) {
        let grid = [];
        for (let i = 0; i < n; i++) {
            grid.push([]);
            for (let j = 0; j < m; j++) {
                let newCell = {};
                if (i == 0 || i == n - 1 || j == 0 || j == m - 1) {
                    newCell.tile = new Wall;
                }
                grid[i].push(newCell);
            }
        }
        return grid;
    }
    placeBlob(p) {
        let placedCell = this.getCell(p);
        if (placedCell.entity) {
            throw new Error("Can't place Blob on an occupied space");
        }
        else {
            placedCell.entity = new BlobChar();
            this.blobPos = p;
        }
    }
    getCell(p) {
        return this.grid[p.x][p.y];
    }
    displayGrid() {
        var _a, _b, _c, _d;
        let initial = '  ';
        for (let x = 0; x < this.grid.length; x++) {
            initial += (x % 10);
        }
        console.log(initial);
        for (let y = 0; y < this.grid[0].length; y++) {
            let line = y + ' ';
            for (let x = 0; x < this.grid.length; x++) {
                let cCell = this.grid[x][y];
                line += (_d = (_b = (_a = cCell.entity) === null || _a === void 0 ? void 0 : _a.render()) !== null && _b !== void 0 ? _b : (_c = cCell.tile) === null || _c === void 0 ? void 0 : _c.render()) !== null && _d !== void 0 ? _d : '.';
            }
            console.log(line);
        }
    }
    serializeGrid() {
        var _a, _b, _c, _d;
        let lines = [];
        for (let y = 0; y < this.grid[0].length; y++) {
            let line = '';
            for (let x = 0; x < this.grid.length; x++) {
                const cCell = this.grid[x][y];
                line += (_d = (_b = (_a = cCell.entity) === null || _a === void 0 ? void 0 : _a.render()) !== null && _b !== void 0 ? _b : (_c = cCell.tile) === null || _c === void 0 ? void 0 : _c.render()) !== null && _d !== void 0 ? _d : '.';
            }
            lines.push(line);
        }
        return lines.join('\n');
    }
    clone() {
        const newGrid = this.grid.map(column => column.map(cell => {
            var _a, _b;
            return ({
                entity: (_a = cell.entity) === null || _a === void 0 ? void 0 : _a.clone(),
                tile: (_b = cell.tile) === null || _b === void 0 ? void 0 : _b.clone()
            });
        }));
        const newBlobPos = Object.assign({}, this.blobPos);
        return Game.newGame(newGrid, newBlobPos);
    }
    moveBlob(p) {
        let mrBlob = this.getCell(this.blobPos).entity;
        this.getCell(this.blobPos).entity = undefined;
        this.blobPos = p;
        this.getCell(this.blobPos).entity = mrBlob;
    }
    /**
     * Moves an entity from-to and returns to for convenience
     * @param from
     * @param to
     */
    moveGeneric(from, to) {
        let mover = this.getCell(from).entity;
        this.getCell(from).entity = undefined;
        this.getCell(to).entity = mover;
        return to;
    }
    /**
     * Push the blobChar in the specified direction, modifying the grid along the way.
     * @param dir the direction blob is being pushed
     */
    *blobImpluse(dir) {
        var _a;
        while (true) {
            let nextPos = directionStep(this.blobPos, dir);
            let nextCell = this.getCell(nextPos);
            //console.log("Moving "+ dir + " to " + JSON.stringify(nextPos) + " which is a " + JSON.stringify(nextCell));
            if (nextCell.tile || nextCell.entity) {
                if (nextCell.entity) {
                    let ball = nextCell.entity;
                    let pushed = yield* this.ballImpulse(ball, nextPos, dir);
                    if (pushed) {
                        this.moveBlob(nextPos);
                        yield;
                    }
                    return;
                }
                else {
                    if (!((_a = nextCell.tile) === null || _a === void 0 ? void 0 : _a.enterable(dir)))
                        return;
                    if (nextCell.tile instanceof Grate) {
                        this.moveBlob(nextPos);
                        nextCell.tile = new Hole();
                        yield;
                        continue;
                    }
                    if (nextCell.tile instanceof Star) {
                        this.moveBlob(nextPos);
                        yield;
                        return;
                    }
                    if (nextCell.tile instanceof Slash || nextCell.tile instanceof Triangle) {
                        let canExit = this.canExitBounce(nextPos, dir, false);
                        if (canExit) {
                            this.moveBlob(nextPos);
                            let extD = nextCell.tile.exitDir(dir);
                            nextCell.tile.rotate();
                            yield* this.blobImpluse(extD);
                            return;
                        }
                        else {
                            return;
                        }
                    }
                    if (nextCell.tile instanceof Hole) {
                        if (!nextCell.tile.filled) {
                            throw new Error("Somehow fell in a hole");
                        }
                        this.moveBlob(nextPos);
                        yield;
                    }
                }
            }
            else {
                this.moveBlob(nextPos);
                yield;
            }
        }
    }
    canExitBounce(v, dir, isBall) {
        let cell = this.getCell(v);
        let t = cell.tile;
        if (t) {
            if (t instanceof Slash || t instanceof Triangle) {
                let extDir = t.exitDir(dir);
                let moveSpot = directionStep(v, extDir);
                let moveTile = this.getCell(moveSpot);
                if (moveTile.entity) {
                    if (moveTile.entity instanceof BlobChar) {
                        return !isBall; // the blob can pass through itself (it is moving) but balls cannot
                    }
                    if (moveTile.entity instanceof Ball) {
                        if (isBall) {
                            return false;
                        }
                        else {
                            let testClone = this.clone();
                            let pushTest = testClone.ballImpulse(testClone.getCell(moveSpot).entity, moveSpot, extDir);
                            let p = pushTest.next();
                            if (p.done) {
                                return p.value;
                            }
                            else {
                                return true;
                            }
                        }
                    }
                }
                if (!moveTile.tile || moveTile.tile.enterable(extDir)) {
                    if (moveTile.tile instanceof Slash || moveTile.tile instanceof Triangle) {
                        //console.assert(!vEq(moveSpot,v))
                        return this.canExitBounce(moveSpot, extDir, isBall);
                    }
                }
                else {
                    return false;
                }
            }
        }
        return true;
    }
    /**
     * Yeeets ball in direction dir
     * @param ball
     * @param dir
     * @returns whether or not it succeeded
     */
    *ballImpulse(ball, ballPos, dir) {
        var _a;
        let moved = false;
        while (true) {
            let nextPos = directionStep(ballPos, dir);
            let nextCell = this.getCell(nextPos);
            //console.log("Moving ball "+ dir + " to " + JSON.stringify(nextPos) + " which is a " + JSON.stringify(nextCell));
            if (nextCell.tile || nextCell.entity) {
                if (nextCell.entity) {
                    return moved;
                }
                else {
                    if (!((_a = nextCell.tile) === null || _a === void 0 ? void 0 : _a.enterable(dir))) {
                        if (nextCell.tile instanceof Hole) {
                            if (!nextCell.tile.filled) {
                                nextCell.tile.filled = true;
                                this.getCell(v(ballPos.x, ballPos.y)).entity = undefined;
                                return true;
                            }
                        }
                        return moved;
                    }
                    if (nextCell.tile instanceof Grate) {
                        ballPos = this.moveGeneric(ballPos, nextPos);
                        nextCell.tile = new Hole();
                        moved = true;
                        yield;
                        continue;
                    }
                    if (nextCell.tile instanceof Hole) {
                        if (nextCell.tile.filled) {
                            ballPos = this.moveGeneric(ballPos, nextPos);
                            moved = true;
                            yield;
                            continue;
                        }
                        else {
                            nextCell.tile.filled = true;
                            this.getCell(v(ballPos.x, ballPos.y)).entity = undefined;
                            return true;
                        }
                    }
                    if (nextCell.tile instanceof Star) {
                        ballPos = this.moveGeneric(ballPos, nextPos);
                        moved = true;
                        yield;
                        continue;
                    }
                    if (nextCell.tile instanceof Slash || nextCell.tile instanceof Triangle) {
                        let canExit = this.canExitBounce(nextPos, dir, true);
                        if (canExit) {
                            ballPos = this.moveGeneric(ballPos, nextPos);
                            let extD = nextCell.tile.exitDir(dir);
                            nextCell.tile.rotate();
                            yield* this.ballImpulse(ball, ballPos, extD);
                            return true;
                        }
                        else {
                            return moved;
                        }
                    }
                }
            }
            else {
                ballPos = this.moveGeneric(ballPos, nextPos);
                moved = true;
                yield;
            }
        }
    }
}
/**
 * Abandon hope all ye who enter here
 */
export function setupGame(x, y, difficulty, seed) {
    let rng = new _RNG(seed);
    let iterCount = rng.choice([50, 100, 500, 1000, 5000, 10000, 50000, 100000]);
    console.log(iterCount);
    let nm = 0;
    let g;
    let bestnm = 0;
    let bestg;
    let a = 0;
    while (a < iterCount) {
        a++;
        g = createPuzzle(x, y, rng);
        nm = (calcMin(...g));
        if (nm > bestnm) {
            bestnm = nm;
            bestg = g;
        }
    }
    g = bestg;
    nm = bestnm;
    let ng = [Game.newGame(g[0], g[1]), nm];
    ng[0].grid[g[2].x][g[2].y].tile = new Star;
    return ng;
}
export function setupGameBFS(x, y, seed) {
    let rng = new _RNG(seed);
    let invalid = true;
    let grid;
    let startPos;
    let endPos;
    let depth;
    let g;
    while (invalid) {
        [grid, startPos, endPos, depth] = createPuzzleBFS(x, y, rng);
        g = Game.newGame(grid, startPos);
        if (g.grid[endPos.x][endPos.y].tile) {
            console.log('Botched setup. Restarting...');
            continue;
        }
        else {
            g.grid[endPos.x][endPos.y].tile = new Star;
            invalid = false;
        }
    }
    return [g, depth];
}
//console.log("Get to the % in "+ nm + " moves!")
//ng.grid[g![2].x][g![2].y].tile = new Star;
//ng.displayGrid();
//ng.play(nm);
/*= new Game()
g.grid = generateGrid(10, 10)[0];
g.displayGrid();


/*
g.placeBlob(v(3,2));
g.grid[2][1] = {tile: new Grate()};
g.grid[3][5] = {tile: new Triangle()};
g.grid[1][4] = {entity: new Ball()};
g.grid[1][2] = {tile: new Grate()};
g.displayGrid();

let actions: Direction[] = ["down", "right", "up", "right", "left", "left", "down"];

for (let a of actions) {
    console.log("Moving " + a);

    const gen = g.blobImpluse(a);
    for (let _ of gen) {
        g.displayGrid(); // display each step
        console.log();
    }
}
    */
