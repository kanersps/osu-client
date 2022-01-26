import { useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import RenderEngine from "../engine";
import Furniture from "../engine/models/Furniture";
import { gameState } from "../engine/state/Game";
import { getPlacingFurniName, getSelectedFurni } from "../engine/state/GameSelector";
import UI from "./ui";

const Client = () => {
  let clientRef = useRef<HTMLDivElement>(null);
  let [GameState, setGameState] = useRecoilState(gameState);
  let renderer = useRef<RenderEngine | null>(null);
  const placingFurniName = useRecoilValue(getPlacingFurniName);
  const selectedFurni = useRecoilValue(getSelectedFurni);

  // Only initialize the renderer once for this component
  useEffect(() => {
    renderer.current = new RenderEngine();

    renderer.current.initialize();

    renderer.current.getCurrentRoom()?.setGhostFurni("throne");

    // Add it to the DOM
    clientRef.current?.appendChild(renderer.current.view);
  }, []);

  useEffect(() => {
    const room = renderer.current?.activeRoom;

    const callback = (furni: Furniture) => {
      if (placingFurniName === "") {
        setGameState({
          ...GameState,
          SelectedFurni: {
            id: furni.id,
            owner: "Kanersps",
            description: "",
            name: furni.id,
            // Temporarily just use their index in the Room, TODO: change to actual furni id when going to server <-> client model
            uniqueId: furni.uniqueId,
            // Again temporary, should be a network request instead
            rotateTo: furni.rotation,
          },
        });
      }
    };

    const removeFurniContextMenu = () => {
      setGameState({
        ...GameState,
        SelectedFurni: undefined,
      });
    };

    if (room !== undefined) {
      room.addFurniClickCallback(callback);
      room.addFloorClickCallback(removeFurniContextMenu);
      room.addWallClickCallback(removeFurniContextMenu);
    }

    return () => {
      room?.removeFurniCallback(callback);
      room?.removeFloorClickCallback(removeFurniContextMenu);
      room?.removeWallClickCallback(removeFurniContextMenu);
    };
  }, [GameState, setGameState, placingFurniName]);

  useEffect(() => {
    if (renderer.current?.activeRoom) {
      renderer.current.activeRoom.container.interactive = true;
    }

    const mouseDownEvent = async (event: MouseEvent) => {
      let coords = renderer.current?.activeRoom?.getTileFromXAndY(event.x, event.y);

      const room = renderer.current?.activeRoom;

      if (room && coords) {
        if (coords.x === -1) {
          if (GameState.placingFurniName !== "") {
            setGameState({ ...GameState, placingFurniName: "", inventoryOpen: true });
          }

          room.updateGhostFurniSimple(-1, -1, -1);

          return;
        }

        if (GameState.placingFurniName !== "") {
          await room.clicked(coords.x, coords.y, coords.z);
          room.updateGhostFurniSimple(coords.x, coords.y, coords.z);
        }
      }
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
  }, [GameState, setGameState]);

  useEffect(() => {
    renderer.current?.getCurrentRoom()?.setPlacingFurniName(placingFurniName);
  }, [placingFurniName]);

  useEffect(() => {
    if (selectedFurni) {
      let targetFurni = renderer.current?.getCurrentRoom()?.getFurniFromId(selectedFurni.uniqueId);

      if (targetFurni && targetFurni.uniqueId === selectedFurni.uniqueId && targetFurni.rotation !== selectedFurni.rotateTo) {
        if (targetFurni.isRotationPossible(selectedFurni.rotateTo)) {
          targetFurni.rotation = selectedFurni.rotateTo;

          renderer.current?.getCurrentRoom()?.redrawFurni();
        } else {
          setGameState({ ...GameState, SelectedFurni: { ...selectedFurni, rotateTo: targetFurni.getFirstRotation() } });
        }
      }
    }
  }, [GameState, selectedFurni, setGameState]);

  return (
    <div>
      <div ref={clientRef}></div>
      <UI />
    </div>
  );
};

export default Client;
