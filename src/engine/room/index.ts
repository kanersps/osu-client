import Tile from "./tile";
import { Container, Sprite, Texture } from "pixi.js";
import AssetManager from "../assets/AssetManager";
import Furniture from "../assets/Furniture";

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
    this.drawAllRotationsOfFurni("throne", 0, 0)
    this.drawAllRotationsOfFurni("club_sofa", 0, 80)
    this.drawAllRotationsOfFurni("djesko_turntable", 0, 160)
    this.drawAllRotationsOfFurni("exe_table", 0, 300)
    this.drawAllRotationsOfFurni("CFC_500_goldbar", 0, 440)
    this.drawAllRotationsOfFurni("exe_chair", 0, 540)
    this.drawAllRotationsOfFurni("party_seat", 0, 640)

    this.drawAllRotationsOfFurni("party_mic", 600, 0)
    this.drawAllRotationsOfFurni("urban_fence", 600, 120)
    //this.drawAllRotationsOfFurni("market_c19_stationary", 600, 160)
    this.drawAllRotationsOfFurni("prize1", 600, 300)
    this.drawAllRotationsOfFurni("market_c19_stationary", 600, 440)
    this.drawAllRotationsOfFurni("rare_globe", 600, 540)
    this.drawAllRotationsOfFurni("rare_fountain", 600, 640)
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