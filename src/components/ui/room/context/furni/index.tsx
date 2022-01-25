import { useEffect, useRef } from "react";
import { useRecoilState } from "recoil"
import RenderEngine from "../../../../../engine";
import { gameState } from "../../../../../engine/state/Game"
import profile_icon from "../../../shared/profile_icon.png";
import "./furni.css"

export default function FurniContext() {
  const [GameState, setGameState] = useRecoilState(gameState);
  const furniPreviewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize a new renderer for the preview
    const renderer = new RenderEngine(178, 130);

    // Add it to the DOM
    furniPreviewRef.current?.appendChild(renderer.view);

    renderer.drawSingleFurni("throne", false, 0x3d3d3d);

    //setRenderer(renderer);
  }, []);

  return <div className="furni-context-all-container">
    <div className="furni-context-container-container">
      <div className="furni-context-container">
        <div className="furni-context-header">
          <div className="furni-context-header-text">{ GameState.SelectedFurni.name }</div>
          <div className="furni-context-header-close"/>

          <div className="context-divider" />

          <div ref={furniPreviewRef} className="furni-context-preview">
            
          </div>
        </div>

        <div className="context-divider" />

        <div className="furni-context-owner">
          <div className="furni-owner-context-container">
            <div>
              <img alt="" src={profile_icon} />
            </div>
            <div className="furni-context-owner-text">{ GameState.SelectedFurni.owner }</div>
          </div>
        </div>
      </div>

      <div className="furni-context-buttons">
        <div className="furni-context-button">
          <span className="furni-context-button-text">Move</span>
        </div>
        <div className="furni-context-button">
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
}