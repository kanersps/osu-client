import { useEffect, useRef } from "react";
import RenderEngine from "../engine";

const Client = () => {
  let clientRef = useRef<HTMLDivElement>(null);

  // Only initialize the renderer once for this component
  useEffect(() => {
    const renderer = new RenderEngine();

    // Add it to the DOM
    clientRef.current?.appendChild(renderer.view);
  }, [])

  return <div ref={clientRef}></div>
}

export default Client;