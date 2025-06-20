import { Direction } from "./vectors";

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
}

export class BlobChar extends Entity {
    kind = 'Blob';

    render(): string {
        return '@';
    }
}

export class Ball extends Entity {
    kind = 'Ball';

    render(): string {
        return '*';
    }
}


/**
 * Tiles stay static within the grid
 */
export abstract class Tile {
    abstract kind: string;
    abstract render(): string;
    abstract enterable(from: Direction): boolean;
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


    enterable(from: Direction): boolean {
        switch (this.facing) {
            case "up": return from == 'down' || from == 'right';
            case "down": return from == 'up' || from == 'left';
            case "left": return from == 'up' || from == 'right';
            case "right": return from == 'down' || from == 'left';
        }
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

    enterable(from: Direction): boolean {
        return true;
    }
}