import { exhaust, v, vEq } from "./utils.js";
import { Game } from "./main.js";
import { Ball, Grate, Hole, Slash, Triangle, Wall } from "./classes.js";
/**
 * Deep clones the grid (Cell[][]), cloning tiles and entities as well
 */
function cloneGrid(grid) {
    return grid.map(column => column.map(cell => ({
        entity: cell.entity ? cell.entity.clone() : undefined,
        tile: cell.tile ? cell.tile.clone() : undefined
    })));
}
/**
 * Returns list of empty spaces (no tile, no entity)
 */
function emptySpaces(g) {
    let empty = [];
    for (let x = 0; x < g.length; x++) {
        for (let y = 0; y < g[0].length; y++) {
            if (g[x][y].tile || g[x][y].entity) {
                continue;
            }
            empty.push(v(x, y));
        }
    }
    return empty;
}
/**
 * Returns coords of tile-less cells
 * @param g
 */
function emptyTiles(g) {
    let empty = [];
    for (let x = 0; x < g.length; x++) {
        for (let y = 0; y < g[0].length; y++) {
            if (g[x][y].tile) {
                continue;
            }
            empty.push(v(x, y));
        }
    }
    return empty;
}
export function generateGrid(n, m, rng, options = [1, 1, 1, 1, 1, 1], minDensity = 0.05, maxDensity = 0.2) {
    let g = Game.emptyGrid(n, m);
    let elemCount = rng.rand(minDensity, maxDensity) * (n - 1) * (m - 1);
    let empty = emptySpaces(g);
    empty = rng.shuffleArray(empty);
    let tileChoices = [];
    options.forEach((val, idx) => {
        if (val === 1)
            tileChoices.push(idx);
    });
    for (let i = 0; i < elemCount; i++) {
        let spot = empty.pop();
        if (spot) {
            let cell = {};
            let q = rng.choice(tileChoices);
            switch (q) {
                case 0:
                    cell.tile = new Wall();
                    break;
                case 1:
                    cell.entity = new Ball();
                    break;
                case 2:
                    let t = new Triangle();
                    let c = rng.choice([0, 1, 2, 3]);
                    for (let cc = 0; cc < c; cc++) {
                        t.rotate();
                    }
                    cell.tile = t;
                    break;
                case 3:
                    let s = new Slash();
                    let cs = rng.choice([0, 1]);
                    for (let cc = 0; cc < cs; cc++) {
                        s.rotate();
                    }
                    cell.tile = s;
                    break;
                case 4:
                    cell.tile = new Hole();
                    break;
                case 5:
                    cell.tile = new Grate();
                    break;
            }
            g[spot.x][spot.y] = cell;
        }
    }
    let startPos = empty === null || empty === void 0 ? void 0 : empty.pop();
    if (startPos) {
        return [g, startPos];
    }
    else {
        throw new Error("No valid place to start");
    }
}
export function createPuzzle(n, m, rng) {
    let [grid, startPos] = generateGrid(n, m, rng);
    // Clone grid before creating game to avoid mutating original
    let g = Game.newGame(cloneGrid(grid), startPos);
    //g.displayGrid()
    let numMoves = rng.rand(5, 20, true);
    let moves = [];
    for (let i = 0; i < numMoves; i++) {
        let dir = rng.choice(["up", "down", "left", "right"]);
        const gen = g.blobImpulse(dir);
        exhaust(gen);
        moves.push(dir);
    }
    // finally
    let possEnds = [g.blobPos];
    let dir = rng.choice(["up", "down", "left", "right"]);
    moves.push(dir);
    const gen = g.blobImpulse(dir);
    for (const _ of gen) {
        possEnds.push(g.blobPos);
    }
    let chosenEnd = rng.choice(possEnds);
    return [grid, startPos, chosenEnd];
}
export function calcMin(grid, startPos, endPos) {
    if (vEq(startPos, endPos))
        return 0;
    const directions = ["up", "down", "left", "right"];
    let stack = [];
    let seen = new Set();
    // Clone grid before creating the first game instance
    stack.push([Game.newGame(cloneGrid(grid), startPos), 0]);
    while (stack.length > 0) {
        let [position, numMoves] = stack.pop();
        for (let dir of directions) {
            let gclone = position.clone();
            const gen = gclone.blobImpulse(dir);
            //exhaust(gen);
            for (const _ of gen) {
                if (vEq(gclone.blobPos, endPos))
                    return numMoves + 1; // +1 because we're basing it off the previous
            }
            let sg = gclone.serializeGrid();
            if (!seen.has(sg)) {
                seen.add(sg);
            }
            else {
                continue; // visited previously
            }
            if (vEq(gclone.blobPos, endPos)) {
                return numMoves + 1;
            }
            else {
                stack.unshift([gclone, numMoves + 1]);
            }
        }
    }
    console.log("Can't find a way on grid:");
    Game.displayGrid(grid);
    throw new Error("Unreachable end position");
}
export function createPuzzleBFS(n, m, rng, options = [1, 1, 1, 1, 1, 1]) {
    var _a;
    let [grid, startPos] = generateGrid(n, m, rng, options);
    let possTargets = emptyTiles(grid);
    const directions = ["up", "down", "left", "right"];
    let stack = [];
    let seen = new Map();
    let posMap = new Map();
    stack.push({ game: Game.newGame(cloneGrid(grid), startPos), depth: 0, instructions: '' });
    let maxDepth = 0;
    while (stack.length > 0) {
        if (possTargets.every(pos => posMap.has(JSON.stringify(pos)))) {
            console.log("Visited every square, breaking early");
            break;
        }
        let stackInstance = stack.shift();
        let stackGame = stackInstance.game;
        let stackDepth = stackInstance.depth;
        let stackInstructions = stackInstance.instructions;
        for (let dir of directions) {
            let gclone = stackGame.clone();
            let gen = gclone.blobImpulse(dir);
            let _d = dir[0].toUpperCase();
            //exhaust(gen);
            // we need to track all the visited positions, including while moving
            let moved_past = [gclone.blobPos];
            for (const _ of gen) {
                moved_past.push(gclone.blobPos);
            }
            let sg = gclone.serializeGrid();
            if (!seen.has(sg)) {
                //console.log("Already seen")
                seen.set(sg, stackDepth + 1);
                stack.push({
                    game: gclone,
                    depth: stackDepth + 1,
                    instructions: stackInstructions + _d
                });
            }
            for (let pos of moved_past) {
                let moveData = posMap.get(JSON.stringify(pos));
                if (moveData) {
                    if (stackDepth + 1 < moveData[0]) {
                        posMap.set(JSON.stringify(pos), [stackDepth + 1, stackInstructions + _d]);
                    }
                }
                else {
                    posMap.set(JSON.stringify(pos), [stackDepth + 1, stackInstructions + _d]);
                    if (stackDepth + 1 > maxDepth) {
                        maxDepth = stackDepth + 1;
                    }
                }
            }
        }
    }
    if (maxDepth <= 4) { //enforce at least 5 moves
        console.log("Failed, to hit 5 moves, resetting");
        return createPuzzleBFS(n, m, rng); // fallback
    }
    let exitPos;
    while (!exitPos) {
        for (const [pos, data] of posMap) {
            if (data[0] >= maxDepth) {
                let potential = JSON.parse(pos);
                if (grid[potential.x][potential.y].tile) {
                    console.log(`Potential end at ${JSON.stringify(potential)} has ${grid[potential.x][potential.y].tile.kind} blocking`);
                    posMap.delete(pos);
                    continue;
                }
                console.log("Solution: " + ((_a = data[1].match(/.{1,5}/g)) === null || _a === void 0 ? void 0 : _a.join(' ')));
                exitPos = potential;
                break;
            }
        }
        if (exitPos) {
            break;
        }
        maxDepth -= 1;
        console.log("Lowering threshold to " + maxDepth);
        if (maxDepth <= 4) { //enforce at least 5 moves
            console.log("Failed, resetting");
            return createPuzzleBFS(n, m, rng); // fallback
        }
    }
    return [grid, startPos, exitPos, maxDepth];
}
