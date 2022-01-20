import Tile from "./tile";
import { Container, Graphics, Sprite, Texture } from "pixi.js";
import AssetManager from "../assets/AssetManager";
import Furniture from "../assets/Furniture";
import GameState from "../state/Game";

class Room {
  map: Map<number, Tile> = new Map();
  public container: Container = new Container();

  constructor(layout: string) {
    this.parseLayout(layout);

    this.loadRoom();
  }

  private drawAllRotations(furni: Furniture, x: number, y: number) {
    furni.rotations.forEach(rotation => {
      let i = 0;
      furni.rotations.forEach(rotation => {
          furni.drawAt(this.container, rotation, 100 + (i * 150) + x , 100 + y);
        i = i + 1;
      });
    });
  }

  private async drawAllRotationsOfFurni(name: string, x: number, y: number) {
    const furni = await AssetManager.getFurni(name);

    // Check if furni is not a FurnitureLoadError
    if (furni instanceof Furniture) {
      console.log(furni)
      this.drawAllRotations(furni, x, y);
    }
  }

  private async loadRoom() {
    // First load the floar
    await this.loadFloor();

    // Then load the furniture
    await this.loadFurni();

    /*
    this.drawAllRotationsOfFurni("throne", 0, 0)
    this.drawAllRotationsOfFurni("club_sofa", 0, 80)
    this.drawAllRotationsOfFurni("djesko_turntable", 0, 160)
    this.drawAllRotationsOfFurni("exe_table", 0, 300)
    this.drawAllRotationsOfFurni("CFC_500_goldbar", 0, 440)
    this.drawAllRotationsOfFurni("exe_chair", 0, 540)
    this.drawAllRotationsOfFurni("party_seat", 0, 640)

    this.drawAllRotationsOfFurni("party_mic", 600, 0)
    this.drawAllRotationsOfFurni("urban_fence", 600, 120)
    this.drawAllRotationsOfFurni("prize1", 600, 300)
    this.drawAllRotationsOfFurni("market_c19_stationary", 600, 440)
    this.drawAllRotationsOfFurni("rare_globe", 600, 540)
    this.drawAllRotationsOfFurni("rare_fountain", 600, 640)
    */
  }

  private async loadFloor() {
    // Fill 10 by 10 tiles
    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 10; y++) {
        this.addTile(x, y);
      }
    }
  }

  private async addTile(x: number, y: number) {
    const floor = new Graphics();

    const TILE_WIDTH = 32;
    const TILE_HEIGHT = 32;

    // X and Y to isometric coords
    const screenXCoord = (x - y) * TILE_WIDTH;
    const screenYCoord = (x + y) * TILE_HEIGHT / 2;

    // Draw a basic isometric tile, with the default floor color
    floor.beginFill(0x999966);
    floor.moveTo(0, 0);
    floor.lineTo(TILE_WIDTH, TILE_HEIGHT/2);
    floor.lineTo(0, TILE_HEIGHT);
    floor.lineTo(-TILE_WIDTH, TILE_HEIGHT/2);
    floor.lineTo(0, 0)
    floor.endFill();

    // Finally, set the coords of the tile + the camera offset
    floor.x = screenXCoord + GameState.cameraOffsetX;
    floor.y = screenYCoord + GameState.cameraOffsetY;

    this.container.addChild(floor);
  }

  private async loadFurni() {
    const throne = await AssetManager.getFurni("throne");
    const sofa = await AssetManager.getFurni("club_sofa");
    const egg = await AssetManager.getFurni("black_dino_egg");
    
    if(throne instanceof Furniture && sofa instanceof Furniture && egg instanceof Furniture) {
      throne.drawInWorld(this.container, 0, 3, 0, 0);    
      throne.drawInWorld(this.container, 4, 4, 0, 0);    
      sofa.drawInWorld(this.container, 2, 4, 5, 0);    
      sofa.drawInWorld(this.container, 6, 5, 5, 0);    
      sofa.drawInWorld(this.container, 0, 8, 5, 0);    
      egg.drawInWorld(this.container, 0, 3, 1, 0);    
      egg.drawInWorld(this.container, 0, 3, 2, 0);    
    }
  }

  private parseLayout(layout: string) {
    const lines = layout.split('\n');
    const width = lines[0].length;
    const height = lines.length;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const tile = lines[y][x];
        switch (tile) {
          case '#': {
            // This is a tile

            break;
          }
          case '0': {
            // This is void

            break;
          }
          default: {
            // Unknown tile type?
            console.log("ERROR: Unknown tile type: " + tile);
          }
        }
      }
    }
  }
}

export default Room;