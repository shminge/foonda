import { _RNG, Direction, exhaust, v, Vec2, vEq } from "./utils.js";
import { Game } from "./main.js";
import { Ball, BlobChar, Cell, Grate, Hole, Slash, Triangle, Wall } from "./classes.js";

type PuzzleStack = [Game, number][]

/**
 * Deep clones the grid (Cell[][]), cloning tiles and entities as well
 */
function cloneGrid(grid: Cell[][]): Cell[][] {
    return grid.map(column =>
        column.map(cell => ({
            entity: cell.entity ? cell.entity.clone() : undefined,
            tile: cell.tile ? cell.tile.clone() : undefined
        }))
    );
}

/**
 * Returns list of empty spaces (no tile, no entity)
 */
function emptySpaces(g: Cell[][]): Vec2[] {
    let empty: Vec2[] = [];
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
function emptyTiles(g: Cell[][]): Vec2[] {
    let empty: Vec2[] = [];
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

export function generateGrid(n: number, m: number, rng: _RNG, minDensity: number = 0.05, maxDensity: number = 0.2): [Cell[][], Vec2] {
    let g = Game.emptyGrid(n, m);
    let elemCount = rng.rand(minDensity, maxDensity) * (n - 1) * (m - 1);
    let empty = emptySpaces(g);
    empty = rng.shuffleArray(empty);
    for (let i = 0; i < elemCount; i++) {
        let spot = empty.pop();
        if (spot) {
            let cell: Cell = {};
            let q = rng.choice([0, 1, 2, 3, 4, 5])
            switch (q) {
                case 0:
                    cell.tile = new Wall();
                    break;
                case 1:
                    cell.entity = new Ball();
                    break;
                case 2:
                    let t = new Triangle();
                    let c = rng.choice([0, 1, 2, 3])
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

    let startPos = empty?.pop();
    if (startPos) {
        return [g, startPos];
    } else {
        throw new Error("No valid place to start");
    }
}

export function createPuzzle(n: number, m: number, rng: _RNG): [Cell[][], Vec2, Vec2] {


    let [grid, startPos] = generateGrid(n, m, rng);
    // Clone grid before creating game to avoid mutating original
    let g = Game.newGame(cloneGrid(grid), startPos);
    //g.displayGrid()
    let numMoves = rng.rand(5, 20, true);

    let moves: Direction[] = [];
    for (let i = 0; i < numMoves; i++) {
        let dir: Direction = rng.choice(["up", "down", "left", "right"]);

        const gen = g.blobImpluse(dir);
        
        exhaust(gen);

        moves.push(dir);
    }
    // finally
    let possEnds: Vec2[] = [g.blobPos];

    let dir: Direction = rng.choice(["up", "down", "left", "right"]);
    moves.push(dir);

    const gen = g.blobImpluse(dir);
    
    for (const _ of gen) {
        possEnds.push(g.blobPos);
    }

    let chosenEnd = rng.choice(possEnds);
    


    return [grid, startPos, chosenEnd]; 
}

export function calcMin(grid: Cell[][], startPos: Vec2, endPos: Vec2): number {

    if (vEq(startPos, endPos)) return 0;

    const directions = ["up", "down", "left", "right"] as const;
    let stack: PuzzleStack = [];
    let seen: Set<string> = new Set();

    // Clone grid before creating the first game instance
    stack.push([Game.newGame(cloneGrid(grid), startPos), 0]);

    while (stack.length > 0) {
        let [position, numMoves] = stack.pop()!;

        for (let dir of directions) {

            let gclone = position.clone();
            const gen = gclone.blobImpluse(dir);

            //exhaust(gen);

            for (const _ of gen) {
                if (vEq(gclone.blobPos, endPos)) return numMoves + 1; // +1 because we're basing it off the previous
            }

            let sg = gclone.serializeGrid();

            if (!seen.has(sg)) {
                seen.add(sg)
            } else {
                continue; // visited previously
            }

            if (vEq(gclone.blobPos, endPos)){ 
                return numMoves + 1
            } else { 
                stack.unshift([gclone, numMoves + 1])
            }
            
        }
    }
    console.log("Can't find a way on grid:")
    Game.newGame(cloneGrid(grid), startPos).displayGrid();
    throw new Error("Unreachable end position");
}

/**
 * Given a grid and a blob position, we check if (moving backwards) there is a valid ball move. This requires:
 * a) the opposite direction to be clear for a move
 * b) the ball to be at a natural stopping point
 * c) clear path between blob and ball (including things)
 * @param g 
 * @param bPos 
 * @returns [up,down,left,right]
 */
/*
function hasBallMove(g: Cell[][], bPos: Vec2): [boolean, boolean, boolean, boolean] {
    return [false,false,false,false];
}
*/

/**
 * Steps backwards and contributes to the puzzlestack
 * @param g grid
 * @param bPos Current grid position
 * @returns 
 */
/*
export function backstep(g: Cell[][], bPos: Vec2): PuzzleStack[] {
    return [[g, bPos]];
}
*/


/**
 * 
 * @param n 
 * @param m 
 * @param rng 
 * @returns grid, startpos, endpos, numMoves
 */

type BFSEntry = {game: Game, depth: number, instructions: string}


export function createPuzzleBFS(n: number, m: number, rng: _RNG): [Cell[][], Vec2, Vec2, number] {
    let [grid, startPos] = generateGrid(n, m, rng); 

    let possTargets = emptyTiles(grid);

    const directions = ["up", "down", "left", "right"] as const;
    let stack: BFSEntry[] = [];
    let seen: Map<string, number> = new Map();
    let posMap: Map<string, [number, string]> = new Map();

    stack.push({game: Game.newGame(cloneGrid(grid), startPos), depth: 0, instructions: ''});

    let maxDepth = 0;

    while (stack.length > 0) {
        
        if (possTargets.every(pos => posMap.has(JSON.stringify(pos)))) {
            console.log("Visited every square, breaking early")
            break
        }

        let stackInstance = stack.shift();
        let stackGame = stackInstance!.game;
        let stackDepth = stackInstance!.depth;
        let stackInstructions = stackInstance!.instructions;

        for (let dir of directions) {
            let gclone = stackGame!.clone();
            let gen = gclone.blobImpluse(dir);
            let _d = dir[0].toUpperCase();

            //exhaust(gen);

            // we need to track all the visited positions, including while moving
            let moved_past: Vec2[] = [gclone.blobPos];

            for (const _ of gen) {
                moved_past.push(gclone.blobPos)
            }

            let sg = gclone.serializeGrid();

            if (seen.has(sg)) {
                //console.log("Already seen")
                continue;
            } else {

                seen.set(sg, stackDepth + 1);

                stack.push(
                    {
                        game: gclone,
                        depth: stackDepth + 1,
                        instructions: stackInstructions + _d
                    }
                )

                for (let pos of moved_past) {
                    let moveData = posMap.get(JSON.stringify(pos));

                    
                    if (moveData) {
                        if (stackDepth + 1 < moveData[0]) {
                            posMap.set(JSON.stringify(pos), [stackDepth + 1, stackInstructions + _d]);
                        }
                    } else {
                        posMap.set(JSON.stringify(pos), [stackDepth + 1, stackInstructions + _d]);
                        if (stackDepth + 1 > maxDepth) {
                            maxDepth = stackDepth + 1
                        }
                    }


                }
                

            }   
        }
    }

    let exitPos: Vec2| undefined;

    while (!exitPos) {
        for (const [pos, data] of posMap) {
            if (data[0] >= maxDepth) {
                let potential = JSON.parse(pos);

                if (grid[potential!.x][potential!.y].tile) {
                    console.log(`Potential end at ${JSON.stringify(potential)} has ${grid[potential!.x][potential!.y].tile!.kind} blocking`);
                    posMap.delete(pos);
                    continue;
                }
                console.log("Solution: " + data[1].match(/.{1,5}/g)?.join(' '))
                exitPos = potential;
                break;
            }
        }
        if (exitPos) {
            break;
        }
        
        maxDepth -= 1

        console.log("Lowering threshold to " + maxDepth );

        if (maxDepth <= 0) {
            console.log("Failed, resetting")
            return createPuzzleBFS(n, m, rng) // fallback
        }
    }

    return [grid, startPos, exitPos!, maxDepth]

}