import { useEffect, useRef } from "react";
import { selector, useRecoilState, useRecoilValue } from "recoil";
import RenderEngine from "../../../../../engine";
import { gameState } from "../../../../../engine/state/Game";
import { getSelectedFurni } from "../../../../../engine/state/GameSelector";
import profile_icon from "../../../shared/profile_icon.png";
import "./furni.css";

export default function FurniContext() {
  const [GameState, setGameState] = useRecoilState(gameState);
  const furniPreviewRef = useRef<HTMLDivElement>(null);
  const renderer = useRef<RenderEngine | null>(null);
  const selectedFurni = useRecoilValue(getSelectedFurni);

  useEffect(() => {
    // Initialize a new renderer for the preview
    renderer.current = new RenderEngine(178, 130);

    // Add it to the DOM
    furniPreviewRef.current?.appendChild(renderer.current.view);

    renderer.current.drawSingleFurni("throne", false, 0x3d3d3d);

    //setRenderer(renderer);
  }, []);

  useEffect(() => {
    if (selectedFurni) {
      renderer.current?.drawSingleFurni(selectedFurni.id, false, 0x3d3d3d);
    }
  }, [selectedFurni]);

  return (
    <div style={{ display: selectedFurni ? "block" : "none" }} className="furni-context-all-container">
      <div className="furni-context-container-container">
        <div
          onClick={() => {
            setGameState({
              ...GameState,
              SelectedFurni: undefined,
            });
          }}
          className="furni-context-container"
        >
          <div className="furni-context-header">
            <div className="furni-context-header-text">{selectedFurni?.id}</div>
            <div className="furni-context-header-close" />

            <div className="context-divider" />

            <div ref={furniPreviewRef} className="furni-context-preview"></div>
          </div>

          <div className="context-divider" />

          <div className="furni-context-owner">
            <div className="furni-owner-context-container">
              <div>
                <img alt="" src={profile_icon} />
              </div>
              <div className="furni-context-owner-text">OWNER</div>
            </div>
          </div>
        </div>

        <div className="furni-context-buttons">
          <div className="furni-context-button">
            <span className="furni-context-button-text">Move</span>
          </div>
          <div
            onClick={() => {
              if (selectedFurni) {
                setGameState({ ...GameState, SelectedFurni: { ...selectedFurni, rotateTo: selectedFurni.rotateTo + 2 } });
              }
            }}
            className="furni-context-button"
          >
            <span className="furni-context-button-text">Rotate</span>
          </div>
          <div className="furni-context-button">
            <span className="furni-context-button-text">Pickup</span>
          </div>
          <div className="furni-context-button">
            <span className="furni-context-button-text">Use</span>
          </div>
        </div>
      </div>
    </div>
  );
}
