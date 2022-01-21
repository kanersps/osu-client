import { useEffect, useRef } from "react";
import RenderEngine from "../engine";
import UI from "./ui";

const Client = () => {
  let clientRef = useRef<HTMLDivElement>(null);

  // Only initialize the renderer once for this component
  useEffect(() => {
    const renderer = new RenderEngine();

    renderer.initialize();

    // Add it to the DOM
    clientRef.current?.appendChild(renderer.view);
  }, [])

  return <div>
    <div ref={clientRef}></div>
    <UI />
  </div>
}

export default Client;