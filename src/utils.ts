/**
 * Stores a direction (up/down/left/right)
 */
export type Direction = 'up' | 'down' | 'left' | 'right';

export type Vec2 = {
    x: number;
    y: number;
}

export function v(x: number, y: number): Vec2 {
    return {x,y}
}

export function directionStep(pos: Vec2, dir: Direction): Vec2 {
    switch (dir) {
        case "up": return v(pos.x, pos.y-1);
        case "down": return v(pos.x, pos.y+1);
        case "left": return v(pos.x-1, pos.y);
        case "right": return v(pos.x+1, pos.y);
    }
}


/**
 * random choice
 */
export function choice<T>(choices: T[]): T {
    return choices[Math.floor(Math.random()*choices.length)]
}

export function rand(a:number, b:number, whole=false): number {
    let n = Math.random()*(b-a) + a;
    if (whole) return Math.floor(n);
    return n;
}

export function shuffleArray<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
        // Generate a random index from 0 to i
        const j = Math.floor(Math.random() * (i + 1));
        
        // Swap elements at index i and j
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}


export function exhaust(generator: Generator<any,any,any>): void {
    for (const _ of generator) {
    }
}

