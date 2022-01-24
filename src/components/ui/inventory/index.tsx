import { useRecoilState } from 'recoil';
import { gameState } from '../../../engine/state/Game';
import CloseButton from '../shared/close/CloseButton';
import Furniture from './furniture';
import './inventory.css';

const Inventory = ({ setDisplay, display }: { setDisplay: (display: boolean) => void, display: boolean }) => {
  const [GameState, setGameState] = useRecoilState(gameState);

  return <div className="container" style={{display: GameState.inventoryOpen ? "block" : "none"}}>
    <div className="header">
      <span className="title">Inventory</span>
      <CloseButton onClick={() => { setGameState({...GameState, inventoryOpen: false }) }} />
    </div>

    <div className="tabs">
      <div className="tab active">Furniture</div>
      <div className="tab">Rentables</div>
      <div className="tab">Pets</div>
      <div className="tab">Achieved badges</div>
      <div className="tab">Bots</div>
    </div>

    <div className="content">
      <Furniture />
    </div>
  </div>
}

export default Inventory;