import { Container, Matrix, Texture, TilingSprite } from "pixi.js";
import AssetManager from "../assets/AssetManager";
import { getFloorMatrix, getLeftMatrix, getRightMatrix } from "./util/Matrix";

export type addTiles = { x: number; y: number; height: number; stairs: number };

const STAIR_HEIGHT = 8;

class Stair {
  public container: Container = new Container();

  constructor(orientation: number, height: number) {
    for (let i = 0; i < 4; i++) {
      switch (orientation) {
        case 1:
          this.createStairUp(height, 3 - i);
          break;
        case 2:
          this.createStairLeft(height, 3 - i);
          break;
        case 3:
          this.createStairRight(height, 3 - i);
          break;
        case 6:
          this.createStairUpLeft(height, 3 - i);
          break;
        case 7:
          this.createStairUpRight(height, 3 - i);
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
    tile.anchor.set(1);

    tile.tilePosition.x = 0;
    tile.tilePosition.y = 0;

    tile.transform.setFromMatrix(matrix);

    tile.tint = tint;

    return tile;
  }

  public async createStairRight(height: number, index: number) {
    let baseX = -STAIR_HEIGHT * index;
    let baseY = -STAIR_HEIGHT * index * 1.5;

    this.container.sortableChildren = true;

    const baseXRight = 0;
    const baseYRight = -STAIR_HEIGHT * index * 1.5;

    const texture = await AssetManager.getFloor("floor_texture_64_0_floor_basic");

    
    if(index === 0) {
        const tileLeft = this.createStairSprite(getFloorMatrix(baseXRight + 32 - STAIR_HEIGHT, baseYRight + STAIR_HEIGHT * 1.5), 0x999966, texture);

        tileLeft.width = 8;
        tileLeft.height = 32;

        tileLeft.x -= 32 + 16;
        tileLeft.y -= 40;
        this.container.zIndex = height;
        this.container.addChild(tileLeft);
    }

    const borderLeft = this.createStairSprite(getLeftMatrix(baseX + 32 - STAIR_HEIGHT, baseY + STAIR_HEIGHT * 1.5, { width: STAIR_HEIGHT, height: STAIR_HEIGHT}), 0x838357, texture);
    borderLeft.width = STAIR_HEIGHT;
    borderLeft.height = STAIR_HEIGHT;
    
    borderLeft.x += index * 16;
    borderLeft.y += index * 8;

    borderLeft.x -= 96;
    borderLeft.y -= 24;
    borderLeft.zIndex = height;

    this.container.zIndex = height - 1;

    this.container.addChild(borderLeft)
  }

  public async createStairLeft(height: number, index: number) {
    let baseX = -STAIR_HEIGHT * index;
    let baseY = -STAIR_HEIGHT * index * 1.5;
    
    const texture = await AssetManager.getFloor("floor_texture_64_0_floor_basic");

    const tile = this.createStairSprite(getFloorMatrix(baseX + 32 - STAIR_HEIGHT, baseY + STAIR_HEIGHT * 1.5), 0x999966, texture);
    tile.width = STAIR_HEIGHT;
    tile.height = 32;
    tile.x -= 24;
    tile.y -= 32 + 4;

    tile.y += 8

    const borderLeft = this.createStairSprite(getLeftMatrix(baseX + 32 - STAIR_HEIGHT, baseY + STAIR_HEIGHT * 1.5, { width: STAIR_HEIGHT, height: STAIR_HEIGHT}), 0x838357, texture);
    borderLeft.width = STAIR_HEIGHT;
    borderLeft.height = STAIR_HEIGHT;
    
    borderLeft.x -= 64 + 8;
    borderLeft.y -= 12;

    const borderRight = this.createStairSprite(getRightMatrix(baseX, baseY, { width: 32, height: STAIR_HEIGHT }), 0x666644, texture);
    borderRight.width = 32;
    borderRight.height = STAIR_HEIGHT;
    borderRight.x -= 96;
    borderRight.y += 8;

    this.container.addChild(borderLeft);
    this.container.addChild(borderRight);
    this.container.addChild(tile);
  }

  public async createStairUpLeft(height: number, index: number) {
    let baseXLeft = +STAIR_HEIGHT * index;
    let baseYLeft = -STAIR_HEIGHT * index * 1.5;

    const baseXRight = 0;
    const baseYRight = -STAIR_HEIGHT * index * 1.5;

    const texture = await AssetManager.getFloor("floor_texture_64_0_floor_basic");

    const tileLeft = this.createStairSprite(getFloorMatrix(baseXLeft, baseYLeft), 0x999966, texture);

    tileLeft.width = 32 - 8 * index;
    tileLeft.height = 8;

    tileLeft.x -= 48 - ((3 - index) * 8);
    tileLeft.y -= 24 - ((3 - index) * 8) / 2;
    tileLeft.y += 8;

    const tileRight = this.createStairSprite(getFloorMatrix(baseXRight + 32 - STAIR_HEIGHT, baseYRight + STAIR_HEIGHT * 1.5), 0x999966, texture);

    tileRight.width = 8;
    tileRight.height = 32 - 8 * index;

    tileRight.x -= 24 + (( index) * 8);
    tileRight.y -= 32 + 4;
    tileRight.y += 8;

    const borderLeft = this.createStairSprite(getLeftMatrix(baseXLeft - 8 * index, baseYLeft - 8 * index * 0.5, { width: 32, height: STAIR_HEIGHT}) , 0x838357, texture);
    borderLeft.width = 32 - 8 * index;
    borderLeft.height = STAIR_HEIGHT;
    
    borderLeft.x -= 72 + ((3 - index) * 8);
    borderLeft.y -= 20 + ((3 - index) * 8) / 2;
    borderLeft.y += 8;

    const borderRight = this.createStairSprite(getRightMatrix(baseXRight - STAIR_HEIGHT * index, -STAIR_HEIGHT * index * 1.5, {width: 32, height: STAIR_HEIGHT}), 0x666644, texture);

    borderRight.width = 32 - 8 * index;
    borderRight.height = STAIR_HEIGHT;

    
    borderRight.x -= 72 + ((3 - index) * 8);
    borderRight.y -= 12 - ((3 - index) * 8) / 2;
    borderRight.y += 8;

    this.container.addChild(tileLeft);
    this.container.addChild(tileRight);
    this.container.addChild(borderRight);
    this.container.addChild(borderLeft);
  }

  public async createStairUpRight(height: number, index: number) {
    let baseXLeft = +STAIR_HEIGHT * index;
    let baseYLeft = -STAIR_HEIGHT * index * 1.5;

    this.container.sortableChildren = true;

    const baseXRight = 0;
    const baseYRight = -STAIR_HEIGHT * index * 1.5;

    const texture = await AssetManager.getFloor("floor_texture_64_0_floor_basic");

    
    if(index === 0) {
      const tileLeft = this.createStairSprite(getFloorMatrix(baseXRight + 32 - STAIR_HEIGHT, baseYRight + STAIR_HEIGHT * 1.5), 0x999966, texture);

      tileLeft.width = 8;
      tileLeft.height = 64;

      tileLeft.x -= 32 - 20;
      tileLeft.y -= 58;
      this.container.addChild(tileLeft);
      
      const borderLeftBotom = this.createStairSprite(getLeftMatrix(baseXLeft - 8 * index, baseYLeft - 8 * index * 0.5, { width: 32, height: STAIR_HEIGHT}) , 0x838357, texture);
      borderLeftBotom.width = 32;
      borderLeftBotom.height = STAIR_HEIGHT;

      borderLeftBotom.x -= 96;
      borderLeftBotom.y -= 24;

      borderLeftBotom.zIndex = 200;
      this.container.addChild(borderLeftBotom)
    }



    const tileRight = this.createStairSprite(getFloorMatrix(baseXLeft, baseYLeft), 0x999966, texture);

    tileRight.width = 32 - 8 * index;
    tileRight.height = 8;

    tileRight.x -= 24;
    tileRight.y -= 12;
    tileRight.y += 8;    
    tileRight.zIndex = 100;

    const borderLeft = this.createStairSprite(getLeftMatrix(baseXLeft - 8 * index, baseYLeft - 8 * index * 0.5, { width: 32, height: STAIR_HEIGHT}) , 0x838357, texture);
    borderLeft.width = 32 - 8 * index - 8;
    borderLeft.height = STAIR_HEIGHT;
    borderLeft.zIndex = 200;

    borderLeft.anchor.set(0)
    
    borderLeft.x -= 48 + 8 - ((index) * 8);
    borderLeft.y -= 24 + 4 - ((index) * 8) / 2;

    
    const borderRight = this.createStairSprite(getRightMatrix(baseXRight - STAIR_HEIGHT * index, -STAIR_HEIGHT * index * 1.5, {width: 32, height: STAIR_HEIGHT}), 0x666644, texture);

    borderRight.width = 8;
    borderRight.height = 8;

    borderRight.anchor.set(0)
    borderRight.x -= 88 - ((index) * 8) - (index * 8);
    borderRight.y -= 32;
    borderRight.y += 28

    this.container.addChild(tileRight);
    this.container.addChild(borderRight);
    this.container.addChild(borderLeft);
  }

  public async createStairUp(height: number, index: number) {
    let baseX = +STAIR_HEIGHT * index;
    let baseY = -STAIR_HEIGHT * index * 1.5;

    const texture = await AssetManager.getFloor("floor_texture_64_0_floor_basic");

    const tile = this.createStairSprite(getFloorMatrix(baseX, baseY), 0x999966, texture);
    tile.width = 32;
    tile.height = 8;

    // This works somehow?! why the fuck are these "random" offsets needed
    tile.x -= 24;
    tile.y -= 12;
    tile.y += 8;

    const borderLeft = this.createStairSprite(getLeftMatrix(baseX, baseY, { width: 32, height: 8 }), 0x838357, texture);

    borderLeft.width = 32;
    borderLeft.height = 8;

    // I don't want to live anymore
    borderLeft.x -= 96;
    borderLeft.y -= 32;
    borderLeft.y += 8;

    const borderRight = this.createStairSprite(getRightMatrix(baseX, baseY, { width: 8, height: 8 }), 0x666644, texture);
    borderRight.width = 8;
    borderRight.height = 8;
    borderRight.x -= 80 - 8;
    borderRight.y -= 16 - 4;
    borderRight.y += 8;

    this.container.addChild(tile);
    this.container.addChild(borderLeft);
    this.container.addChild(borderRight);
  }
}

export default Stair;
