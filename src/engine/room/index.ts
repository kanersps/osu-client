import Tile from "./tile";
import { Container, Graphics, Matrix, Point, Sprite, Texture, TilingSprite } from "pixi.js";
import AssetManager from "../assets/AssetManager";
import FurnitureAsset from "../assets/FurnitureAsset";
import GameState from "../state/Game";
import { getFloorMatrix, getLeftMatrix, getRightMatrix } from "./util/Matrix";
import IsoMath from "./util/Math";
import Wall from "./Wall";
import Furniture from "../models/Furniture";
import RoomLayout from "./RoomLayout";
import { EmitFlags } from "typescript";

const TILE_WIDTH = 32;
const TILE_HEIGHT = 32;
const STAIR_HEIGHT = 8;

class Room {
  public container: Container = new Container();
  public furniture: Furniture[] = [];
  public cameraX: number = 0;
  public cameraY: number = 0;
  private layout: number[][] = [];

  constructor(layout: number[][], client: boolean, drawWalls: boolean) {
    this.container.sortableChildren = true;

    this.layout = layout;

    this.loadRoom(drawWalls);
  }

  public setCamera(x: number, y: number) {
    this.cameraX = x;
    this.cameraY = y;
  }

  private drawAllRotations(furni: FurnitureAsset, x: number, y: number) {
    furni.rotations.forEach((rotation) => {
      let i = 0;
      furni.rotations.forEach((rotation) => {
        furni.drawAt(this.container, rotation, 100 + i * 150 + x, 100 + y);
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
    if (drawWalls) {
      await this.loadWalls();
    }

    // Then load the furniture
    await this.loadFurni();
  }

  private getAllFurniAtXAndY(x: number, y: number): Furniture[] {
    const furnis: Furniture[] = [];

    for (const furni of this.furniture) {
      // Check if the furni is in range of the x and y (using the furni's asset dimension)
      const dimensions = furni.getDimensions();

      console.log(`ClickX: ${x}; ClickY: ${y}`);
      console.log(`FurniX: ${furni.x}; FurniY: ${furni.y}; SizeX: ${dimensions.x}; SizeY: ${dimensions.y}`);

      if (x >= furni.x && y >= furni.y && x <= furni.x + (dimensions.x - 1) && y <= furni.y + (dimensions.y - 1)) {
        furnis.push(furni);
      }
    }

    return furnis;
  }

  private getTileHeightAt(x: number, y: number) {
    console.log(`X: ${x}; Y: ${y}`);
    console.log("LAYOUT: " + this.layout[x][y])
    if(this.layout[x] != undefined && this.layout[x][y] != undefined) {
      return this.layout[x][y];
    }

    return -1;
  }

  private async clicked(x: number, y: number, z: number) {

    // Get world coords from click
    const existingFurni = this.getAllFurniAtXAndY(x, y);

    // Get the one with the highest z
    let highestZ: any = false;
    if (existingFurni.length > 0) {
      highestZ = existingFurni.reduce((prev: Furniture, curr: Furniture) => {
        return prev.z > curr.z ? prev : curr;
      });
    }

    const throne = await AssetManager.getFurni(GameState.PlacingFurniName);
    const tileZ = this.getTileHeightAt(x, y);
    console.log(tileZ);

    if (throne instanceof FurnitureAsset) {
      if (highestZ) {
        if (highestZ.getDimensions().z === 0) {
          console.log("This furni can not be placed on top of another furni");
          return;
        }

        this.addFurni(throne, x, y, z + parseInt(highestZ.z) + parseInt(highestZ.getDimensions().z), throne.rotations[0]);
      } else {
        this.addFurni(throne, x, y, z, throne.rotations[0]);
      }
    }
  }

  private async loadFloor() {
    let tilesToAdd: { x: number; y: number; height: number; stairs: number; }[] = [];

    var y = 0;
    for (var row of this.layout) {
      var x = 0;
      for (var height of row) {
        if (height > -1) {
          // Stair is a direction
          // -1 = no stairs
          // 0 = down
          // 1 = up
          // 2 = left
          // 3 = right
          // 4 = down left
          // 5 = down right
          // 6 = up left
          // 7 = up right
          // 8 = middle

          let stairs = -1;

          // Stair DOWN LEFT
          if (this.layout[y + 1] && this.layout[y + 1][x - 1] && this.layout[y + 1][x - 1] - height === 1) {
            stairs = 4;
          }

          // Stair UP LEFT
          if (this.layout[y - 1] && this.layout[y - 1][x - 1] && this.layout[y - 1][x - 1] - height === 1) {
            stairs = 6;
          }

          // Stair UP RIGHT
          if (this.layout[y - 1] && this.layout[y - 1][x + 1] && this.layout[y - 1][x + 1] - height === 1) {
            stairs = 7;
          }

          // Stair UP
          if (this.layout[y - 1] && this.layout[y - 1][x] - height === 1) {
            stairs = 1;
          }

          // Stair LEFT
          if (this.layout[y][x - 1] && this.layout[y][x - 1] - height === 1) {
            if (!tilesToAdd.find((tile) => tile.x === x - 1 && tile.y === y && tile.stairs > 0)) {
              stairs = 2;
            }
          }

          
          // Stair RIGHT
          if (this.layout[y][x + 1] && this.layout[y][x + 1] - height === 1) {
            if (!tilesToAdd.find((tile) => tile.x === x + 1 && tile.y === y && tile.stairs > 0)) {
              stairs = 3;
            }
          }

          tilesToAdd.push({ x, y, height, stairs });
        }

        x = x + 1;
      }

      y = y + 1;
    }

    // Sort tiles by height
    tilesToAdd.sort((a, b) => {
      return b.height - a.height;
    });

    console.log(tilesToAdd)

    for (var tile of tilesToAdd) {
      if(tile.x === 14 && tile.y === 8) {
        console.log(tile);
      }

      if (tile.stairs > 0) {
        console.log(tile.x, tile.y)
        await this.addStairs(tile.x, tile.y, tile.height, tile.stairs);
      } else {
        await this.addTile(tile.x, tile.y, tile.height);
        await this.addTileBorder(tile.x, tile.y, tile.height);
      }
    }
  }

  private createStairSprite(matrix: Matrix, tint: number, texture: Texture) {
    const tile = new TilingSprite(texture);
    tile.anchor.set(1);

    tile.tilePosition.x = 0;
    tile.tilePosition.y = 0;

    tile.transform.setFromMatrix(matrix);

    tile.tint = tint;

    return tile;
  }

  private async createStairRight(container: Container, height: number, index: number) {
    let baseX = -STAIR_HEIGHT * index;
    let baseY = -STAIR_HEIGHT * index * 1.5;

    container.sortableChildren = true;

    const baseXRight = 0;
    const baseYRight = -STAIR_HEIGHT * index * 1.5;

    const texture = await AssetManager.getFloor("floor_texture_64_0_floor_basic");

    
    if(index === 0) {
        const tileLeft = this.createStairSprite(getFloorMatrix(baseXRight + 32 - STAIR_HEIGHT, baseYRight + STAIR_HEIGHT * 1.5), 0x999966, texture);

        tileLeft.width = 8;
        tileLeft.height = 28;

        tileLeft.x -= 32 + 16 + 4;
        tileLeft.y -= 40 - 2;
        container.zIndex = height;
        container.addChild(tileLeft);
    }

    const borderLeft = this.createStairSprite(getLeftMatrix(baseX + 32 - STAIR_HEIGHT, baseY + STAIR_HEIGHT * 1.5, { width: STAIR_HEIGHT, height: STAIR_HEIGHT}), 0x838357, texture);
    borderLeft.width = STAIR_HEIGHT;
    borderLeft.height = STAIR_HEIGHT;
    
  borderLeft.x += index * 16;
  borderLeft.y += index * 8;

    borderLeft.x -= 96;
    borderLeft.y -= 24;
    borderLeft.zIndex = 200;

    container.addChild(borderLeft)
  }

  private async createStairLeft(container: Container, height: number, index: number) {
    let baseX = -STAIR_HEIGHT * index;
    let baseY = -STAIR_HEIGHT * index * 1.5;
    
    const texture = await AssetManager.getFloor("floor_texture_64_0_floor_basic");

    const tile = this.createStairSprite(getFloorMatrix(baseX + 32 - STAIR_HEIGHT, baseY + STAIR_HEIGHT * 1.5), 0x999966, texture);
    tile.width = STAIR_HEIGHT;
    tile.height = 32;
    tile.x -= 24;
    tile.y -= 32 + 4;

    tile.y += 8

    const borderLeft = this.createStairSprite(getLeftMatrix(baseX + 32 - STAIR_HEIGHT, baseY + STAIR_HEIGHT * 1.5, { width: STAIR_HEIGHT, height: STAIR_HEIGHT}), 0x838357, texture);
    borderLeft.width = STAIR_HEIGHT;
    borderLeft.height = STAIR_HEIGHT;
    
    borderLeft.x -= 64 + 8;
    borderLeft.y -= 12;

    const borderRight = this.createStairSprite(getRightMatrix(baseX, baseY, { width: 32, height: STAIR_HEIGHT }), 0x666644, texture);
    borderRight.width = 32;
    borderRight.height = STAIR_HEIGHT;
    borderRight.x -= 96;
    borderRight.y += 8;

    container.addChild(borderLeft);
    container.addChild(borderRight);
    container.addChild(tile);
  }

  private async createStairUpLeft(container: Container, height: number, index: number) {
    let baseXLeft = +STAIR_HEIGHT * index;
    let baseYLeft = -STAIR_HEIGHT * index * 1.5;

    const baseXRight = 0;
    const baseYRight = -STAIR_HEIGHT * index * 1.5;

    const texture = await AssetManager.getFloor("floor_texture_64_0_floor_basic");

    const tileLeft = this.createStairSprite(getFloorMatrix(baseXLeft, baseYLeft), 0x999966, texture);

    tileLeft.width = 32 - 8 * index;
    tileLeft.height = 8;

    tileLeft.x -= 48 - ((3 - index) * 8);
    tileLeft.y -= 24 - ((3 - index) * 8) / 2;
    tileLeft.y += 8;

    const tileRight = this.createStairSprite(getFloorMatrix(baseXRight + 32 - STAIR_HEIGHT, baseYRight + STAIR_HEIGHT * 1.5), 0x999966, texture);

    tileRight.width = 8;
    tileRight.height = 32 - 8 * index;

    tileRight.x -= 24 + (( index) * 8);
    tileRight.y -= 32 + 4;
    tileRight.y += 8;

    const borderLeft = this.createStairSprite(getLeftMatrix(baseXLeft - 8 * index, baseYLeft - 8 * index * 0.5, { width: 32, height: STAIR_HEIGHT}) , 0x838357, texture);
    borderLeft.width = 32 - 8 * index;
    borderLeft.height = STAIR_HEIGHT;
    
    borderLeft.x -= 72 + ((3 - index) * 8);
    borderLeft.y -= 20 + ((3 - index) * 8) / 2;
    borderLeft.y += 8;

    const borderRight = this.createStairSprite(getRightMatrix(baseXRight - STAIR_HEIGHT * index, -STAIR_HEIGHT * index * 1.5, {width: 32, height: STAIR_HEIGHT}), 0x666644, texture);

    borderRight.width = 32 - 8 * index;
    borderRight.height = STAIR_HEIGHT;

    
    borderRight.x -= 72 + ((3 - index) * 8);
    borderRight.y -= 12 - ((3 - index) * 8) / 2;
    borderRight.y += 8;

    container.addChild(tileLeft);
    container.addChild(tileRight);
    container.addChild(borderRight);
    container.addChild(borderLeft);
  }

  private async createStairUpRight(container: Container, height: number, index: number) {
    let baseXLeft = +STAIR_HEIGHT * index;
    let baseYLeft = -STAIR_HEIGHT * index * 1.5;

    container.sortableChildren = true;

    const baseXRight = 0;
    const baseYRight = -STAIR_HEIGHT * index * 1.5;

    const texture = await AssetManager.getFloor("floor_texture_64_0_floor_basic");

    
    if(index === 0) {
      const tileLeft = this.createStairSprite(getFloorMatrix(baseXRight + 32 - STAIR_HEIGHT, baseYRight + STAIR_HEIGHT * 1.5), 0x999966, texture);

      tileLeft.width = 8;
      tileLeft.height = 64;

      tileLeft.x -= 32 - 20;
      tileLeft.y -= 58;
      container.addChild(tileLeft);
      
      const borderLeftBotom = this.createStairSprite(getLeftMatrix(baseXLeft - 8 * index, baseYLeft - 8 * index * 0.5, { width: 32, height: STAIR_HEIGHT}) , 0x838357, texture);
      borderLeftBotom.width = 32;
      borderLeftBotom.height = STAIR_HEIGHT;

      borderLeftBotom.x -= 96;
      borderLeftBotom.y -= 24;

      borderLeftBotom.zIndex = 200;
      container.addChild(borderLeftBotom)
    }



    const tileRight = this.createStairSprite(getFloorMatrix(baseXLeft, baseYLeft), 0x999966, texture);

    tileRight.width = 32 - 8 * index;
    tileRight.height = 8;

    tileRight.x -= 24;
    tileRight.y -= 12;
    tileRight.y += 8;    
    tileRight.zIndex = 100;

    const borderLeft = this.createStairSprite(getLeftMatrix(baseXLeft - 8 * index, baseYLeft - 8 * index * 0.5, { width: 32, height: STAIR_HEIGHT}) , 0x838357, texture);
    borderLeft.width = 32 - 8 * index - 8;
    borderLeft.height = STAIR_HEIGHT;
    borderLeft.zIndex = 200;

    borderLeft.anchor.set(0)
    
    borderLeft.x -= 48 + 8 - ((index) * 8);
    borderLeft.y -= 24 + 4 - ((index) * 8) / 2;

    
    const borderRight = this.createStairSprite(getRightMatrix(baseXRight - STAIR_HEIGHT * index, -STAIR_HEIGHT * index * 1.5, {width: 32, height: STAIR_HEIGHT}), 0x666644, texture);

    borderRight.width = 8;
    borderRight.height = 8;

    borderRight.anchor.set(0)
    borderRight.x -= 88 - ((index) * 8) - (index * 8);
    borderRight.y -= 32;
    borderRight.y += 28

    container.addChild(tileRight);
    container.addChild(borderRight);
    container.addChild(borderLeft);
  }

  private async createStairUp(container: Container, height: number, index: number) {
    let baseX = +STAIR_HEIGHT * index;
    let baseY = -STAIR_HEIGHT * index * 1.5;

    const texture = await AssetManager.getFloor("floor_texture_64_0_floor_basic");

    const tile = this.createStairSprite(getFloorMatrix(baseX, baseY), 0x999966, texture);
    tile.width = 32;
    tile.height = 8;

    // This works somehow?! why the fuck are these "random" offsets needed
    tile.x -= 24;
    tile.y -= 12;
    tile.y += 8;

    const borderLeft = this.createStairSprite(getLeftMatrix(baseX, baseY, { width: 32, height: 8 }), 0x838357, texture);

    borderLeft.width = 32;
    borderLeft.height = 8;

    // I don't want to live anymore
    borderLeft.x -= 96;
    borderLeft.y -= 32;
    borderLeft.y += 8;

    const borderRight = this.createStairSprite(getRightMatrix(baseX, baseY, { width: 8, height: 8 }), 0x666644, texture);
    borderRight.width = 8;
    borderRight.height = 8;
    borderRight.x -= 80 - 8;
    borderRight.y -= 16 - 4;
    borderRight.y += 8;

    container.addChild(tile);
    container.addChild(borderLeft);
    container.addChild(borderRight);
  }

  private async addStairs(x: number, y: number, height: number, stair: number) {
    if (stair > -1) {
      let stairContainer = new Container();
      let coords = IsoMath.worldToScreenCoord(x, y, height);

      stairContainer.x = coords.x + this.cameraX;
      stairContainer.y = coords.y + this.cameraY;

      if (stair === 1) {
        for (let i = 0; i < 4; i++) {
          this.createStairUp(stairContainer, height, 3 - i);
        }
      } else if (stair === 2) {
        for (let i = 0; i < 4; i++) {
          this.createStairLeft(stairContainer, height, 3 - i);
        }
      } else if(stair === 6) {
        for (let i = 0; i < 4; i++) {
          this.createStairUpLeft(stairContainer, height, 3 - i);
        }
      } else if(stair === 7) {
        for (let i = 0; i < 4; i++) {
          this.createStairUpRight(stairContainer, height, 3 - i);
        }
      } else if(stair === 3) {
        console.log("Osu")
        for (let i = 0; i < 4; i++) {
          this.createStairRight(stairContainer, height, 3 - i);
        }
      }

      this.container.addChild(stairContainer);
    }
  }

  private async loadWalls() {
    //Fill 10 by 10 tiles
    const wall = new Wall();

    // Get height while looping through the layout and the number is the same as the first
    let height = 0;
    let startHeight = 0;

    if (this.layout[0] !== undefined) {
      height += 1;
      let firstHeight = this.layout[0][0];
      startHeight = firstHeight;

      let currentIndex = 1;

      while (this.layout[currentIndex] !== undefined && firstHeight === this.layout[currentIndex][0]) {
        currentIndex++;
        height++;
      }
    }

    // Get width while looping through the layout and the number is the same as the first
    let width = 0;

    if (this.layout[0] !== undefined) {
      width += 1;

      let firstHeight = this.layout[0][0];
      let currentIndex = 1;

      while (this.layout[0][currentIndex] !== undefined && this.layout[0][currentIndex] === firstHeight) {
        width += 1;
        currentIndex += 1;
      }
    }

    const sprites = await wall.initialize(this.container, 0, 0, height, width);

    // Add offset to sprites
    sprites.forEach((sprite) => {
      sprite.x += this.cameraX;
      sprite.y += this.cameraY - startHeight * IsoMath.TILE_HEIGHT;
    });
  }

  private async addTileBorder(x: number, y: number, z: number) {
    const tileBorderContainer = new Container();

    // X and Y to isometric coords
    const coords = IsoMath.worldToScreenCoord(x, y, z);

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
    const borderLeft = new TilingSprite(Texture.WHITE);

    borderLeft.transform.setFromMatrix(borderLeftMatrix);
    borderLeft.width = 32;
    borderLeft.height = IsoMath.TILE_DEPTH;
    borderLeft.tint = 0x838357;

    borderLeft.tilePosition.x = coords.x + this.cameraX;
    borderLeft.tilePosition.y = coords.y + this.cameraY;

    borderLeft.x = coords.x + this.cameraX - 32;
    borderLeft.y = coords.y + this.cameraY + 16;

    const borderRight = new TilingSprite(Texture.WHITE);

    borderRight.transform.setFromMatrix(borderRightMatrix);
    borderRight.width = 32;
    borderRight.height = IsoMath.TILE_DEPTH;
    borderRight.tint = 0x666644;

    borderRight.tilePosition.x = coords.x + this.cameraX;
    borderRight.tilePosition.y = coords.y + this.cameraY;

    borderRight.x = coords.x + this.cameraX;
    borderRight.y = coords.y + this.cameraY;

    tileBorderContainer.addChild(borderLeft);
    tileBorderContainer.addChild(borderRight);

    tileBorderContainer.zIndex = z;

    this.container.addChild(tileBorderContainer);
  }

  private async addTile(x: number, y: number, z: number) {
    // X and Y to isometric coords
    const screenXCoord = (x - y) * TILE_WIDTH;
    const screenYCoord = ((x + y) * TILE_HEIGHT) / 2 - z * TILE_HEIGHT;

    // Get default floor texture
    const floorTexture = await AssetManager.getFloor("floor_texture_64_0_floor_basic");
    const sprite = new TilingSprite(floorTexture);
    sprite.anchor.x = 1;
    sprite.anchor.y = 1;
    sprite.transform.setFromMatrix(getFloorMatrix(0, 0));
    sprite.width = 32;
    sprite.height = 32;
    sprite.tint = 0x999966;

    // Finally, set the coords of the tile + the camera offset
    sprite.x = screenXCoord + this.cameraX;
    sprite.y = screenYCoord + this.cameraY;

    sprite.zIndex = z;

    sprite.interactive = true;
    sprite.on('mousedown', (event) => {
      this.clicked(x, y, z);
    })

    this.container.addChild(sprite);
  }

  public async addFurni(furni: FurnitureAsset, x: number, y: number, z: number, rotation: number) {
    this.furniture.push(new Furniture(x, y, z, rotation, furni));
    this.redrawFurni();
  }

  public async redrawFurni() {
    // Loop through all furni and their sprites
    this.furniture.forEach((furni) => {
      furni.sprites.forEach((sprite) => {
        // Remove the sprite from the container
        this.container.removeChild(sprite);
      });
    });

    // Sort all furni, first by x, then by y and then by z
    this.furniture.sort((a: Furniture, b: Furniture) => {
      if (a.x < b.x) {
        return -1;
      }
      if (a.x > b.x) {
        return 1;
      }
      if (a.y < b.y) {
        return -1;
      }
      if (a.y > b.y) {
        return 1;
      }
      if (a.z < b.z) {
        return -1;
      }
      if (a.z > b.z) {
        return 1;
      }
      return 0;
    });

    // Now draw all furni
    this.furniture.forEach((furni) => {
      furni.draw(this.container);

      // Add offset to sprites
      furni.sprites.forEach((sprite) => {
        console.log(furni.z)
        sprite.zIndex = furni.z + 1;
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

    if (throne instanceof FurnitureAsset && sofa instanceof FurnitureAsset && egg instanceof FurnitureAsset && goldbar instanceof FurnitureAsset) {
    }

    this.redrawFurni();
  }

  private parseLayout(layout: number[][]) {}
}

export default Room;
