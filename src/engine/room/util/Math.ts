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
}

export default IsoMath;