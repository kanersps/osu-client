import { Application as PixiApplication } from "pixi.js";
import AssetManager from "./assets/AssetManager";
import FurnitureAsset from "./assets/FurnitureAsset";
import Room from "./room";
import IsoMath from "./room/util/Math";
import GameState from "./state/Game";

class RenderEngine {
  _app: PixiApplication;
  cameraX: number = 600;
  cameraY: number = 400;

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

    const room = new Room("", false, false);

    // Add room to render engine
    this._app.stage.addChild(room.container);
    this._app.renderer.backgroundColor = 0xe9e9e1;

    room.setCamera(120, 80);

    AssetManager.getFurni(GameState.PlacingFurniName).then(async furni => {
      if(furni instanceof FurnitureAsset) {
        if(furni.hasRotation(2)) {
          await room.addFurni(furni, 1, 1, 0, 2);
        } else {
          await room.addFurni(furni, 1, 1, 0, 0);
        }
      }
    });
  }

  async initialize() {    
    // Render room floor
    AssetManager.loadFloor("assets/floor.png");

    console.log("Done initializing Osu!");

    // Test room
    const room = new Room("", true, true);
    this.setRoom(room);
    
    room.setCamera(this.cameraX, this.cameraY);
  }
}

export default RenderEngine;