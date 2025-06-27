import { Direction } from "./utils";

export type Cell = {
    entity?: Entity;
    tile?: Tile;
}


/**
 * Entities are things which can move within the grid (Blob, Ball)
 */
export abstract class Entity {
    abstract kind: string;
    abstract render(): string;
    abstract clone(): Entity;
}

export class BlobChar extends Entity {
    kind = 'Blob';

    render(): string {
        return '@';
    }

    clone(): BlobChar {
        return new BlobChar();
    }
}

export class Ball extends Entity {
    kind = 'Ball';

    render(): string {
        return '*';
    }

    clone(): Ball {
        return new Ball();
    }
}


/**
 * Tiles stay static within the grid
 */
export abstract class Tile {
    abstract kind: string;
    abstract render(): string;
    abstract enterable(from: Direction): boolean;
    abstract clone(): Tile;
}

/**
 * Wall tile. Blocks everything
 */
export class Wall extends Tile {
    kind = 'Wall';

    render(): string {
        return '#';
    }

    enterable(from: Direction): boolean {
        return false;
    }

    clone(): Wall {
        return new Wall();
    }
}

/**
 * Goal tile
 */
export class Star extends Tile {
    kind = 'Star';

    render(): string {
        return '%'
    }

    enterable(from: Direction): boolean {
        return true;
    }

    clone(): Star {
        return new Star();
    }
}

/**
 * Hole. Can be filled by a ball
 */
export class Hole extends Tile {
    kind = 'Hole';

    filled: boolean = false;

    render(): string {
        if (this.filled) {
            return ','
        } else {
            return 'o'
        }
    }

    enterable(from: Direction): boolean {
        return this.filled;
    }

    clone(): Hole {
        const h = new Hole();
        h.filled = this.filled;
        return h;
    }
}

/**
 * Grate. Turns into hole after passing
 */
export class Grate extends Tile {
    kind = 'Grate';

    render(): string {
        return '=';
    }

    enterable(from: Direction): boolean {
        return true;
    }

    clone(): Grate {
        return new Grate();
    }
}

export class Triangle extends Tile {
    kind = 'Triangle'


    // The grate has two open sides. The second is anticlockwise from the first, so 'up' is ◢
    facing: Direction = 'up'

    rotate(): void {
        switch (this.facing) {
            case "up": this.facing = "right"; break;
            case "right": this.facing = "down"; break;
            case "down": this.facing = "left"; break;
            case "left": this.facing = "up"; break;
        }
    }


    render(): string {
        switch (this.facing) {
            case "up": return '◢';
            case "down": return '◤';
            case "left": return '◥';
            case "right": return '◣';
        }
    }

    exitDir(from: Direction): Direction {
        switch (this.facing) {
            case "up":
                switch (from) {
                    case "down": return 'left';
                    case "right": return 'up';
                    default: throw new Error("Failed to bounce");
                }
            case "down":
                switch (from) {
                    case "up": return 'right';
                    case "left": return 'down';
                    default: throw new Error("Failed to bounce");
                }
            case "left":
                switch (from) {
                    case "up": return "left";
                    case "right": return "down";
                    default: throw new Error("Failed to bounce");
                }
            case "right":
                switch (from) {
                    case "down": return "right";
                    case "left": return "up";
                    default: throw new Error("Failed to bounce");
                }
        }
    }

    enterable(from: Direction): boolean {
        switch (this.facing) {
            case "up": return from == 'down' || from == 'right';
            case "down": return from == 'up' || from == 'left';
            case "left": return from == 'up' || from == 'right';
            case "right": return from == 'down' || from == 'left';
        }
    }

    clone(): Triangle {
        const t = new Triangle();
        t.facing = this.facing;
        return t;
    }
}


export class Slash extends Tile {
    kind = 'Slash';

    facingUp: boolean = true; // direction is slash description (/) is up and (\) is down
    
    rotate(): void {
        this.facingUp = !this.facingUp;
    }

    render(): string {
        if (this.facingUp) {
            return '/';
        } else {
            return '\\';
        }
    }

    exitDir(from: Direction): Direction {
        if (this.facingUp) {
            switch (from) {
                case "up": return "right";
                case "down": return "left";
                case "left": return "down";
                case "right": return "up";
            }
        } else {
           switch (from) {
                case "up": return "left";
                case "down": return "right";
                case "left": return "up";
                case "right": return "down";
            } 
        }
    }

    enterable(from: Direction): boolean {
        return true;
    }

    clone(): Slash {
        const s = new Slash();
        s.facingUp = this.facingUp;
        return s;
    }
}
