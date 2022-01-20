import Tile from "./tile";
import { Container, Graphics, Point, Sprite, Texture, TilingSprite } from "pixi.js";
import AssetManager from "../assets/AssetManager";
import Furniture from "../assets/Furniture";
import GameState from "../state/Game";
import { getFloorMatrix, getLeftMatrix, getRightMatrix } from "./util/Matrix";
import IsoMath from "./util/Math";
import Wall from "./Wall";

const TILE_WIDTH = 32;
const TILE_HEIGHT = 32;

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
      this.drawAllRotations(furni, x, y);
    }
  }

  private async loadRoom() {
    // First load the floar
    await this.loadFloor();

    // Then do walls
    await this.loadWalls();

    // Then load the furniture
    await this.loadFurni();
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
        await wall.initialize(this.container, 11, 11);
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

    borderLeft.tilePosition.x = coords.x + GameState.cameraOffsetX;
    borderLeft.tilePosition.y = coords.y + GameState.cameraOffsetY;

    borderLeft.x = coords.x + GameState.cameraOffsetX - 32;
    borderLeft.y = coords.y + GameState.cameraOffsetY + 48;
    
    const borderRight = new TilingSprite(
      Texture.WHITE
    );

    borderRight.transform.setFromMatrix(borderRightMatrix);
    borderRight.width = 64;
    borderRight.height = IsoMath.TILE_DEPTH;
    borderRight.tint = 0x999966;

    borderRight.tilePosition.x = coords.x + GameState.cameraOffsetX;
    borderRight.tilePosition.y = coords.y + GameState.cameraOffsetY;

    borderRight.x = coords.x + GameState.cameraOffsetX + 32;
    borderRight.y = coords.y + GameState.cameraOffsetY + 16;

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
    sprite.x = screenXCoord + GameState.cameraOffsetX;
    sprite.y = screenYCoord + GameState.cameraOffsetY;
    
    this.container.addChild(sprite);
  }

  private async loadFurni() {
    const throne = await AssetManager.getFurni("throne");
    const sofa = await AssetManager.getFurni("club_sofa");
    const egg = await AssetManager.getFurni("black_dino_egg");
    const goldbar = await AssetManager.getFurni("CF_50_goldbar");
    
    if(throne instanceof Furniture && sofa instanceof Furniture && egg instanceof Furniture && goldbar instanceof Furniture) {
      throne.drawInWorld(this.container, 0, 0, 0, 0);   
      throne.drawInWorld(this.container, 4, 4, 0, 0);
      sofa.drawInWorld(this.container, 2, 4, 5, 0);    
      sofa.drawInWorld(this.container, 6, 5, 5, 0);    
      sofa.drawInWorld(this.container, 0, 8, 5, 0);    
      egg.drawInWorld(this.container, 0, 3, 1, 0);    
      egg.drawInWorld(this.container, 0, 3, 2, 0);    
      throne.drawInWorld(this.container, 6, 10, 10, 0);   
      goldbar.drawInWorld(this.container, 0, 4, 1, 0);
      goldbar.drawInWorld(this.container, 0, 4, 2, 0);
      goldbar.drawInWorld(this.container, 0, 5, 1, 0);
      goldbar.drawInWorld(this.container, 0, 5, 2, 0);

      throne.drawInWorld(this.container, 4, 0, 10, 0);
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