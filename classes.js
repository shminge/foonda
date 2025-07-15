/**
 * Entities are things which can move within the grid (Blob, Ball)
 */
export class Entity {
}
export class BlobChar extends Entity {
    constructor() {
        super(...arguments);
        this.kind = 'Blob';
    }
    render() {
        return '@';
    }
    clone() {
        return new BlobChar();
    }
}
export class Ball extends Entity {
    constructor() {
        super(...arguments);
        this.kind = 'Ball';
    }
    render() {
        return '*';
    }
    clone() {
        return new Ball();
    }
}
/**
 * Tiles stay static within the grid
 */
export class Tile {
}
/**
 * Wall tile. Blocks everything
 */
export class Wall extends Tile {
    constructor() {
        super(...arguments);
        this.kind = 'Wall';
    }
    render() {
        return '#';
    }
    enterable(from) {
        return false;
    }
    clone() {
        return new Wall();
    }
}
/**
 * Goal tile
 */
export class Star extends Tile {
    constructor() {
        super(...arguments);
        this.kind = 'Star';
    }
    render() {
        return '%';
    }
    enterable(from) {
        return true;
    }
    clone() {
        return new Star();
    }
}
/**
 * Hole. Can be filled by a ball
 */
export class Hole extends Tile {
    constructor() {
        super(...arguments);
        this.kind = 'Hole';
        this.filled = false;
    }
    render() {
        if (this.filled) {
            return ',';
        }
        else {
            return 'o';
        }
    }
    enterable(from) {
        return this.filled;
    }
    clone() {
        const h = new Hole();
        h.filled = this.filled;
        return h;
    }
}
/**
 * Grate. Turns into hole after passing
 */
export class Grate extends Tile {
    constructor() {
        super(...arguments);
        this.kind = 'Grate';
    }
    render() {
        return '=';
    }
    enterable(from) {
        return true;
    }
    clone() {
        return new Grate();
    }
}
export class Triangle extends Tile {
    constructor() {
        super(...arguments);
        this.kind = 'Triangle';
        // The grate has two open sides. The second is anticlockwise from the first, so 'up' is ◢
        this.facing = 'up';
    }
    rotate() {
        switch (this.facing) {
            case "up":
                this.facing = "right";
                break;
            case "right":
                this.facing = "down";
                break;
            case "down":
                this.facing = "left";
                break;
            case "left":
                this.facing = "up";
                break;
        }
    }
    render() {
        switch (this.facing) {
            case "up": return '◢';
            case "down": return '◤';
            case "left": return '◥';
            case "right": return '◣';
        }
    }
    exitDir(from) {
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
    enterable(from) {
        switch (this.facing) {
            case "up": return from == 'down' || from == 'right';
            case "down": return from == 'up' || from == 'left';
            case "left": return from == 'up' || from == 'right';
            case "right": return from == 'down' || from == 'left';
        }
    }
    clone() {
        const t = new Triangle();
        t.facing = this.facing;
        return t;
    }
}
export class Slash extends Tile {
    constructor() {
        super(...arguments);
        this.kind = 'Slash';
        this.facingUp = true; // direction is slash description (/) is up and (\) is down
    }
    rotate() {
        this.facingUp = !this.facingUp;
    }
    render() {
        if (this.facingUp) {
            return '/';
        }
        else {
            return '\\';
        }
    }
    exitDir(from) {
        if (this.facingUp) {
            switch (from) {
                case "up": return "right";
                case "down": return "left";
                case "left": return "down";
                case "right": return "up";
            }
        }
        else {
            switch (from) {
                case "up": return "left";
                case "down": return "right";
                case "left": return "up";
                case "right": return "down";
            }
        }
    }
    enterable(from) {
        return true;
    }
    clone() {
        const s = new Slash();
        s.facingUp = this.facingUp;
        return s;
    }
}
