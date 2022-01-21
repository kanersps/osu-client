import { Container, Sprite } from "pixi.js";
import FurnitureAsset from "../assets/FurnitureAsset";
import GameState from "../state/Game";

class Furniture {
  // We keep track of sprites to be able to remove them from a room
  public sprites: Sprite[] = [];

  constructor(public x: number, public y: number, public z: number, public rotation: number, private asset: FurnitureAsset) { }

  public async draw(container: Container) {
    this.sprites = this.asset.drawInWorld(container, this.rotation, this.x, this.y, this.z);
  }

  public getDimensions() {
    // Raw dimensions without rotation applied
    let dimensions = Object.assign({}, this.asset.dimensions);

    // 0 == up
    // 1 == right
    // 2 == down
    // 3 == left

    const rotationId = this.asset.rotations.findIndex(r => r === this.rotation);
    
    console.log("ROTATION: " + this.rotation);
    console.log("Assets: ");
    console.log(this.asset.rotations);
    if (this.asset.possibleDirections[rotationId] !== 0) {
      if(this.asset.possibleDirections[rotationId] === 90 && !this.asset.assets[this.rotation][0].flipH) {
        dimensions.x = this.asset.dimensions.y;
        dimensions.y = this.asset.dimensions.x;
      }
    } else {
      if(this.asset.assets[this.rotation][0].flipH) {
        console.log("Flip the H!")
      }
    }

    console.log(dimensions)

    return dimensions;
  }
}

export default Furniture;