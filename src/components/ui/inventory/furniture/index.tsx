import { useEffect, useRef, useState } from "react";
import { useRecoilState } from "recoil";
import RenderEngine from "../../../../engine";
import { gameState } from "../../../../engine/state/Game";
import "./furniture.css";

interface UIFurniture {
  name: string;
  pretty_name: string;
  amount: number;
}

interface FilledFurnitureType {
  furni: UIFurniture[];
}

function useForceUpdate() {
  const [value, setValue] = useState(0); // integer state
  return () => setValue((value) => value + 1); // update the state to force render
}

const EmptyFurniture = () => {
  return (
    <div>
      <div className="empty_image" />
      <div className="empty_text">
        <div className="empty_title">This category seems to be empty!</div>
        <br />
        <div className="empty_description">You've either placed all your Furni in your rooms or you haven't purchased any yet. Check the Osu Shop to see what's available!</div>
      </div>
    </div>
  );
};

const FilledFurniture = (props: FilledFurnitureType) => {
  const initialState: { [key: string]: boolean } = {};
  const [renderer, setRenderer] = useState<RenderEngine | null>(null);
  const [loadedImages, setLoadedImages] = useState(initialState);
  const [activeFurni, setActiveFurni] = useState("");
  const [activeFurniName, setActiveFurniName] = useState("");
  const furniPreviewRef = useRef<HTMLDivElement>(null);
  const [GameState, setGameState] = useRecoilState(gameState);

  useEffect(() => {
    // Initialize a new renderer for the preview
    const renderer = new RenderEngine(178, 130);

    // Add it to the DOM
    furniPreviewRef.current?.appendChild(renderer.view);

    //renderer.drawSingleFurni("throne");
    setRenderer(renderer);
  }, []);

  return (
    <div>
      <div className="furni_filters">
        <input className="furni_search"></input>
        <select className="furni_filter">
          <option>Any type</option>
          <option>Floor items</option>
          <option>Wall items</option>
        </select>
      </div>

      <div className="furni_list">
        {props.furni?.map((furni) => {
          return (
            <div
              onClick={() => {
                if (activeFurni == furni.name) {
                  setActiveFurni("");
                } else {
                  renderer?.drawSingleFurni(furni.name, true, 0xe9e9e1);
                  setActiveFurni(furni.name);
                  setActiveFurniName(furni.pretty_name);
                }
              }}
              key={furni.name}
              className="furni"
            >
              {furni.amount > 1 && <div className="furni_amount">{furni.amount}</div>}

              <div className="furni_icon_container">
                {loadedImages[furni.name] === undefined ? <div className="furni_icon_loading" /> : <div className="furni_icon_bg"></div>}
                <img
                  alt=""
                  onLoad={() => {
                    setLoadedImages({ ...loadedImages, [furni.name]: true });
                  }}
                  className="furni_icon furni_icon_loaded"
                  src={`http://localhost:3000/furni_icons/${furni.name}_icon.png`}
                ></img>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ opacity: activeFurni === "" ? 0 : 1 }} className="furni_selected">
        {/* TODO: Add "tradable" count, PS: this preview was really fun to make */}
        <div ref={furniPreviewRef} className="furni_preview" />
        <div className="furni_info">
          <p className="furni_name">{activeFurniName}</p>
          <div
            onClick={() => {
              setGameState({ ...GameState, inventoryOpen: false, placingFurniName: activeFurni });
            }}
            className="furni_active_btn"
          >
            Place in room
          </div>
          <div className="furni_active_btn">Sell in marketplace</div>
        </div>
      </div>
    </div>
  );
};

export default function Furniture() {
  const furni: UIFurniture[] = [
    {
      name: "black_dino_egg",
      pretty_name: "Black Dino Egg",
      amount: 2,
    },
    {
      name: "throne",
      pretty_name: "Throne",
      amount: 3,
    },
    {
      name: "CF_50_goldbar",
      pretty_name: "Gold Bar (Worth 50 Credits)",
      amount: 1,
    },
    {
      name: "uni_nstand",
      pretty_name: "Dorm Nightstand",
      amount: 1,
    },
    {
      name: "js_c16_bed",
      pretty_name: "Bed",
      amount: 1,
    },
    {
      name: "bed_armas_two",
      pretty_name: "Bed",
      amount: 1,
    },
    {
      name: "classic9_table",
      pretty_name: "Table",
      amount: 1,
    },
    {
      name: "habbowood_chair",
      pretty_name: "Bed",
      amount: 1,
    },
    {
      name: "ads_teletubbies_noonoo",
      pretty_name: "Noo Noo",
      amount: 1,
    },
    {
      name: "hween08_bio",
      pretty_name: "Biohazard Poster",
      amount: 14,
    },
    {
      name: "club_sofa",
      pretty_name: "Club Sofa",
      amount: 1,
    },
    {
      name: "cubie_nt_shelf_1_b",
      pretty_name: "Cube",
      amount: 1,
    },
  ];

  return <div className="furniture_container">{furni.length === 0 ? <EmptyFurniture /> : <FilledFurniture furni={furni} />}</div>;
}
