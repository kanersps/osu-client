import { atom, selector } from "recoil";
import Furniture from "../models/Furniture";

class SelectedFurni {
  id: string = "throne";
  name: string = "Throne";
  description: string = "Important Habbos only";
  owner: string = "Kanersps";
  uniqueId: number = -1;
  rotateTo: number = 0;
}

interface GameState {
  cameraOffsetX: number;
  cameraOffsetY: number;
  placingFurniName: string;
  GhostFurni: boolean;
  inventoryOpen: boolean;
  SelectedFurni: SelectedFurni | undefined;
}

const initialValue: GameState = {
  cameraOffsetX: 400,
  cameraOffsetY: 400,
  placingFurniName: "",
  GhostFurni: false,
  inventoryOpen: false,
  SelectedFurni: undefined,
};

export const gameState = atom({
  key: "gameState",
  default: initialValue,
});

export default GameState;
