import { Container, Matrix, Texture, TilingSprite } from "pixi.js";
import GameState from "../state/Game";
import IsoMath from "./util/Math";

export enum WallSide {
  LEFT,
  RIGHT,
}

export default class Wall {
  public container: Container = new Container();

  constructor(private offsetX: number, private offsetY: number) {}

  public async add(x: number, y: number, type: WallSide) {
    const leftWall = await this.LeftWall(x, y);
    this.container.addChild(leftWall);

    leftWall.x += this.offsetX;
    leftWall.y += this.offsetY;
  }

  public async initialize(container: Container, startX: number, startY: number, height: number, width: number) {
    const wallSprites: TilingSprite[] = [];

    // Loop through width & height
    /*
    let y = 0;
    for (let x = startX; x < width; x++) {
      console.log("X!");
      if (x === startX) {
        console.log("ADDING!");
        const leftWall = await this.LeftWall(x, y + 1);
        wallSprites.push(leftWall);
        container.addChild(leftWall);
      }

      for (y = startY; y < height; y++) {
        if (y === startY) {
          const rightWall = await this.RightWall(x, y);
          wallSprites.push(rightWall);
          container.addChild(rightWall);
        }
      }
    }


    // Draw borders, we do -1 due to the fact that the walls are 1 tile smaller than the tiles
    const leftBorder = await this.LeftBorder(0, height - 1);
    container.addChild(leftBorder);
    wallSprites.push(leftBorder);

    const rightBorder = await this.RightBorder(width - 1, 0);
    container.addChild(rightBorder);
    wallSprites.push(rightBorder);

    const topBorder = await this.TopBorder(height, width);

    // Add all borders
    container.addChild(...topBorder);

    wallSprites.push(...topBorder);

    // Return all the sprites, so that the room can set the camera offset to them
    return wallSprites;
    */
  }

  private async TopBorder(height: number, width: number): Promise<TilingSprite[]> {
    // TEXTURE, WIDTH, HEIGHT
    const leftTopBorder = new TilingSprite(Texture.WHITE, IsoMath.WALL_DEPTH, height * IsoMath.TILE_HEIGHT);

    // Convert X and Y to isometric coords
    const coords = IsoMath.worldToScreenCoord(0 - 1, 0, 0);

    leftTopBorder.transform.setFromMatrix(new Matrix(1, 0.5, 1, -0.5));
    leftTopBorder.anchor.x = 1;
    leftTopBorder.anchor.y = 1;
    leftTopBorder.y = coords.y - IsoMath.WALL_HEIGHT;
    leftTopBorder.x = coords.x;
    leftTopBorder.tint = 0x808080;

    // TEXTURE, WIDTH, HEIGHT
    // Also a shit ton of math upcoming
    const rightTopBorder = new TilingSprite(Texture.WHITE, width * IsoMath.TILE_HEIGHT + IsoMath.WALL_DEPTH, IsoMath.WALL_DEPTH);

    rightTopBorder.transform.setFromMatrix(new Matrix(1, 0.5, 1, -0.5));
    rightTopBorder.anchor.x = 1;
    rightTopBorder.anchor.y = 1;
    rightTopBorder.y = coords.y - IsoMath.WALL_HEIGHT + (width * IsoMath.TILE_HEIGHT) / 2 - IsoMath.WALL_DEPTH / 2;
    rightTopBorder.x = coords.x + width * IsoMath.TILE_HEIGHT + IsoMath.WALL_DEPTH;
    rightTopBorder.tint = 0x808080;

    return [leftTopBorder, rightTopBorder];
  }

  private async LeftWall(x: number, y: number): Promise<TilingSprite> {
    // TEXTURE, WIDTH, HEIGHT
    const sprite = new TilingSprite(Texture.WHITE, IsoMath.TILE_WIDTH, IsoMath.WALL_HEIGHT);

    sprite.transform.setFromMatrix(new Matrix(-1, 0.5, 0, 1));
    sprite.anchor.x = 1;
    sprite.anchor.y = 1;

    // Default wall color
    sprite.tint = 0xa0a0a0;

    // Convert X and Y to isometric coords
    const coords = IsoMath.worldToScreenCoord(x, y, 0);
    sprite.x = coords.x - 64;
    sprite.y = coords.y;

    return sprite;
  }

  private async LeftBorder(x: number, y: number): Promise<TilingSprite> {
    // TEXTURE, WIDTH, HEIGHT
    const sprite = new TilingSprite(Texture.WHITE, IsoMath.WALL_DEPTH, IsoMath.WALL_HEIGHT + IsoMath.TILE_DEPTH);

    // Convert X and Y to isometric coords
    const coords = IsoMath.worldToScreenCoord(x - 1, y + 1, 0);

    sprite.transform.setFromMatrix(new Matrix(-1, -0.5, 0, 1));
    sprite.anchor.x = 0;
    sprite.anchor.y = 1;
    sprite.y = coords.y + IsoMath.TILE_DEPTH;
    sprite.x = coords.x;
    sprite.tint = 0xc8c8c8;

    return sprite;
  }

  private async RightBorder(x: number, y: number): Promise<TilingSprite> {
    // TEXTURE, WIDTH, HEIGHT
    const sprite = new TilingSprite(Texture.WHITE, IsoMath.WALL_DEPTH, IsoMath.WALL_HEIGHT + IsoMath.TILE_DEPTH);

    // Convert X and Y to isometric coords
    const coords = IsoMath.worldToScreenCoord(x, y, 0);

    sprite.transform.setFromMatrix(new Matrix(-1, 0.5, 0, 1));
    sprite.anchor.x = 1;
    sprite.anchor.y = 1;
    sprite.y = coords.y + IsoMath.TILE_DEPTH;
    sprite.x = coords.x;
    sprite.tint = 0xa0a0a0;

    return sprite;
  }

  private async RightWall(x: number, y: number): Promise<TilingSprite> {
    // TEXTURE, WIDTH, HEIGHT
    const sprite = new TilingSprite(Texture.WHITE, 32, 120);

    sprite.transform.setFromMatrix(new Matrix(1, 0.5, 0, 1));
    sprite.anchor.x = 1;
    sprite.anchor.y = 1;

    // Default wall color
    sprite.tint = 0xc8c8c8;

    // Convert X and Y to isometric coords
    const coords = IsoMath.worldToScreenCoord(x, y, 0);
    sprite.x = coords.x;
    sprite.y = coords.y;

    return sprite;
  }
}
