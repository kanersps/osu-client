import * as PIXI from "pixi.js";
import * as fs from "fs";
import * as zip from "@zip.js/zip.js";
import Furniture from "./Furniture";
import FurnitureLoadError from "../models/FurnitureLoadError";

const AssetLocation = "http://localhost:3000"

class AssetManager {
  static assets: { [key: string]: string } = {};
  static loader: PIXI.Loader = new PIXI.Loader();
  static furni: { [key: string]: Furniture } = {};

  static initialize() {
    AssetManager.loader.onError.add((e) => {
      console.log("ERROR: " + e.message);
    });
  }

  static loadFloor(path: string) {
    AssetManager.loader.add(path, path);
  }

  static async getFurni(name: string): Promise<Furniture | FurnitureLoadError> {
    await AssetManager.loadFurni(name);

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