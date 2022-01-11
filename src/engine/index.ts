import { Application as PixiApplication } from "pixi.js";
import AssetManager from "./assets/AssetManager";
import Room from "./room";

class RenderEngine {
  _app: PixiApplication;

  constructor() {
    this._app = new PixiApplication({ 
      width: window.innerWidth,
      height: window.innerHeight,
    });

    this._app.start();

    // Create test room
    const room = new Room(`
0000
0##0
0000
`);

    // Render room floor
    AssetManager.loadFloor("assets/floor.png");
    AssetManager.loadAllResources();
  }

  get view() {
    return this._app.view;
  }

  quit(): void {
    this._app.stop();
  }
}

export default RenderEngine;