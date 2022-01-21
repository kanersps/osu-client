import CloseButton from '../shared/close/CloseButton';
import Furniture from './furniture';
import './inventory.css';

const Inventory = () => {
  return <div className="container">
    <div className="header">
      <span className="title">Inventory</span>
      <CloseButton />
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