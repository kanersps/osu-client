import { Application as PixiApplication } from "pixi.js";
import AssetManager from "./assets/AssetManager";
import FurnitureAsset from "./assets/FurnitureAsset";
import Room from "./room";
import GameState from "./state/Game";

class RenderEngine {
  _app: PixiApplication;

  constructor(x?: number, y?: number) {
    if(x && y) {
      this._app = new PixiApplication({ 
        width: x,
        height: y,
      });
    } else {
      this._app = new PixiApplication({ 
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    this._app.start();
  }

  get view() {
    return this._app.view;
  }

  quit(): void {
    this._app.stop();
  }

  async setRoom(room: Room) {        
    // Set room as state
    GameState.CurrentRoom = room;
    
    // Add room to render engine
    this._app.stage.addChild(room.container);
  }

  async drawSingleFurni(furni: string) {
    while(this._app.stage.children.length > 0) { this._app.stage.removeChildAt(0); }

    AssetManager.getFurni(GameState.PlacingFurniName).then(furni => {
      if(furni instanceof FurnitureAsset) {
        if(furni.hasRotation(2)) {
          furni.drawAt(this._app.stage, 2, 100, 100);
        } else {
          furni.drawAt(this._app.stage, 0, 100, 100);
        }
      }
    });
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