export function v(x, y) {
    return { x, y };
}
export function directionStep(pos, dir) {
    switch (dir) {
        case "up": return v(pos.x, pos.y - 1);
        case "down": return v(pos.x, pos.y + 1);
        case "left": return v(pos.x - 1, pos.y);
        case "right": return v(pos.x + 1, pos.y);
    }
}
export function vEq(a, b) {
    return (a.x == b.x && a.y == b.y);
}
function mulberry32(seed) {
    return function () {
        let t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}
function stringToSeed(str) {
    let h = 2166136261 >>> 0; // FNV-1a 32-bit offset basis
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 16777619); // FNV prime
    }
    return h >>> 0;
}
export class _RNG {
    constructor(seed) {
        this.gen = mulberry32(stringToSeed(seed));
    }
    nrand() {
        return this.gen();
    }
    choice(choices) {
        return choices[Math.floor(this.nrand() * choices.length)];
    }
    rand(a, b, whole = false) {
        let n = this.nrand() * (b - a) + a;
        if (whole)
            return Math.floor(n);
        return n;
    }
    shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            // Generate a random index from 0 to i
            const j = Math.floor(this.nrand() * (i + 1));
            // Swap elements at index i and j
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
}
/**
 * random choice
 */
export function exhaust(generator) {
    for (const _ of generator) {
    }
}
