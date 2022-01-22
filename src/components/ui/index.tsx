import './ui.css';
import Inventory from "./inventory";

const UI = () => {
  return <div style={{position: "absolute", color: "white", left: 0, top: 0, display: "none"}}>
    <Inventory />
  </div>
}

export default UI;