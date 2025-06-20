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