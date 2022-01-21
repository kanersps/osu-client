import Tile from "./tile";
import { Container, Graphics, Point, Sprite, Texture, TilingSprite } from "pixi.js";
import AssetManager from "../assets/AssetManager";
import FurnitureAsset from "../assets/FurnitureAsset";
import GameState from "../state/Game";
import { getFloorMatrix, getLeftMatrix, getRightMatrix } from "./util/Matrix";
import IsoMath from "./util/Math";
import Wall from "./Wall";
import Furniture from "../models/Furniture";

const TILE_WIDTH = 32;
const TILE_HEIGHT = 32;

class Room {
  map: Map<number, Tile> = new Map();
  public container: Container = new Container();
  public furniture: Furniture[] = [];
  public cameraX: number = 0;
  public cameraY: number = 0;

  constructor(layout: string, client: boolean, drawWalls: boolean) {
    this.parseLayout(layout);

    this.loadRoom(drawWalls);

    if(client) {
      this.clicked = this.clicked.bind(this);
      document.addEventListener("mousedown", this.clicked);
    }
  }

  public setCamera(x: number, y: number) {
    this.cameraX = x;
    this.cameraY = y;
  }

  private drawAllRotations(furni: FurnitureAsset, x: number, y: number) {
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
    if (furni instanceof FurnitureAsset) {
      this.drawAllRotations(furni, x, y);
    }
  }

  private async loadRoom(drawWalls: boolean) {
    // First load the floar
    await this.loadFloor();

    // Then do walls
    if(drawWalls) {
      await this.loadWalls();
    }

    // Then load the furniture
    await this.loadFurni();
  }

  private getAllFurniAtXAndY(x: number, y: number): Furniture[] {
    const furni: Furniture[] = [];

    for (const f of this.furniture) {
      if (f.x === x && f.y === y) {
        furni.push(f);
      }
    }

    return furni;
  }

  private async clicked(event: MouseEvent) {
    // Check if target is a canvas
    if (!(event.target instanceof HTMLCanvasElement)) {
      return;
    }

    // Get world coords from click
    const worldCoords = IsoMath.screenToWorldCoord(event.x - this.cameraX, event.y - this.cameraY);
    const existingFurni = this.getAllFurniAtXAndY(worldCoords.x, worldCoords.y);

    // Get the one with the highest z
    let highestZ: any = false;
    if(existingFurni.length > 0) {
      highestZ = existingFurni.reduce((prev: Furniture, curr: Furniture) => {
        return prev.z > curr.z ? prev : curr;
      });
    }
    
    const throne = await AssetManager.getFurni(GameState.PlacingFurniName);
    
    if(throne instanceof FurnitureAsset) {
      if(highestZ) {
        this.addFurni(throne, worldCoords.x, worldCoords.y, highestZ.z + 1, throne.rotations[0]);
      } else {
        this.addFurni(throne, worldCoords.x, worldCoords.y, 0, throne.rotations[0]);
      }
    }
  }

  private async loadFloor() {
    // Fill 10 by 10 tiles (which equals to an 11x11 room)
    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 10; y++) {
        await this.addTile(x, y);

        // Only do border for the outsides
        if(x === 9 || y === 9) {          
          await this.addTileBorder(x, y);
        }
      }
    }
  }

  private async loadWalls() {
    //Fill 10 by 10 tiles
    const wall = new Wall();  
    const sprites = await wall.initialize(this.container, 11, 11);

    // Add offset to sprites
    sprites.forEach(sprite => {
      sprite.x += this.cameraX;
      sprite.y += this.cameraY;
    });
  }

  private async addTileBorder(x: number, y: number) {
    // X and Y to isometric coords
    const coords = IsoMath.worldToScreenCoord(x, y);

    // Handle borders
    const borderLeftMatrix = getLeftMatrix(0, 0, {
      width: 32,
      height: IsoMath.TILE_DEPTH,
    });

    const borderRightMatrix = getRightMatrix(0, 0, {
      width: 32,
      height: IsoMath.TILE_DEPTH,
    });

    // Get default floor texture
    const borderLeft = new TilingSprite(
      Texture.WHITE
    );

    borderLeft.transform.setFromMatrix(borderLeftMatrix);
    borderLeft.width = 64;
    borderLeft.height = IsoMath.TILE_DEPTH;
    borderLeft.tint = 0x999966;

    borderLeft.tilePosition.x = coords.x + this.cameraX;
    borderLeft.tilePosition.y = coords.y + this.cameraY;

    borderLeft.x = coords.x + this.cameraX - 32;
    borderLeft.y = coords.y + this.cameraY + 48;
    
    const borderRight = new TilingSprite(
      Texture.WHITE
    );

    borderRight.transform.setFromMatrix(borderRightMatrix);
    borderRight.width = 64;
    borderRight.height = IsoMath.TILE_DEPTH;
    borderRight.tint = 0x999966;

    borderRight.tilePosition.x = coords.x + this.cameraX;
    borderRight.tilePosition.y = coords.y + this.cameraY;

    borderRight.x = coords.x + this.cameraX + 32;
    borderRight.y = coords.y + this.cameraY + 16;

    this.container.addChild(borderLeft);
    this.container.addChild(borderRight);
  }

  private async addTile(x: number, y: number) {
    // X and Y to isometric coords
    const screenXCoord = (x - y) * TILE_WIDTH;
    const screenYCoord = (x + y) * TILE_HEIGHT / 2;

    // Get default floor texture
    const floorTexture = await AssetManager.getFloor("floor_texture_64_0_floor_basic");
    const sprite = new Sprite(floorTexture);
    sprite.rotation = Math.PI / 4;
    sprite.anchor.x = 0.5;
    sprite.anchor.y = 1;
    sprite.transform.setFromMatrix(getFloorMatrix(0, 0))
    sprite.tint = 0x999966;

    // Finally, set the coords of the tile + the camera offset
    sprite.x = screenXCoord + this.cameraX;
    sprite.y = screenYCoord + this.cameraY;
    
    this.container.addChild(sprite);
  }

  public async addFurni(furni: FurnitureAsset, x: number, y: number, z: number, rotation: number) {
    this.furniture.push(new Furniture(x, y, z, rotation, furni));
    this.redrawFurni();
  }

  public async redrawFurni() {
    // Loop through all furni and their sprites
    this.furniture.forEach(furni => {
      furni.sprites.forEach(sprite => {
        // Remove the sprite from the container
        this.container.removeChild(sprite);
      });
    });

    // Sort all furni, first by x, then by y and then by z
    this.furniture.sort((a: Furniture, b: Furniture) => {
      if(a.x < b.x) { return -1; }
      if(a.x > b.x) { return 1; }
      if(a.y < b.y) { return -1; }
      if(a.y > b.y) { return 1; }
      if(a.z < b.z) { return -1; }
      if(a.z > b.z) { return 1; }
      return 0;
    });


    // Now draw all furni
    this.furniture.forEach(furni => {
      furni.draw(this.container);

      // Add offset to sprites
      furni.sprites.forEach(sprite => {
        sprite.x += this.cameraX;
        sprite.y += this.cameraY;
      });
    });
  }

  private async loadFurni() {
    const throne = await AssetManager.getFurni("throne");
    const sofa = await AssetManager.getFurni("club_sofa");
    const egg = await AssetManager.getFurni("black_dino_egg");
    const goldbar = await AssetManager.getFurni("CF_50_goldbar");
    
    if(throne instanceof FurnitureAsset && sofa instanceof FurnitureAsset && egg instanceof FurnitureAsset && goldbar instanceof FurnitureAsset) { }

    
    this.redrawFurni();
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