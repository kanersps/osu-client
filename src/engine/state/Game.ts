import Room from "../room";

class GameState {
  static cameraOffsetX: number = 400;
  static cameraOffsetY: number = 400;
  static CurrentRoom: Room;
  static PlacingFurniName: string = "throne";
}

export default GameState;