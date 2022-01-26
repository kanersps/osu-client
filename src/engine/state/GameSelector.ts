import { selector } from "recoil";
import { gameState } from "./Game";

export const getPlacingFurniName = selector({
  key: "getPlacingFurniName",
  get: ({ get }) => get(gameState).placingFurniName,
});

export const getSelectedFurni = selector({
  key: "getSelectedFurni",
  get: ({ get }) => get(gameState).SelectedFurni,
});
