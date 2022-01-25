import { atom, selector } from "recoil";

class SelectedFurni {
  name: string = "Throne";
  description: string = "Important Habbos only";
  owner: string = "Kanersps";
}

class GameState {
  public cameraOffsetX: number = 400;
  public cameraOffsetY: number = 400;
  public placingFurniName: string = "throne";
  public GhostFurni: boolean = true;
  public inventoryOpen: boolean = false;
  public SelectedFurni: SelectedFurni = new SelectedFurni();
}

export const gameState = atom({
  key: "gameState",
  default: new GameState(),
});

export const inventoryOpen = selector({
  key: "inventoryOpen",
  get: ({ get }) => get(gameState).inventoryOpen,
});

export const furniPlacingName = selector({
  key: "inventoryOpen",
  get: ({ get }) => get(gameState).placingFurniName,
});

export default GameState;
