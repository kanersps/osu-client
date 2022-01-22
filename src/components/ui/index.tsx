import './ui.css';
import Inventory from "./inventory";
import { useState } from 'react';

const UI = () => {
  const [viewInventory, setViewInventory] = useState(true);

  return <div style={{position: "absolute", color: "white", left: 0, top: 0, display: "block"}}>
    <Inventory setDisplay={setViewInventory} display={viewInventory}  />
  </div>
}

export default UI;