import { atom, selector } from "recoil";

class GameState {
  public cameraOffsetX: number = 400;
  public cameraOffsetY: number = 400;
  public placingFurniName: string = "";
  public GhostFurni: boolean = true;
  public inventoryOpen: boolean = false;
}

export const gameState = atom({
  key: "gameState",
  default : new GameState()
})

export const inventoryOpen = selector({
  key: "inventoryOpen",
  get: ({get}) => get(gameState).inventoryOpen,
});

export const furniPlacingName = selector({
  key: "inventoryOpen",
  get: ({get}) => get(gameState).placingFurniName,
});

export default GameState;