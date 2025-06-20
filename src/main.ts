
/* Foonda Remake
- @ blob (dude)
- # wall
- E star (finish)
- * ball (blob hits -> takes spot and launches ball)
- ◢◣◤◥ or  wall/bounce (rotates clockwise after hit)
- / or \ bounce/bounce (also rotates clockwise)
- O hole (wall that can be filled by ball)
- = grate (turns into hole after traversal by blob or ball)
*/
import { Vec2, Direction, v, directionStep } from "./vectors";
import { Cell, Wall, BlobChar, Entity, Ball, Grate, Hole, Slash, Triangle } from "./classes";






class Game {
    grid: Cell[][] = []; // grid coordinates are grid[x][y]
    blobPos: Vec2 = {x: -1, y: -1}

    static emptyGrid(n: number, m: number = n): Cell[][] {
        let grid: Cell[][] = [];
        for (let i = 0; i < n; i++) {
            grid.push([]);
            for (let j = 0; j < m; j++) {
                let newCell: Cell = {};
                if (i == 0 || i == n-1 || j == 0 || j == m-1) {
                    newCell.tile = new Wall;
                }
                grid[i].push(newCell);
            }
        }

        return grid;
    }

    placeBlob(p: Vec2): void {
        let placedCell = this.getCell(p);
        if (placedCell.entity) {
            throw new Error("Can't place Blob on an occupied space");
        } else {
            placedCell.entity = new BlobChar();
            this.blobPos = p;
        }
    }

    getCell(p: Vec2): Cell {
        return this.grid[p.x][p.y];
    }

    displayGrid() {
        for (let y = 0; y < this.grid[0].length; y++) {
            let line = '';
            for (let x = 0; x < this.grid.length; x++) {
                let cCell: Cell = this.grid[x][y];
                line += cCell.entity?.render() ?? cCell.tile?.render() ?? '.' 
            }
            console.log(line)
        }
    }

    moveBlob(p: Vec2): void {
        let mrBlob = this.getCell(this.blobPos).entity;
        this.getCell(this.blobPos).entity = undefined;
        this.blobPos = p;
        this.getCell(this.blobPos).entity = mrBlob;
    }

    /**
     * Moves an entity from-to and returns to for convenience
     * @param from 
     * @param to 
     */
    moveGeneric(from: Vec2, to: Vec2): Vec2 {
        let mover = this.getCell(from).entity;
        this.getCell(from).entity = undefined;
        this.getCell(to).entity = mover;
        return to;
    }


    /**
     * Push the blobChar in the specified direction, modifying the grid along the way.
     * @param dir the direction blob is being pushed
     */
    blobImpluse(dir: Direction) {
        while (true){
            let nextPos = directionStep(this.blobPos, dir);
            let nextCell = this.getCell(nextPos);

            if (nextCell.tile || nextCell.entity) {

                if (nextCell.entity) {
                    let ball: Ball = nextCell.entity;
                    // there is a ball, so we transfer momentum
                    let pushed = this.ballImpulse(ball, nextPos, dir);
                    if (pushed) {this.moveBlob(nextPos);}
                    
                    break;

                } else {
                    // there is a tile and no entity
                    if (!nextCell.tile?.enterable(dir)) { break; };

                    if (nextCell.tile instanceof Grate) {
                        this.moveBlob(nextPos);
                        nextCell.tile = new Hole();
                        continue;
                    }

                    if (nextCell.tile instanceof Slash || nextCell.tile instanceof Triangle) {
                        // first we check where we bounce to
                        let extD = nextCell.tile.exitDir(dir);
                        let bouncedTile = directionStep(nextPos, extD);
                        if (this.getCell(bouncedTile).tile?.enterable(extD) ?? true ) {
                            let b: Ball | undefined = this.getCell(bouncedTile).entity
                            if (b) {
                                if (!(this.ballImpulse(b, bouncedTile, extD))) {
                                    break;
                                }
                            }
                            this.moveBlob(bouncedTile);
                            nextCell.tile.rotate();
                            this.blobImpluse(extD);
                            break;
                        } else {
                            // couldn't bounce
                            break;
                        }
                    }
                }
            } else {
                this.moveBlob(nextPos);
            }
        }
    }


    /**
     * Yeeets ball in direction dir
     * @param ball 
     * @param dir 
     * @returns whether or not it succeeded
     */
    ballImpulse(ball: Ball, ballPos: Vec2, dir: Direction) : boolean {
        let moved = false;
        while (true){
            let nextPos = directionStep(ballPos, dir);
            let nextCell = this.getCell(nextPos);

            if (nextCell.tile || nextCell.entity) {

                if (nextCell.entity) {
                    return moved;
                    // there is a ball or blob, so we stop

                } else {
                    // there is a tile and no entity
                    if (!nextCell.tile?.enterable(dir)) { return moved; };

                    if (nextCell.tile instanceof Grate) {
                        console.log(ballPos)
                        ballPos = this.moveGeneric(ballPos, nextPos);
                        nextCell.tile = new Hole();
                        continue;
                    }

                    if (nextCell.tile instanceof Slash || nextCell.tile instanceof Triangle) {
                        // first we check where we bounce to
                        let extD = nextCell.tile.exitDir(dir);
                        let bouncedTile = directionStep(nextPos, extD);
                        if (this.getCell(bouncedTile).tile?.enterable(extD) ?? true ) {
                            let b: Ball | undefined = this.getCell(bouncedTile).entity
                            if (b) { break;}
                            ballPos = this.moveGeneric(ballPos, bouncedTile);
                            nextCell.tile.rotate();
                            this.ballImpulse(ball, bouncedTile, extD);
                            break;
                        } else {
                            // couldn't bounce
                            break;
                        }
                    }
                }
            } else {
                ballPos = this.moveGeneric(ballPos, nextPos);
            }
            moved = true;
        }
        return moved;
    }

}




/**
 * Abandon hope all ye who enter here
 */
let g = new Game()
g.grid = Game.emptyGrid(7, 9);
g.placeBlob(v(3,2));
g.grid[2][1] = {tile: new Grate()};
g.grid[3][5] = {tile: new Slash()};
g.grid[1][4] = {entity: new Ball()};
g.grid[1][2] = {tile: new Grate()};
g.displayGrid();

let actions: Direction[] = ["down", "right", "up", "right", "left", "down", "left", "up"];

for (let a of actions) {
    console.log("Moving " + a);
    g.blobImpluse(a);
    g.displayGrid();
    console.log()
}