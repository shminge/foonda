import { choice, rand, v, Vec2 } from "./utils";
import { Game } from "./main";
import { Cell } from "./classes";

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

function generateGrid(n: number, m: number, minDensity: number = 0.1, maxDensity: number = 0.6): Cell[][]{
    let g = Game.emptyGrid(n,m);
    let elemCount = rand(minDensity, maxDensity);



    return g;
}