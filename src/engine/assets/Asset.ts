import { Texture } from "pixi.js";

class Asset {
  constructor(public name: string, public x: number, public y: number, public texture: Texture, public flipH: string | boolean, public flipV: string | boolean, public part: string, public source: string) {}
}

export default Asset;