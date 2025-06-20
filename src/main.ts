
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
import { Cell, Wall, BlobChar } from "./classes";






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


    /**
     * Push the blobChar in the specified direction, modifying the grid along the way.
     * @param direction the direction blob is being pushed
     */
    blobImpluse(dir: Direction) {
        while (true){
            let nextPos = directionStep(this.blobPos, dir);
            let nextCell = this.getCell(nextPos);
            if (nextCell.tile?.enterable(dir) ?? true) { // short circuit to true if no tile
                let mrBlob = this.getCell(this.blobPos).entity;
                this.getCell(this.blobPos).entity = undefined;
                this.blobPos = nextPos;
                this.getCell(this.blobPos).entity = mrBlob;
                continue;
            } else {
                break;
            }
        }
    }

}




/**
 * Abandon hope all ye who enter here
 */
let g = new Game()
g.grid = Game.emptyGrid(5, 7);
g.placeBlob(v(3,2));
g.displayGrid();
g.blobImpluse("down");
g.displayGrid();