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
  }

  get view() {
    return this._app.view;
  }

  quit(): void {
    this._app.stop();
  }

  async setRoom(room: Room) {        
    // Add room to render engine
    this._app.stage.addChild(room.container);

    console.log(room.container);
  }

  async initialize() {    
    // Render room floor
    AssetManager.loadFloor("assets/floor.png");

    console.log("Done initializing Osu!");

    // Test room
    this.setRoom(new Room(""));
  }
}

export default RenderEngine;