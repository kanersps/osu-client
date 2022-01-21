import { Container, Matrix, Texture, TilingSprite } from "pixi.js";
import GameState from "../state/Game";
import IsoMath from "./util/Math";

export default class Wall {
  public async initialize(container: Container, width: number, height: number) {
    
    // Loop through width & height
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        if (x === 0 ) {
          const leftWall = await this.LeftWall(x, y);
          container.addChild(leftWall);
        }
    
        if(y === 0) {
          const rightWall = await this.RightWall(x, y);
          container.addChild(rightWall);
        }
      }
    }

    // Draw borders, we do -1 due to the fact that the walls are 1 tile smaller than the tiles
    const leftBorder = await this.LeftBorder(0, height - 1);
    container.addChild(leftBorder);

    const rightBorder = await this.RightBorder(width - 1, 0);
    container.addChild(rightBorder);

    const topBorder = await this.TopBorder(height, width);

    // Add all borders
    container.addChild(...topBorder);
  }

  private async TopBorder(height: number, width: number): Promise<TilingSprite[]> {
    // TEXTURE, WIDTH, HEIGHT
    const leftTopBorder = new TilingSprite(Texture.WHITE, IsoMath.WALL_DEPTH, height * IsoMath.TILE_HEIGHT);

    // Convert X and Y to isometric coords
    const coords = IsoMath.worldToScreenCoord(0 - 1, 0);

    leftTopBorder.transform.setFromMatrix((new Matrix(1, 0.5, 1, -0.5)));
    leftTopBorder.anchor.x = 1;
    leftTopBorder.anchor.y = 1;
    leftTopBorder.y = coords.y + GameState.cameraOffsetY - IsoMath.WALL_HEIGHT;
    leftTopBorder.x = coords.x + GameState.cameraOffsetX;
    leftTopBorder.tint = 0x808080;

    // TEXTURE, WIDTH, HEIGHT
    const rightTopBorder = new TilingSprite(Texture.WHITE, width * IsoMath.TILE_HEIGHT + IsoMath.WALL_DEPTH, IsoMath.WALL_DEPTH);

    rightTopBorder.transform.setFromMatrix((new Matrix(1, 0.5, 1, -0.5)));
    rightTopBorder.anchor.x = 1;
    rightTopBorder.anchor.y = 1;
    rightTopBorder.y = coords.y + GameState.cameraOffsetY - IsoMath.WALL_HEIGHT + (height * IsoMath.TILE_HEIGHT) / 2 - IsoMath.WALL_DEPTH / 2;
    rightTopBorder.x = coords.x + GameState.cameraOffsetX + (height * IsoMath.TILE_HEIGHT) + IsoMath.WALL_DEPTH;
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
    sprite.tint = 0xA0A0A0;
    
    // Convert X and Y to isometric coords
    const coords = IsoMath.worldToScreenCoord(x, y);
    sprite.x = coords.x + GameState.cameraOffsetX - 64;
    sprite.y = coords.y + GameState.cameraOffsetX;

    return sprite;
  }

  private async LeftBorder(x: number, y: number) : Promise<TilingSprite> {
    // TEXTURE, WIDTH, HEIGHT
    const sprite = new TilingSprite(Texture.WHITE, IsoMath.WALL_DEPTH, IsoMath.WALL_HEIGHT + IsoMath.TILE_DEPTH);

    // Convert X and Y to isometric coords
    const coords = IsoMath.worldToScreenCoord(x - 1, y + 1);

    sprite.transform.setFromMatrix(new Matrix(-1, -0.5, 0, 1));
    sprite.anchor.x = 0;
    sprite.anchor.y = 1;
    sprite.y = coords.y + GameState.cameraOffsetX + IsoMath.TILE_DEPTH;
    sprite.x = coords.x + GameState.cameraOffsetX;
    sprite.tint = 0xC8C8C8;

    return sprite;
  }

  private async RightBorder(x: number, y: number) : Promise<TilingSprite> {
    // TEXTURE, WIDTH, HEIGHT
    const sprite = new TilingSprite(Texture.WHITE, IsoMath.WALL_DEPTH, IsoMath.WALL_HEIGHT + IsoMath.TILE_DEPTH);

    // Convert X and Y to isometric coords
    const coords = IsoMath.worldToScreenCoord(x, y);

    sprite.transform.setFromMatrix(new Matrix(-1, 0.5, 0, 1));
    sprite.anchor.x = 1;
    sprite.anchor.y = 1;
    sprite.y = coords.y + GameState.cameraOffsetX + IsoMath.TILE_DEPTH;
    sprite.x = coords.x + GameState.cameraOffsetX;
    sprite.tint = 0xA0A0A0;
  
    return sprite;
  }

  private async RightWall(x: number, y: number): Promise<TilingSprite> {
    // TEXTURE, WIDTH, HEIGHT
    const sprite = new TilingSprite(Texture.WHITE, 32, 120);

    sprite.transform.setFromMatrix(new Matrix(1, 0.5, 0, 1));
    sprite.anchor.x = 1;
    sprite.anchor.y = 1;

    // Default wall color
    sprite.tint = 0xC8C8C8;
    
    // Convert X and Y to isometric coords
    const coords = IsoMath.worldToScreenCoord(x, y);
    sprite.x = coords.x + GameState.cameraOffsetX;
    sprite.y = coords.y + GameState.cameraOffsetX;

    return sprite;
  }
}