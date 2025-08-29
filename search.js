import { _RNG } from "./utils.js";
import { createPuzzleBFS } from "./generator.js";
function quickDepth(x, y, seed) {
    let rng = new _RNG(seed);
    let invalid = true;
    let grid;
    let startPos;
    let endPos;
    let depth;
    let g;
    [grid, startPos, endPos, depth] = createPuzzleBFS(x, y, rng);
    return depth;
}
function searchDepth(x, y, c) {
    let m = 0;
    while (c--) {
        let seed = Math.round(Math.random() * 100000000000000).toString();
        let d = suppressConsoleLogs(() => quickDepth(x, y, seed));
        if (d >= m) {
            console.log(`Seed ${seed} has depth ${d}`);
            m = d;
        }
    }
}
function suppressConsoleLogs(fn) {
    const originalLog = console.log;
    console.log = () => { };
    try {
        return fn();
    }
    finally {
        console.log = originalLog;
    }
}
searchDepth(10, 10, 10000);
