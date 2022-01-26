import { Container, Matrix, Sprite, Texture, TilingSprite } from "pixi.js";
import AssetManager from "../assets/AssetManager";
import { getFloorMatrix, getLeftMatrix, getRightMatrix } from "./util/Matrix";

export type addTiles = { x: number; y: number; height: number; stairs: number };

const STAIR_HEIGHT = 8;

// The math for the stairs is a bit weird.
// There are a bunch of "magic" numbers, maybe in the future we should look for a way to improve it.
// But for now it works
class Stair {
  public container: Container = new Container();

  constructor(orientation: number) {
    for (let i = 0; i < 4; i++) {
      switch (orientation) {
        case 1:
          this.createStairUp(3 - i);
          break;
        case 2:
          this.createStairLeft(3 - i);
          break;
        case 3:
          this.createStairRight(3 - i);
          break;
        case 6:
          this.createStairUpLeft(3 - i);
          break;
        case 7:
          this.createStairUpRight(3 - i);
      }
    }
  }

  // Stair is a direction
  // -1 = no stairs
  // 0 = down
  // 1 = up
  // 2 = left
  // 3 = right
  // 4 = down left
  // 5 = down right
  // 6 = up left
  // 7 = up right
  // 8 = middle
  static checkLayout(x: number, y: number, height: number, layout: number[][], currentTiles: addTiles[]) {
    let stairs = -1;

    // Stair DOWN LEFT
    if (layout[y + 1] && layout[y + 1][x - 1] && layout[y + 1][x - 1] - height === 1) {
      stairs = 4;
    }

    // Stair UP LEFT
    if (layout[y - 1] && layout[y - 1][x - 1] && layout[y - 1][x - 1] - height === 1) {
      stairs = 6;
    }

    // Stair UP RIGHT
    if (layout[y - 1] && layout[y - 1][x + 1] && layout[y - 1][x + 1] - height === 1) {
      stairs = 7;
    }

    // Stair UP
    if (layout[y - 1] && layout[y - 1][x] - height === 1) {
      stairs = 1;
    }

    // Stair LEFT
    if (layout[y][x - 1] && layout[y][x - 1] - height === 1) {
      if (!currentTiles.find((tile) => tile.x === x - 1 && tile.y === y && tile.stairs > 0)) {
        stairs = 2;
      }
    }

    // Stair RIGHT
    if (layout[y][x + 1] && layout[y][x + 1] - height === 1) {
      if (!currentTiles.find((tile) => tile.x === x + 1 && tile.y === y && tile.stairs > 0)) {
        stairs = 3;
      }
    }

    return stairs;
  }

  public createStairSprite(matrix: Matrix, tint: number, texture: Texture) {
    const tile = new TilingSprite(texture);
    tile.anchor.set(0);

    tile.tilePosition.x = 0;
    tile.tilePosition.y = 0;

    tile.transform.setFromMatrix(matrix);

    tile.tint = tint;

    return tile;
  }

  public async createStairRight(index: number) {
    let baseX = -STAIR_HEIGHT * index;
    let baseY = -STAIR_HEIGHT * index * 1.5;

    this.container.sortableChildren = true;

    const baseXRight = 0;
    const baseYRight = -STAIR_HEIGHT * index * 1.5;

    const texture = await AssetManager.getFloor("floor_texture_64_0_floor_basic");

    let tileLeft = this.createStairSprite(getFloorMatrix(0, 0), 0x999966, texture);

    tileLeft.width = 8;
    tileLeft.height = 24;
    tileLeft.y -= 24 + 4 * (3 - index) + 4;
    tileLeft.x += 8 + 8 * (3 - index);
    tileLeft.zIndex = 10;
    this.container.addChild(tileLeft);

    let tileRight = this.createStairSprite(getFloorMatrix(0, 0), 0x666644, texture);

    tileRight.width = 8;
    tileRight.height = 32;
    tileRight.y -= 24 + 4 * (3 - index) - 4;
    tileRight.x += 8 + 8 * (3 - index);
    tileRight.zIndex = 0;
    this.container.addChild(tileRight);

    const borderLeft = this.createStairSprite(getLeftMatrix(baseX + 32 - STAIR_HEIGHT, baseY + STAIR_HEIGHT * 1.5, { width: STAIR_HEIGHT, height: STAIR_HEIGHT }), 0x838357, texture);
    borderLeft.width = STAIR_HEIGHT;
    borderLeft.height = STAIR_HEIGHT;

    borderLeft.x += index * 16;
    borderLeft.y += index * 8;

    borderLeft.x -= 24;

    borderLeft.y += 0 - 36; // - 4

    borderLeft.zIndex = 40;

    this.container.addChild(borderLeft);
  }

  public async createStairLeft(index: number) {
    let baseX = -STAIR_HEIGHT * index;
    let baseY = -STAIR_HEIGHT * index * 1.5;

    const texture = await AssetManager.getFloor("floor_texture_64_0_floor_basic");

    const tile = this.createStairSprite(getFloorMatrix(baseX + 32 - STAIR_HEIGHT, baseY + STAIR_HEIGHT * 1.5), 0x999966, texture);
    tile.width = STAIR_HEIGHT;
    tile.height = 32;

    tile.y += 8 - 32;

    const borderLeft = this.createStairSprite(getLeftMatrix(baseX + 32 - STAIR_HEIGHT, baseY + STAIR_HEIGHT * 1.5, { width: STAIR_HEIGHT, height: STAIR_HEIGHT }), 0x838357, texture);
    borderLeft.width = STAIR_HEIGHT;
    borderLeft.height = STAIR_HEIGHT;

    borderLeft.y += 8 - 32;

    const borderRight = this.createStairSprite(getRightMatrix(baseX, baseY, { width: 32, height: STAIR_HEIGHT }), 0x666644, texture);
    borderRight.width = 32;
    borderRight.height = STAIR_HEIGHT;
    borderRight.y += 8 - 32;

    this.container.addChild(borderLeft);
    this.container.addChild(borderRight);
    this.container.addChild(tile);
  }

  public async createStairUpLeft(index: number) {
    let baseXLeft = +STAIR_HEIGHT * index;
    let baseYLeft = -STAIR_HEIGHT * index * 1.5;

    const baseXRight = 0;
    const baseYRight = -STAIR_HEIGHT * index * 1.5;

    const texture = await AssetManager.getFloor("floor_texture_64_0_floor_basic");

    const tileLeft = this.createStairSprite(getFloorMatrix(baseXLeft, baseYLeft), 0x999966, texture);

    tileLeft.width = 32 - 8 * index;
    tileLeft.height = 8;

    tileLeft.x -= 48 - (3 - index) * 8;
    tileLeft.y -= 24 - ((3 - index) * 8) / 2;
    tileLeft.y += 8;

    const tileRight = this.createStairSprite(getFloorMatrix(baseXRight + 32 - STAIR_HEIGHT, baseYRight + STAIR_HEIGHT * 1.5), 0x999966, texture);

    tileRight.width = 8;
    tileRight.height = 32 - 8 * index;

    tileRight.x -= 24 + index * 8;
    tileRight.y -= 32 + 4;
    tileRight.y += 8;

    const borderLeft = this.createStairSprite(getLeftMatrix(baseXLeft - 8 * index, baseYLeft - 8 * index * 0.5, { width: 32, height: STAIR_HEIGHT }), 0x838357, texture);
    borderLeft.width = 32 - 8 * index;
    borderLeft.height = STAIR_HEIGHT;

    borderLeft.x -= 72 + (3 - index) * 8;
    borderLeft.y -= 20 + ((3 - index) * 8) / 2;
    borderLeft.y += 8;

    const borderRight = this.createStairSprite(getRightMatrix(baseXRight - STAIR_HEIGHT * index, -STAIR_HEIGHT * index * 1.5, { width: 32, height: STAIR_HEIGHT }), 0x666644, texture);

    borderRight.width = 32 - 8 * index;
    borderRight.height = STAIR_HEIGHT;

    borderRight.x -= 72 + (3 - index) * 8;
    borderRight.y -= 12 - ((3 - index) * 8) / 2;
    borderRight.y += 8;

    this.container.addChild(tileLeft);
    this.container.addChild(tileRight);
    this.container.addChild(borderRight);
    this.container.addChild(borderLeft);
  }

  public async createStairUpRight(step: number) {
    const texture = await AssetManager.getFloor("floor_texture_64_0_floor_basic");

    this.container.sortableChildren = true;

    const leftTile = this.createStairSprite(getFloorMatrix(0, 0), 0x999966, texture);
    leftTile.width = 8;
    leftTile.height = 8;

    leftTile.x += 16 * step + 8;
    leftTile.y -= 24 + 8 * step + 4;

    const tileRight = this.createStairSprite(getFloorMatrix(0, 0), 0x999966, texture);
    tileRight.width = 32 - 8 * step;
    tileRight.height = 8;

    tileRight.x += 16 * step;
    tileRight.y -= 24 + 8 * step;

    const leftBorder = this.createStairSprite(getLeftMatrix(0, 0, { width: 32, height: 8 }), 0x838357, texture);
    leftBorder.width = 32 - 8 * step;
    leftBorder.height = 8;

    leftBorder.x += 8 * step;
    leftBorder.y -= 24 + 12 * step;

    const rightBorder = this.createStairSprite(getRightMatrix(0, 0, { width: 8, height: 8 }), 0x666644, texture);
    rightBorder.width = 8;
    rightBorder.height = 8;

    rightBorder.x += 8 * step;
    rightBorder.y -= 24 + 12 * step;

    leftTile.zIndex = 0;
    tileRight.zIndex = 1;
    leftBorder.zIndex = 500;

    if (step < 3) {
      this.container.addChild(leftTile);
    }
    this.container.addChild(tileRight);
    this.container.addChild(leftBorder);
    this.container.addChild(rightBorder);
  }

  public async createStairUp(index: number) {
    let baseX = +STAIR_HEIGHT * index;
    let baseY = -STAIR_HEIGHT * index * 1.5;

    const texture = await AssetManager.getFloor("floor_texture_64_0_floor_basic");

    const tile = this.createStairSprite(getFloorMatrix(baseX, baseY), 0x999966, texture);
    tile.width = 32;
    tile.height = 8;

    // 8 because of one step offset and minus 32 due to the offset needed for the tile height
    tile.y += 8 - 32;

    const borderLeft = this.createStairSprite(getLeftMatrix(baseX, baseY, { width: 32, height: 8 }), 0x838357, texture);

    borderLeft.width = 32;
    borderLeft.height = 8;

    // 8 because of one step offset
    borderLeft.y += 8 - 32;

    const borderRight = this.createStairSprite(getRightMatrix(baseX, baseY, { width: 8, height: 8 }), 0x666644, texture);
    borderRight.width = 8;
    borderRight.height = 8;
    borderRight.y += 8 - 32;

    this.container.addChild(tile);
    this.container.addChild(borderLeft);
    this.container.addChild(borderRight);
  }
}

export default Stair;
