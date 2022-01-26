import { AbstractRenderer, BaseRenderTexture, Bounds, Container, Rectangle, Renderer, RenderTexture, SCALE_MODES, Sprite, Texture, TilingSprite } from "pixi.js";
import AssetManager from "../assets/AssetManager";
import FurnitureAsset from "../assets/FurnitureAsset";
import { getFloorMatrix, getLeftMatrix, getRightMatrix } from "./util/Matrix";
import IsoMath from "./util/Math";
import Wall, { WallSide } from "./Wall";
import Furniture from "../models/Furniture";
import Stair, { addTiles } from "./Stair";
import FurniContext from "../../components/ui/room/context/furni";

type FurniClickCallback = (furni: Furniture) => void;
type WallClickCallback = () => void;
type FloorClickCallback = () => void;

const TILE_WIDTH = 32;
const TILE_HEIGHT = 32;

interface TileCoords {
  x: number;
  y: number;
  worldX: number;
  worldY: number;
  worldZ: number;
  bounds: Rectangle;
}

class Room {
  public container: Container = new Container();
  public furniture: Furniture[] = [];
  public cameraX: number = 0;
  public cameraY: number = 0;
  private _renderer: Renderer | AbstractRenderer;
  private _layout: number[][] = [];
  private placingFurniName: string = "throne";
  private ghostFurni: Container | undefined = undefined;
  private _tileCoords: TileCoords[] = [];
  private furniClickCallbacks: FurniClickCallback[] = [];
  private wallClickCallback: WallClickCallback[] = [];
  private floorClickCallback: FloorClickCallback[] = [];

  constructor(layout: number[][], client: boolean, drawWalls: boolean, renderer: Renderer | AbstractRenderer) {
    this.container.sortableChildren = true;
    this._renderer = renderer;

    this._layout = layout;

    this.loadRoom(drawWalls);
  }

  get layout(): Readonly<number[][]> {
    return this._layout;
  }

  // Add wall click callback
  public addWallClickCallback(callback: WallClickCallback) {
    this.wallClickCallback.push(callback);
  }

  // Remove wall click callback
  public removeWallClickCallback(callback: WallClickCallback) {
    this.wallClickCallback = this.wallClickCallback.filter((c) => c !== callback);
  }

  public removeFloorClickCallback(callback: FloorClickCallback) {
    this.floorClickCallback = this.floorClickCallback.filter((c) => c !== callback);
  }

  public addFloorClickCallback(callback: FloorClickCallback) {
    this.floorClickCallback.push(callback);
  }

  public addFurniClickCallback(callback: FurniClickCallback) {
    this.furniClickCallbacks.push(callback);
  }

  public removeFurniCallback(callback: FurniClickCallback) {
    const index = this.furniClickCallbacks.indexOf(callback);
    if (index > -1) {
      this.furniClickCallbacks.splice(index, 1);
    }
  }

  public getTileFromXAndY(mouseX: number, mouseY: number) {
    const originalMouseX = mouseX;
    const originalMouseY = mouseY;

    // Loop through all tiles and get the tile at x and y from screencoords including height
    let returnVal = { x: -1, y: -1, z: -1 };
    this._tileCoords.some((tileCoords) => {
      const centerX = tileCoords.x - 32;
      const centerY = tileCoords.y;

      mouseX = originalMouseX - centerX;
      mouseY = originalMouseY - centerY;

      // Check if mouse is in bounds
      const radii = { x: 32, y: 16 };
      const inside = Math.abs(mouseX) * radii.y + Math.abs(mouseY) * radii.x <= radii.x * radii.y;

      if (inside) {
        returnVal = { x: tileCoords.worldX, y: tileCoords.worldY, z: tileCoords.worldZ };
        return true;
      }

      return false;
    });

    return returnVal;
  }

  public setPlacingFurniName = (name: string) => {
    this.placingFurniName = name;
  };

  public async setGhostFurni(name: string) {
    if (this.ghostFurni) {
      this.container.removeChild(this.ghostFurni);
    }

    this.ghostFurni = new Container();
    //this.container.addChild(this.ghostFurni);

    const furni = await AssetManager.getFurni(name);

    if (furni instanceof FurnitureAsset) {
      let sprites = furni.drawInWorld(this.ghostFurni, furni.rotations[0], furni.states[0], 0, 0, 3);

      sprites.forEach((sprite) => {
        sprite.x += this.cameraX;
        sprite.y += this.cameraY;
      });
    }

    this.ghostFurni.alpha = 0.5;
    this.ghostFurni.zIndex = 500;
  }

  public async updateGhostFurniSimple(x: number, y: number, z: number) {
    if (this.placingFurniName === "") {
      return;
    }

    // Get furni at x and y
    const existingFurni = this.getAllFurniAtXAndY(x, y);

    let highestZ: any = false;
    if (existingFurni.length > 0) {
      highestZ = existingFurni.reduce((prev: Furniture, curr: Furniture) => {
        return prev.z > curr.z ? prev : curr;
      });
    }

    if (highestZ) {
      this.updateGhostFurni(x, y, parseInt(highestZ.z) + parseInt(highestZ.getDimensions().z));
    } else {
      this.updateGhostFurni(x, y, z);
    }
  }

  private async updateGhostFurni(x: number, y: number, z: number) {
    if (this.placingFurniName === "") {
      return;
    }

    // Remove
    if (x === -1) {
      if (this.ghostFurni) {
        this.container.removeChild(this.ghostFurni);
      }

      return;
    }

    if (this.ghostFurni) {
      this.container.removeChild(this.ghostFurni);
    }

    this.ghostFurni = new Container();

    // Get original iso coords from GhostFurniX and Y in GameState
    const furni = await AssetManager.getFurni(this.placingFurniName);

    if (furni instanceof FurnitureAsset) {
      let sprites = furni.drawInWorld(this.ghostFurni, furni.rotations[0], furni.states[0], x, y, z);

      sprites.forEach((sprite) => {
        sprite.x += this.cameraX;
        sprite.y += this.cameraY;
      });
    }

    this.container.addChild(this.ghostFurni);
    this.ghostFurni.zIndex = z;
    this.ghostFurni.alpha = 0.5;
  }

  public setCamera(x: number, y: number) {
    this.cameraX = x;
    this.cameraY = y;
  }

  private drawAllRotations(furni: FurnitureAsset, x: number, y: number) {
    furni.rotations.forEach((rotation) => {
      let i = 0;
      furni.rotations.forEach((rotation) => {
        furni.drawAt(this.container, rotation, 0, 100 + i * 150 + x, 100 + y);
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

    this.container.sortChildren();
  }

  private getAllFurniAtXAndY(x: number, y: number): Furniture[] {
    const furnis: Furniture[] = [];

    for (const furni of this.furniture) {
      // Check if the furni is in range of the x and y (using the furni's asset dimension)
      const dimensions = furni.getDimensions();

      if (x >= furni.x && y >= furni.y && x <= furni.x + (dimensions.x - 1) && y <= furni.y + (dimensions.y - 1)) {
        furnis.push(furni);
      }
    }

    return furnis;
  }

  private getTileHeightAt(x: number, y: number) {
    if (this._layout[x] !== undefined && this._layout[x][y] !== undefined) {
      return this._layout[x][y];
    }

    return -1;
  }

  // Demo feature, should not be used when going to client <-> server model
  public async clicked(x: number, y: number, z: number) {
    // Get world coords from click
    const existingFurni = this.getAllFurniAtXAndY(x, y);

    // Get the one with the highest z
    let highestZ: any = false;
    if (existingFurni.length > 0) {
      highestZ = existingFurni.reduce((prev: Furniture, curr: Furniture) => {
        return prev.z > curr.z ? prev : curr;
      });
    }

    const throne = await AssetManager.getFurni(this.placingFurniName);

    if (throne instanceof FurnitureAsset) {
      if (highestZ) {
        if (highestZ.getDimensions().z === 0) {
          console.log("This furni can not be placed on top of another furni");
          return;
        }

        this.addFurni(this.placingFurniName, throne, x, y, parseInt(highestZ.z) + parseInt(highestZ.getDimensions().z), throne.rotations[0]);
      } else {
        this.addFurni(this.placingFurniName, throne, x, y, z, throne.rotations[0]);
      }
    }
  }

  private async loadFloor() {
    let tilesToAdd: addTiles[] = [];

    var y = 0;
    for (var row of this._layout) {
      var x = 0;
      for (let height of row) {
        if (height > -1) {
          let stairs = Stair.checkLayout(x, y, height, this._layout, tilesToAdd);

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

    const tileContainer = new Container();

    for (var tile of tilesToAdd) {
      if (tile.stairs > 0) {
        await this.addStairs(tileContainer, tile.x, tile.y, tile.height, tile.stairs);
      } else {
        await this.addTileBorder(tileContainer, tile.x, tile.y, tile.height);
        await this.addTile(tileContainer, tile.x, tile.y, tile.height);
      }
    }

    const height = TILE_HEIGHT * this._layout.length + this.cameraY;
    const width = TILE_WIDTH * (this._layout[0] ? this._layout[0] : []).length + this.cameraX;

    const renderTexture = new RenderTexture(
      new BaseRenderTexture({
        width,
        height,
      })
    );

    this._renderer.render(tileContainer, {
      renderTexture,
    });

    const s = new Sprite(renderTexture);

    s.interactive = true;

    s.zIndex = 1;

    s.on("click", () => {
      // Call floorClickCallbacks
      this.floorClickCallback.forEach((callback) => {
        callback();
      });
    });

    this.container.addChild(s);
  }

  private async addStairs(container: Container, x: number, y: number, z: number, stair: number) {
    if (stair > -1) {
      let stairs = new Stair(stair);
      let coords = IsoMath.worldToScreenCoord(x, y, z);

      stairs.container.x = coords.x + this.cameraX;
      stairs.container.y = coords.y + this.cameraY;

      container.addChild(stairs.container);
    }
  }

  private async loadWalls() {
    //Fill 10 by 10 tiles
    const wall = new Wall(this.cameraX, this.cameraY);

    let first = false;
    this.layout.forEach((row, y) => {
      row.forEach((height, x) => {
        if (row[x - 1] === undefined && ((this.layout[y - 1] !== undefined && this.layout[y][x] - this.layout[y - 1][x] < 1) || this.layout[y - 1] === undefined)) {
          wall.add(x, y, height, WallSide.LEFT);
        }
      });
    });

    //const sprites = await wall.initialize(walls, 0, 0, width, 0);

    // Add offset to sprites
    /*sprites.forEach((sprite) => {
      sprite.x += this.cameraX;
      sprite.y += this.cameraY - startHeight * IsoMath.TILE_HEIGHT;
    });*/

    wall.container.interactive = true;

    wall.container.on("click", () => {
      // Call wallClickCallbacks
      this.wallClickCallback.forEach((callback) => {
        callback();
      });
    });

    wall.container.zIndex = 0;

    this.container.addChild(wall.container);
  }

  private async addTileBorder(container: Container, x: number, y: number, z: number) {
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

    borderLeft.anchor.x = 1;
    borderLeft.anchor.y = 0;

    borderLeft.tilePosition.x = coords.x + this.cameraX;
    borderLeft.tilePosition.y = coords.y + this.cameraY;

    borderLeft.x = coords.x + this.cameraX;
    borderLeft.y = coords.y + this.cameraY;

    const borderRight = new TilingSprite(Texture.WHITE);

    borderRight.transform.setFromMatrix(borderRightMatrix);
    borderRight.width = 32;
    borderRight.height = IsoMath.TILE_DEPTH;
    borderRight.tint = 0x666644;

    borderRight.anchor.x = 1;
    borderRight.anchor.y = 0;

    borderRight.tilePosition.x = coords.x + this.cameraX;
    borderRight.tilePosition.y = coords.y + this.cameraY;

    borderRight.x = coords.x + this.cameraX + 32;
    borderRight.y = coords.y + this.cameraY + 16;

    tileBorderContainer.addChild(borderLeft);
    tileBorderContainer.addChild(borderRight);

    container.addChild(tileBorderContainer);
  }

  private async addTile(container: Container, x: number, y: number, z: number) {
    // X and Y to isometric coords
    const screenXCoord = (x - y) * TILE_WIDTH;
    const screenYCoord = ((x + y) * TILE_HEIGHT) / 2 - z * TILE_HEIGHT;

    // Get default floor texture
    const floorTexture = await AssetManager.getFloor("floor_texture_64_0_floor_basic");
    const sprite = new TilingSprite(floorTexture);
    sprite.anchor.x = 0;
    sprite.anchor.y = 0;
    sprite.transform.setFromMatrix(getFloorMatrix(0, 0));
    sprite.width = 32;
    sprite.height = 32;
    sprite.tint = 0x999966;

    // Finally, set the coords of the tile + the camera offset
    sprite.x = screenXCoord + this.cameraX;
    sprite.y = screenYCoord + this.cameraY;

    this._tileCoords.push({
      worldX: x,
      worldY: y,
      x: sprite.x,
      y: sprite.y,
      bounds: sprite.getBounds(),
      worldZ: z,
    });

    container.addChild(sprite);
  }

  public getFurniFromId(id: number) {
    return this.furniture.find((furni) => furni.uniqueId === id);
  }

  public async addFurni(id: string, furni: FurnitureAsset, x: number, y: number, z: number, rotation: number) {
    this.furniture.push(new Furniture(id, x, y, z, rotation, furni, Math.floor(Math.random() * 100000)));
    this.redrawFurni();
  }

  public async redrawFurni() {
    // Loop through all furni and their sprites
    this.furniture.forEach((furni) => {
      // Remove all children from the furni container
      furni.container.removeChildren();
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
      furni.draw();

      // Add offset to sprites
      furni.sprites.forEach((sprite) => {
        sprite.x += this.cameraX;
        sprite.y += this.cameraY;
      });

      if (!this.container.children.includes(furni.container)) {
        this.container.addChild(furni.container);
      }

      furni.container.zIndex = furni.y + furni.x + furni.z + 1;

      furni.container.interactive = true;
      furni.container.on("pointerdown", (event) => {
        this.furniClickCallbacks.forEach((cb) => {
          cb(furni);
        });
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
