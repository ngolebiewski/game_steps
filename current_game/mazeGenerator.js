import { getRandomIntBetween } from './util.js';

export default class MazeGenerator {
  constructor() {
    this.maze = [];
    this.rows = 0;
    this.cols = 0;
  }

  generate(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.maze = Array.from({ length: rows }, () => Array(cols).fill(1));

    const carve = (x, y) => {
      this.maze[y][x] = 0;
      const directions = [
        [0, -2], [0, 2], [-2, 0], [2, 0]
      ].sort(() => Math.random() - 0.5);

      for (const [dx, dy] of directions) {
        const nx = x + dx;
        const ny = y + dy;
        if (
          ny > 0 && ny < rows - 1 &&
          nx > 0 && nx < cols - 1 &&
          this.maze[ny][nx] === 1
        ) {
          this.maze[y + dy / 2][x + dx / 2] = 0;
          carve(nx, ny);
        }
      }
    };

    carve(1, 1);

    // Border walls
    for (let y = 0; y < rows; y++) {
      this.maze[y][0] = this.maze[y][cols - 1] = 1;
    }
    for (let x = 0; x < cols; x++) {
      this.maze[0][x] = this.maze[rows - 1][x] = 1;
    }

    return this.maze;
  }

  getRandomEmptyTile() {
    let row, col;
    do {
      row = getRandomIntBetween(1, this.rows - 2);
      col = getRandomIntBetween(1, this.cols - 2);
    } while (this.maze[row][col] !== 0);
    return [row, col];
  }

  getReachableCells(startRow, startCol) {
    const visited = Array.from({ length: this.rows }, () => Array(this.cols).fill(false));
    const queue = [[startRow, startCol]];
    visited[startRow][startCol] = true;
    const reachable = [];

    while (queue.length > 0) {
      const [r, c] = queue.shift();
      reachable.push([r, c]);

      const neighbors = [
        [r - 1, c], [r + 1, c],
        [r, c - 1], [r, c + 1]
      ];

      for (const [nr, nc] of neighbors) {
        if (
          nr >= 0 && nr < this.rows &&
          nc >= 0 && nc < this.cols &&
          !visited[nr][nc] &&
          this.maze[nr][nc] === 0
        ) {
          visited[nr][nc] = true;
          queue.push([nr, nc]);
        }
      }
    }

    return reachable;
  }
  // method to cut rooms out of maze, because it will be more fun with chambers of secrets.
  makeRooms(currentLevel) {

    // TO DO: Random sizes for Rooms, make the max size grow as the level gets higher and the stages are bigger with more area.

    // let's start with adding in a 2x3 room somewhere in bounds. then lets randomize it, and make more rooms with more levels, that sort of thing.


    //hard code for now. make this more random after testing one box out
    const boxes = [[2, 3], [3, 4], [6, 6], [10, 10]]
    const numberRooms = Math.floor(Math.min(currentLevel / 3, boxes.length))
    console.log('number rooms: ', numberRooms)

    // this.maze is a 2d array and we want to skip the 1st and last rows and columns because those are walls.
    // Where will the room go?
    // Pick random number between 1 and 1 less than length minus width/height of room.
    // Returns the upper left [x,y] for the box to be positioned in the maze
    const getBoxUpperLeftCoordinate = (xWide, yTall) => {
      const x = getRandomIntBetween(1, this.cols - 2 - xWide);
      const y = getRandomIntBetween(1, this.rows - 2 - yTall);
      return [x, y]
    }

    // This takes an array of the box's top left coordinates [x,y] and an array of the box dimensions [width,height]
    // Then it replaces the coordinates of the 'room' with 0s in the maze array, thus creating an open room.
    const carveBox = (origin, box) => {
      const oX = origin[0]
      const oY = origin[1]
      const bX = box[0]
      const bY = box[1]

      for (let y = oY; y < oY + bY; y++) {
        for (let x = oX; x < oX + bX; x++) {
          this.maze[y][x] = 0;
        }
      }
    }


    for (let i = 0; i < numberRooms; i++) {
      const box = boxes[i]
      console.log(box)
      const boxOrigin = getBoxUpperLeftCoordinate(box[0], box[1])
      carveBox(boxOrigin, box)
    }

  }
}
