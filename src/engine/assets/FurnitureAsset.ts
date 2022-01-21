import * as zip from "@zip.js/zip.js";
import { XMLParser } from "fast-xml-parser";
import Asset from "./Asset";
import { Container, Texture, Sprite } from "pixi.js";
import GameState from "../state/Game";

class FurnitureAsset {
  assets: { [rotation: number]: Asset[] } = {};
  height: number = 10;
  rotations: number[] = [];

  constructor(private entries: zip.Entry[]) {}

  public hasRotation(rotation: number) {
    return this.rotations.includes(rotation);
  }

  drawInWorld(container: Container, rotation: number, x: number, y: number, z: number): Sprite[] {
    const TILE_WIDTH = 32;
    const TILE_HEIGHT = 32;

    // X and Y to isometric coords
    const screenXCoord = (x - y) * TILE_WIDTH;
    const screenYCoord = (x + y) * TILE_HEIGHT / 2;

    const sprites: Sprite[] = [];

    if (this.assets[rotation]) {
      this.assets[rotation].forEach(asset => {
        const sprite = new Sprite(asset.texture);
        sprite.anchor.set(0);
        sprite.x = -asset.x + screenXCoord - 32;
        sprite.y = -asset.y + screenYCoord;

        if(asset.flipH) {
          sprite.scale.x *= -1;
          sprite.anchor.x = 1;
          sprite.x = asset.x - asset.texture.width + screenXCoord - 32;
        }

        if(asset.flipV) {
          sprite.scale.y *= -1;
          sprite.anchor.y = 1;
          sprite.y = asset.y - asset.texture.height + screenYCoord;
        }

        sprite.y -= z * TILE_HEIGHT;

        // Draw shadow properly
        if(asset.name.includes("sd")) {
          sprite.alpha = 0.2;
        }

        sprites.push(sprite);
        container.addChild(sprite);
      });
    }

    return sprites;
  }

  drawAt(container: Container, rotation: number, x: number, y: number) {
    if (this.assets[rotation]) {
      this.assets[rotation].forEach(asset => {
        const sprite = new Sprite(asset.texture);
        sprite.anchor.set(0);
        sprite.x = -asset.x + x;
        sprite.y = -asset.y + y;

        if(asset.flipH) {
          sprite.scale.x *= -1;
          sprite.anchor.x = 1;
          sprite.x = asset.x - asset.texture.width + x;
        }

        if(asset.flipV) {
          sprite.scale.y *= -1;
          sprite.anchor.y = 1;
          sprite.y = asset.y - asset.texture.height + y;
        }

        container.addChild(sprite);
      });
    }
  }

  async load() {
    const entries = this.entries;

    // First find data for this furni
    // Contained in FURNINAME_assets.xml
    const furniData = entries.find(entry => entry.filename.endsWith("_assets.xml"));

    // Read asset data from XML
    if (furniData?.getData) {
      const xml = await furniData.getData(new zip.TextWriter());

      const parser = new XMLParser({ ignoreAttributes : false, attributeNamePrefix : "" });
      let obj = parser.parse(xml);

      obj.assets.asset.forEach((asset: Asset) => {
        // Dirty check to see if the resolution isn't 32
        // And ignore the icon
        if (!asset.name.includes("_32_") && !asset.name.includes("icon")) {
          // Grab second to last (which is the rotation in the name)
          const rotation = parseInt(asset.name.split("_")[asset.name.split("_").length - 2]);
          
          // Grab third to last (which is the part in the name, like sd = shadow, a = part A, b = part B, etc)
          const part = asset.name.split("_")[asset.name.split("_").length - 3];

          asset.part = part;

          if (!this.assets[rotation]) {
            this.assets[rotation] = [];
          }

          // Push it to the assets array
          this.assets[rotation].push(asset);

          // Add rotation to rotations array
          if (!this.rotations.includes(rotation)) {
            this.rotations.push(rotation);
          }
        }

      });
    }

    for (const entry of entries) {
      if(entry.getData) {
        // Check if the file is a texture
        // And a dirty check to see if it's the "right" resolution (eg 64 instead of 32)
        if (entry.filename.endsWith("png") && !entry.filename.includes("32")) {
          const nameWithoutPng = entry.filename.split(".")[0];

          let blob = await entry.getData(new zip.Data64URIWriter());
          const rotation = parseInt(entry.filename.split("_")[entry.filename.split("_").length - 2]);
          const part = entry.filename.split("_")[entry.filename.split("_").length - 3];

          blob = blob.replace("data:;base64,", "data:image/png;base64,");

          // Add texture to existing asset
          if (this.assets[rotation]) {
            this.assets[rotation].forEach(asset => {
              if (asset.part === part) {
                asset.texture = Texture.from(blob);
              }
            });
          }

          // Or check based on source
          // Go through all assets
          for (const rotation in this.assets) {

            // Go through all assets on this rotation

            for (const asset of this.assets[rotation]) {
              // Check if asset source equals nameWithoutPng then set the texture to it
              if (asset.source === nameWithoutPng) {
                asset.texture = Texture.from(blob);
              }
            }
          }
        }
      }
    }

    // Sort assets
    for (const rotation in this.assets) {
      this.assets[rotation].sort((a, b) => {
        // If part is sd put it first
        if (a.part === "sd") {
          return -1;
        } else {
          return 1;
        }
      });
    }
  }
}

export default FurnitureAsset;