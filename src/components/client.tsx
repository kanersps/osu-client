import { useCallback, useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import RenderEngine from "../engine";
import { furniPlacingName, gameState } from "../engine/state/Game";
import UI from "./ui";

const Client = () => {
  let clientRef = useRef<HTMLDivElement>(null);
  let [mouseInRoom, setMouseInRoom] = useState(false);
  let [GameState, setGameState] = useRecoilState(gameState);

  let renderer = useRef<RenderEngine | null>(null);
  const ghostFurni = useRecoilValue(furniPlacingName);

  // Only initialize the renderer once for this component
  useEffect(() => {
    renderer.current = new RenderEngine();

    renderer.current.initialize();

    renderer.current.getCurrentRoom()?.setGhostFurni("throne");

    // Add it to the DOM
    clientRef.current?.appendChild(renderer.current.view);
  }, []);

  useEffect(() => {
    if (renderer.current?.activeRoom) {
      renderer.current.activeRoom.container.interactive = true;

      renderer.current.activeRoom.container.on("mouseout", () => {
        setMouseInRoom(false);
      });

      renderer.current.activeRoom.container.on("mouseover", () => {
        setMouseInRoom(true);
      });
    }

    const mouseDownEvent = (event: MouseEvent) => {
      if (!mouseInRoom && GameState.placingFurniName !== "") {
        setGameState({ ...GameState, placingFurniName: "", inventoryOpen: true });
      }

      let coords = renderer.current?.activeRoom?.getTileFromXAndY(event.x, event.y);

      console.log(coords);
    };

    const mouseMoveEvent = (event: MouseEvent) => {
      let coords = renderer.current?.activeRoom?.getTileFromXAndY(event.x, event.y);

      const room = renderer.current?.activeRoom;

      if (room && coords) {
        room.updateGhostFurniSimple(coords.x, coords.y, coords.z);
      }
    };

    window.addEventListener("mousedown", mouseDownEvent);
    window.addEventListener("mousemove", mouseMoveEvent);

    return function () {
      window.removeEventListener("mousedown", mouseDownEvent);
      window.removeEventListener("mousemove", mouseMoveEvent);
    };
  }, [GameState, mouseInRoom, setGameState]);

  useEffect(() => {
    renderer.current?.getCurrentRoom()?.setPlacingFurniName(ghostFurni);
  }, [ghostFurni]);

  return (
    <div>
      <div ref={clientRef}></div>
      <UI />
    </div>
  );
};

export default Client;
