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
}
