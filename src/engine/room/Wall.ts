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

  public async add(x: number, y: number, z: number, type: WallSide) {
    if (type === WallSide.LEFT) {
      const leftWall = await this.LeftWall(x, y, z);
      const leftBorder = await this.LeftBorder(x, y, z);
      const topBorder = await this.LeftTopBorder(x, y, z);

      this.container.addChild(leftWall);
      this.container.addChild(leftBorder);

      leftWall.x += this.offsetX;
      leftWall.y += this.offsetY;
      leftBorder.x += this.offsetX;
      leftBorder.y += this.offsetY;

      topBorder.forEach((sprite) => {
        sprite.x += this.offsetX;
        sprite.y += this.offsetY;
        this.container.addChild(sprite);
      });
    } else if (type === WallSide.RIGHT) {
      const rightWall = await this.RightWall(x, y, z);
      const rightBorder = await this.RightBorder(x, y, z);
      const topBorder = await this.RightTopBorder(x, y, z);

      this.container.addChild(rightWall);
      this.container.addChild(rightBorder);

      rightWall.x += this.offsetX;
      rightWall.y += this.offsetY;
      rightBorder.x += this.offsetX;
      rightBorder.y += this.offsetY;

      topBorder.forEach((sprite) => {
        sprite.x += this.offsetX;
        sprite.y += this.offsetY;
        this.container.addChild(sprite);
      });
    }
  }

  public async initialize(container: Container, startX: number, startY: number, height: number, width: number) {}

  private async RightTopBorder(x: number, y: number, z: number): Promise<TilingSprite[]> {
    const rightTopBorder = new TilingSprite(Texture.WHITE, 1 * IsoMath.TILE_HEIGHT + IsoMath.WALL_DEPTH, IsoMath.WALL_DEPTH);

    // Convert X and Y to isometric coords
    const coords = IsoMath.worldToScreenCoord(x, y, z);

    rightTopBorder.transform.setFromMatrix(new Matrix(1, 0.5, 1, -0.5));
    rightTopBorder.anchor.x = 1;
    rightTopBorder.anchor.y = 0;
    rightTopBorder.y = coords.y - IsoMath.WALL_HEIGHT;
    rightTopBorder.x = coords.x + 64;
    rightTopBorder.tint = 0x808080;

    return [rightTopBorder];
  }

  private async LeftTopBorder(x: number, y: number, z: number): Promise<TilingSprite[]> {
    // TEXTURE, WIDTH, HEIGHT
    const leftTopBorder = new TilingSprite(Texture.WHITE, IsoMath.WALL_DEPTH, 1 * IsoMath.TILE_HEIGHT);

    // Convert X and Y to isometric coords
    const coords = IsoMath.worldToScreenCoord(x, y, z);

    leftTopBorder.transform.setFromMatrix(new Matrix(1, 0.5, 1, -0.5));
    leftTopBorder.anchor.x = 1;
    leftTopBorder.anchor.y = 0;
    leftTopBorder.y = coords.y - IsoMath.WALL_HEIGHT;
    leftTopBorder.x = coords.x;
    leftTopBorder.tint = 0x808080;

    return [leftTopBorder];
  }

  private async LeftWall(x: number, y: number, z: number): Promise<TilingSprite> {
    // TEXTURE, WIDTH, HEIGHT
    const sprite = new TilingSprite(Texture.WHITE, IsoMath.TILE_WIDTH, IsoMath.WALL_HEIGHT);

    sprite.transform.setFromMatrix(new Matrix(-1, 0.5, 0, 1));
    sprite.anchor.x = 1;
    sprite.anchor.y = 0;

    // Default wall color
    sprite.tint = 0xa0a0a0;

    // Convert X and Y to isometric coords
    const coords = IsoMath.worldToScreenCoord(x, y, 0);
    sprite.x = coords.x;
    sprite.y = coords.y - z * IsoMath.TILE_HEIGHT - IsoMath.WALL_HEIGHT;

    return sprite;
  }

  private async LeftBorder(x: number, y: number, z: number): Promise<TilingSprite> {
    // TEXTURE, WIDTH, HEIGHT
    const sprite = new TilingSprite(Texture.WHITE, IsoMath.WALL_DEPTH, IsoMath.WALL_HEIGHT + IsoMath.TILE_DEPTH);

    // Convert X and Y to isometric coords
    const coords = IsoMath.worldToScreenCoord(x, y, z);

    sprite.transform.setFromMatrix(new Matrix(-1, -0.5, 0, 1));
    sprite.anchor.x = 0;
    sprite.anchor.y = 1;
    sprite.y = coords.y + IsoMath.TILE_DEPTH;
    sprite.x = coords.x;
    sprite.tint = 0xc8c8c8;

    return sprite;
  }

  private async RightBorder(x: number, y: number, z: number): Promise<TilingSprite> {
    // TEXTURE, WIDTH, HEIGHT
    const sprite = new TilingSprite(Texture.WHITE, IsoMath.WALL_DEPTH, IsoMath.WALL_HEIGHT + IsoMath.TILE_DEPTH);

    // Convert X and Y to isometric coords
    const coords = IsoMath.worldToScreenCoord(x, y, z);

    sprite.transform.setFromMatrix(new Matrix(-1, 0.5, 0, 1));
    sprite.anchor.x = 1;
    sprite.anchor.y = 0;

    sprite.y = coords.y - IsoMath.WALL_HEIGHT;
    sprite.x = coords.x + 64;

    sprite.tint = 0xa0a0a0;

    return sprite;
  }

  private async RightWall(x: number, y: number, z: number): Promise<TilingSprite> {
    // TEXTURE, WIDTH, HEIGHT
    const sprite = new TilingSprite(Texture.WHITE, 32, IsoMath.WALL_HEIGHT);

    sprite.transform.setFromMatrix(new Matrix(1, 0.5, 0, 1));
    sprite.anchor.x = 1;
    sprite.anchor.y = 0;

    // Default wall color
    sprite.tint = 0xc8c8c8;

    // Convert X and Y to isometric coords
    const coords = IsoMath.worldToScreenCoord(x, y, z);
    sprite.x = coords.x + 64;
    sprite.y = coords.y - IsoMath.WALL_HEIGHT;

    return sprite;
  }
}
