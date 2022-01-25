import { Application as PixiApplication } from "pixi.js";
import AssetManager from "./assets/AssetManager";
import FurnitureAsset from "./assets/FurnitureAsset";
import Room from "./room";
import IsoMath from "./room/util/Math";
import GameState from "./state/Game";

class RenderEngine {
  _app: PixiApplication;
  cameraX: number = 300;
  cameraY: number = 250;
  mouseOverTiles: boolean = false;
  activeRoom: Room | undefined = undefined;

  constructor(x?: number, y?: number) {
    if (x && y) {
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
    // Add room to render engine
    this._app.stage.addChild(room.container);

    this.activeRoom = room;
  }

  async drawSingleFurni(furni: string, withFloor: boolean, backgroundColor: number) {
    while (this._app.stage.children.length > 0) {
      this._app.stage.removeChildAt(0);
    }

    const room = new Room(withFloor ? [
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
    ] : [], false, false, this._app.renderer);

    // Add room to render engine
    this._app.stage.addChild(room.container);
    this._app.renderer.backgroundColor = backgroundColor;

    room.setCamera(120, 80);

    AssetManager.getFurni(furni).then(async (furni) => {
      if (furni instanceof FurnitureAsset) {
        if (furni.hasRotation(2)) {
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
    /*
const room = new Room([
  [1, 1, 1, 1],
  [1, 1, 1, 1],
  [1, 1, 1, 1],
  [1, 1, 1, 1],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
], true, true);
*/

    const room = new Room(
      [
        [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
        [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
        [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
        [3, 3, 3, 3, -1, -1, -1, -1, -1, -1, 3, 3, 3, 3, 3, 3, -1, -1, -1, -1, -1, -1, -1, 3, 3, 3, 3],
        [3, 3, 3, 3, -1, -1, -1, -1, -1, -1, 2, 2, 2, 2, 2, 2, -1, -1, -1, -1, -1, -1, -1, 3, 3, 3, 3],
        [3, 3, 3, 3, -1, -1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, -1, -1, 3, 3, 3, 3],
        [3, 3, 3, 3, -1, -1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, -1, -1, 3, 3, 3, 3],
        [3, 3, 3, 3, -1, -1, 2, 2, -1, -1, -1, 2, 2, 2, 2, -1, -1, -1, -1, 2, 2, -1, -1, 3, 3, 3, 3],
        [3, 3, 3, 3, -1, -1, 2, 2, -1, -1, -1, 1, 1, 1, 1, -1, -1, -1, -1, 2, 2, -1, -1, 3, 3, 3, 3],
        [3, 3, 3, 3, 3, 2, 2, 2, -1, 1, 1, 1, 1, 1, 1, 1, 2, -1, -1, 2, 2, -1, -1, 3, 3, 3, 3],
        [3, 3, 3, 3, 3, 2, 2, 2, -1, 1, 1, 1, 1, 1, 1, 1, 1, -1, -1, 2, 2, -1, -1, 3, 3, 3, 3],
        [3, 3, 3, 3, 3, 2, 2, 2, -1, 1, 1, 1, 1, 1, 1, 1, 1, -1, -1, 2, 2, -1, -1, 3, 3, 3, 3],
        [3, 3, 3, 3, 3, 2, 2, 2, -1, 1, 1, 1, 1, 1, 1, 1, 1, -1, -1, 2, 2, -1, -1, 3, 3, 3, 3],
        [3, 3, 3, 3, 3, 2, 2, 2, -1, 1, 1, 1, 1, 1, 1, 1, 1, -1, -1, 2, 2, -1, -1, 3, 3, 3, 3],
        [3, 3, 3, 3, 3, 2, 2, 2, -1, 1, 1, 1, 1, 1, 1, 1, 1, -1, -1, 2, 2, -1, -1, 3, 3, 3, 3],
        [3, 3, 3, 3, -1, -1, 2, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 2, 2, -1, -1, 3, 3, 3, 3],
        [3, 3, 3, 3, -1, -1, 2, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 2, 2, -1, -1, 3, 3, 3, 3],
        [3, 3, 3, 3, -1, -1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, -1, -1, 3, 3, 3, 3],
        [3, 3, 3, 3, -1, -1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, -1, -1, 3, 3, 3, 3],
        [3, 3, 3, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 3, 3, 3, 3],
        [3, 3, 3, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 3, 3, 3, 3],
        [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
        [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
        [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
        [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
      ],
      true,
      true,
      this._app.renderer
    );

    this.setRoom(room);

    room.setCamera(this.cameraX, this.cameraY);

    room.container.interactive = true;

    room.container.on("mouseout", () => {
      this.mouseOverTiles = false;
    });

    room.container.on("mouseover", () => {
      this.mouseOverTiles = true;
    });
  }

  getCurrentRoom() {
    return this.activeRoom;
  }
}

export default RenderEngine;
