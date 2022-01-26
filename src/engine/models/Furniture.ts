import { Container, Sprite } from "pixi.js";
import FurnitureAsset from "../assets/FurnitureAsset";

class Furniture {
  // We keep track of sprites to be able to remove them from a room
  public container: Container = new Container();
  public sprites: Sprite[] = [];

  constructor(public id: string, public x: number, public y: number, public z: number, public rotation: number, private asset: FurnitureAsset, public uniqueId: number) {}

  public async draw() {
    this.sprites = this.asset.drawInWorld(this.container, this.rotation, this.x, this.y, this.z);
  }

  public getFirstRotation() {
    return this.asset.rotations[0];
  }

  public isRotationPossible(rotation: number) {
    return this.asset.rotations.includes(rotation);
  }

  public getDimensions() {
    // Raw dimensions without rotation applied
    let dimensions = Object.assign({}, this.asset.dimensions);

    // 0 == up
    // 1 == right
    // 2 == down
    // 3 == left

    const rotationId = this.asset.rotations.findIndex((r) => r === this.rotation);

    if (this.asset.possibleDirections[rotationId] !== 0) {
      if (this.asset.possibleDirections[rotationId] === 90 && !this.asset.assets[this.rotation][0].flipH) {
        dimensions.x = this.asset.dimensions.y;
        dimensions.y = this.asset.dimensions.x;
      }
    }

    return dimensions;
  }
}

export default Furniture;
