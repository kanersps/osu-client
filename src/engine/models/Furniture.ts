import { Sprite } from "pixi.js";
import FurnitureAsset from "../assets/FurnitureAsset";
import GameState from "../state/Game";

class Furniture {
  // We keep track of sprites to be able to remove them from a room
  public sprites: Sprite[] = [];

  constructor(public x: number, public y: number, public z: number, public rotation: number, private asset: FurnitureAsset) { }

  public async draw() {
    this.sprites = this.asset.drawInWorld(GameState.CurrentRoom.container, 0, this.x, this.y, this.z);
  }
}

export default Furniture;