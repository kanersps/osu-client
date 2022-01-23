import "./toolbar.css"

import inventory from "./icons/inventory.png";
import close_left from "./icons/close-left.png";
import logo from "../shared/logo.png";
import navigator from "./icons/nav.png";

const Toolbar = ({ inventoryDisplayed, setInventoryDisplayed }: { inventoryDisplayed: boolean, setInventoryDisplayed: (toggle: boolean) => void }) => {
  return <div className="toolbar">
    <div className="toolbar-left">
      <img alt="" className="toolbar-close" src={close_left} />

      <div className="toolbar-item-left toolbar-logo">
        <img src={logo} alt="" width={28} height={32} />
      </div>

      <div className="toolbar-item-left navigator-icon">
        <img alt="" src={navigator} />
      </div>

      <div className="toolbar-item-left inventory-icon">
        <img alt="" src={inventory} onClick={() => { setInventoryDisplayed(!inventoryDisplayed) }} />

        <div className="toolbar-inventory-new-furniture">
          <p className="toolbar-inventory-new-furniture-count">3</p>
        </div>
      </div>
    </div>
  </div>
}

export default Toolbar;