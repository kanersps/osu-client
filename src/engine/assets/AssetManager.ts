import * as PIXI from "pixi.js";
import * as fs from "fs";
import * as zip from "@zip.js/zip.js";
import Furniture from "./Furniture";
import FurnitureLoadError from "../models/FurnitureLoadError";
import { Texture } from "pixi.js";

const AssetLocation = "http://localhost:3000"

class AssetManager {
  static loader: PIXI.Loader = new PIXI.Loader();
  static furni: { [key: string]: Furniture } = {};
  static floorTextures: { [key: string]: Texture } = {};
  private static isRoomContentLoaded: boolean = false;

  static initialize() {
    AssetManager.loader.onError.add((e) => {
      console.log("ERROR: " + e.message);
    });
  }

  static async loadDefaultRoomContent() {    
    // Load all default room content
    const zipBlob = await fetch(AssetLocation + "/gordon/HabboRoomContent.zip").then(res => res.blob());
    
    const reader = new zip.ZipReader(new zip.BlobReader(zipBlob));
    const entries = await reader.getEntries();

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

          // Check if the texture is a floor texture
          if(entry.filename.startsWith("floor_")) {
            AssetManager.floorTextures[nameWithoutPng] = Texture.from(blob);
          }
        }
      }
    }
  }

  static async getFloor(name: string): Promise<Texture> {
    if(!this.isRoomContentLoaded) {
      await this.loadDefaultRoomContent();
    }

    if(this.floorTextures[name]) {
      this.isRoomContentLoaded = true;
      return this.floorTextures[name];
    }

    return PIXI.Texture.WHITE;
  }

  static loadFloor(path: string) {
    AssetManager.loader.add(path, path);
  }

  static async getFurni(name: string): Promise<Furniture | FurnitureLoadError> {
    if(!this.furni[name]) {
      await AssetManager.loadFurni(name);
    }

    return this.furni[name] ?? FurnitureLoadError.FailedToLoad;
  }

  private static async loadFurni(furniName: string) {
    const zipBlob = await fetch(AssetLocation + "/furni/" + furniName + ".zip").then(res => res.blob());

    const reader = new zip.ZipReader(new zip.BlobReader(zipBlob));
      const entries = await reader.getEntries();

      AssetManager.furni[furniName] = new Furniture(entries);
      await AssetManager.furni[furniName].load();

      await reader.close();
  }

  static async loadAllResources() {
    const { resources } = await AssetManager.loader.load();

    console.log(resources);
  }
}

export default AssetManager;