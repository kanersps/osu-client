import GameState from "../../state/Game";

class IsoMath {
  // Don't change these values!
  static TILE_WIDTH = 32;
  static TILE_HEIGHT = 32;
  static WALL_WIDTH = 32;
  static WALL_DEPTH = 6;
  static WALL_HEIGHT = 120;
  static TILE_DEPTH = 8;

  // Calculate the screen coordinates of a given world position
  static worldToScreenCoord(x: number, y: number) {
    const screenXCoord = (x - y) * this.TILE_WIDTH;
    const screenYCoord = (x + y) * this.TILE_HEIGHT / 2;

    return { x: screenXCoord, y: screenYCoord };
  }
  
  // Calculate the world coordinates of a given screen position
  static screenToWorldCoord(x: number, y: number) {
    x = x - GameState.cameraOffsetX;
    y = y - GameState.cameraOffsetY;
    const TILE_WIDTH_HALF = this.TILE_WIDTH;
    const TILE_HEIGHT_HALF = this.TILE_HEIGHT / 2;

    const worldXCoord = (x / TILE_WIDTH_HALF + y / TILE_HEIGHT_HALF) /2;
    const worldYCoord = (y / TILE_HEIGHT_HALF -(x / TILE_WIDTH_HALF)) /2;

    return { x: Math.ceil(worldXCoord), y: Math.floor(worldYCoord) };
  }
}

export default IsoMath;