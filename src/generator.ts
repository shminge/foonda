import { choice, Direction, exhaust, rand, shuffleArray, v, Vec2 } from "./utils";
import { Game } from "./main";
import { Ball, BlobChar, Cell, Grate, Hole, Slash, Triangle, Wall } from "./classes";

type PuzzleStack = [Cell[][], Vec2]

/**
 * Reversible puzzle generator to use with main.ts
 */

function emptySpaces(g: Cell[][]): Vec2[] {
    let empty: Vec2[] = [];
    for (let x = 0; x < g.length; x++) {
        for (let y = 0; y < g[0].length; y++) {
            if (g[x][y].entity || g[x][y].tile) {
                continue;
            }
            empty.push(v(x,y));
        }
    } 
    return empty;
}

export function generateGrid(n: number, m: number, minDensity: number = 0.05, maxDensity: number = 0.2): [Cell[][], Vec2]{
    let g = Game.emptyGrid(n,m);
    let elemCount = rand(minDensity, maxDensity)*(n-1)*(m-1);
    console.log(elemCount);
    let empty = emptySpaces(g);
    empty = shuffleArray(empty);
    for (let i = 0; i < elemCount; i++) {
        let spot = empty.pop();
        if (spot) {
            let cell: Cell = {};
            let q = choice([0,1,2,3,4,5])
            switch (q) {
                case 0: 
                    cell.tile = new Wall();
                    break;
                case 1:
                    cell.entity = new Ball();
                    break;
                case 2:
                    let t = new Triangle();
                    let c = choice([0,1,2,3])

                    for (let cc = 0; cc < c; cc++) {
                        t.rotate();
                    }
                    cell.tile = t;
                    break;
                case 3:
                    let s = new Slash();
                    let cs = choice([0,1]);

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
            console.log(cell);
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


export function createPuzzle(n: number, m: number): Game {
    let [grid, startPos] = generateGrid(n, m);
    let g = Game.newGame(grid, startPos)
    g.displayGrid()
    let numMoves = rand(5, 20, true);
    for (let i = 0; i < numMoves; i++) {
        let dir: Direction = choice(["up", "down", "left", "right"]);
        const gen = g.blobImpluse(dir);
        exhaust(gen);
    }
    g.displayGrid();
    console.log();







    return g;
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