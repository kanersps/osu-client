import './ui.css';
import Inventory from "./inventory";
import { useState } from 'react';
import Toolbar from './toolbar';

const UI = () => {
  const [viewInventory, setViewInventory] = useState(false);

  return <div style={{position: "absolute", color: "white", left: 0, top: 0, height: "100%"}}>
    <Toolbar setInventoryDisplayed={setViewInventory} inventoryDisplayed={viewInventory} />
    <Inventory setDisplay={setViewInventory} display={viewInventory}  />
  </div>
}

export default UI;