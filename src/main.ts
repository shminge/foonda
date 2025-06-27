
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
import { Vec2, Direction, v, directionStep } from "./utils";
import { Cell, Wall, BlobChar, Entity, Ball, Grate, Hole, Slash, Triangle, Star } from "./classes";
import { calcMin, createPuzzle, generateGrid } from "./generator";






export class Game {
    grid: Cell[][] = []; // grid coordinates are grid[x][y]
    blobPos: Vec2 = {x: -1, y: -1}

    static newGame(gr: Cell[][], bPos: Vec2): Game {
        let g = new Game();
        g.grid = gr;
        g.blobPos = bPos;
        g.grid[bPos.x][bPos.y].entity = new BlobChar();
        return g;
    }

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
        let initial = '  ';
        for (let x = 0; x < this.grid.length; x++) {
            initial += (x%10);
        }
        console.log(initial);
        for (let y = 0; y < this.grid[0].length; y++) {
            let line = y + ' ';
            for (let x = 0; x < this.grid.length; x++) {
                let cCell: Cell = this.grid[x][y];
                line += cCell.entity?.render() ?? cCell.tile?.render() ?? '.' 
            }
            console.log(line)
        }
    }

    serializeGrid(): string {
        let lines: string[] = [];

        for (let y = 0; y < this.grid[0].length; y++) {
            let line = '';
            for (let x = 0; x < this.grid.length; x++) {
                const cCell: Cell = this.grid[x][y];
                line += cCell.entity?.render() ?? cCell.tile?.render() ?? '.';
            }
            lines.push(line);
        }

        return lines.join('\n');
    }   

    clone(): Game {
        const newGrid: Cell[][] = this.grid.map(column =>
            column.map(cell => ({
                entity: cell.entity?.clone(),
                tile: cell.tile?.clone()
            }))
        );

        const newBlobPos = { ...this.blobPos };

        return Game.newGame(newGrid, newBlobPos);
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
    *blobImpluse(dir: Direction): Generator<void, void, void> {
        while (true) {
            let nextPos = directionStep(this.blobPos, dir);
            let nextCell = this.getCell(nextPos);
            //console.log("Moving "+ dir + " to " + JSON.stringify(nextPos) + " which is a " + JSON.stringify(nextCell));

            if (nextCell.tile || nextCell.entity) {
                if (nextCell.entity) {
                    let ball: Ball = nextCell.entity;
                    let pushed = yield* this.ballImpulse(ball, nextPos, dir);
                    if (pushed) {
                        this.moveBlob(nextPos);
                        yield;
                    }
                    return;
                } else {
                    if (!nextCell.tile?.enterable(dir)) return;

                    if (nextCell.tile instanceof Grate) {
                        this.moveBlob(nextPos);
                        nextCell.tile = new Hole();
                        yield;
                        continue;
                    }

                    if (nextCell.tile instanceof Slash || nextCell.tile instanceof Triangle) {
                        let extD = nextCell.tile.exitDir(dir);
                        let bouncedTile = directionStep(nextPos, extD);
                        if (this.getCell(bouncedTile).tile?.enterable(extD) ?? true) {
                            let b: Ball | undefined = this.getCell(bouncedTile).entity;
                            if (b) {
                                const pushed = yield* this.ballImpulse(b, bouncedTile, extD);
                                if (!pushed) return;
                            }
                            this.moveBlob(bouncedTile);
                            nextCell.tile.rotate();
                            yield;
                            yield* this.blobImpluse(extD);
                            return;
                        } else {
                            return;
                        }
                    }


                    if (nextCell.tile instanceof Hole) {
                        if (!nextCell.tile.filled) {
                            throw new Error("Somehow fell in a hole")
                        }
                        this.moveBlob(nextPos);
                        yield;
                    }
                }
            } else {
                this.moveBlob(nextPos);
                yield;
            }
        }
    }



    /**
     * Yeeets ball in direction dir
     * @param ball 
     * @param dir 
     * @returns whether or not it succeeded
     */
    *ballImpulse(ball: Ball, ballPos: Vec2, dir: Direction): Generator<void, boolean, void> {
        let moved = false;

        while (true) {
            let nextPos = directionStep(ballPos, dir);
            let nextCell = this.getCell(nextPos);

            //console.log("Moving ball "+ dir + " to " + JSON.stringify(nextPos) + " which is a " + JSON.stringify(nextCell));

            if (nextCell.tile || nextCell.entity) {
                if (nextCell.entity) {
                    return moved;
                } else {
                    if (!nextCell.tile?.enterable(dir)) {
                        if (nextCell.tile instanceof Hole) {
                            if (!nextCell.tile.filled) {
                                nextCell.tile.filled = true;
                                this.getCell(v(ballPos.x, ballPos.y)).entity = undefined;
                                return true;
                            } 
                            
                        }
                        return moved;
                    }

                    if (nextCell.tile instanceof Grate) {
                        ballPos = this.moveGeneric(ballPos, nextPos);
                        nextCell.tile = new Hole();
                        moved = true;
                        yield;
                        continue;
                    }

                    if (nextCell.tile instanceof Hole && nextCell.tile.filled) {
                        ballPos = this.moveGeneric(ballPos, nextPos);
                        moved = true;
                        yield;
                        continue;
                    }

                    if (nextCell.tile instanceof Slash || nextCell.tile instanceof Triangle) {
                        let extD = nextCell.tile.exitDir(dir);
                        let bouncedTile = directionStep(nextPos, extD);
                        if (this.getCell(bouncedTile).tile?.enterable(extD) ?? true) {
                            let b: Ball | undefined = this.getCell(bouncedTile).entity;
                            if (b) return moved;

                            ballPos = this.moveGeneric(ballPos, bouncedTile);
                            nextCell.tile.rotate();
                            moved = true;
                            yield;
                            yield* this.ballImpulse(ball, bouncedTile, extD);
                            return true;
                        } else {
                            return moved;
                        }
                    }
                }
            } else {
                ballPos = this.moveGeneric(ballPos, nextPos);
                moved = true;
                yield;
            }
        }
    }
}



/**
 * Abandon hope all ye who enter here
 */

let nm = 0;
let g: [Cell[][], Vec2, Vec2];
while (nm < 5) {
    g = createPuzzle(10, 10);
    nm = (calcMin(...g));
}
let ng = Game.newGame(g![0], g![1]);
ng.displayGrid();
console.log("Get to the % in "+ nm + " moves!")
ng.grid[g![2].x][g![2].y].tile = new Star;
ng.displayGrid();


/*= new Game()
g.grid = generateGrid(10, 10)[0];
g.displayGrid();


/*
g.placeBlob(v(3,2));
g.grid[2][1] = {tile: new Grate()};
g.grid[3][5] = {tile: new Triangle()};
g.grid[1][4] = {entity: new Ball()};
g.grid[1][2] = {tile: new Grate()};
g.displayGrid();

let actions: Direction[] = ["down", "right", "up", "right", "left", "left", "down"];

for (let a of actions) {
    console.log("Moving " + a);

    const gen = g.blobImpluse(a);
    for (let _ of gen) {
        g.displayGrid(); // display each step
        console.log();
    }
}
    */
