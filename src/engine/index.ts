import { Application as PixiApplication } from "pixi.js";

class RenderEngine {
  _app: PixiApplication;

  constructor() {
    this._app = new PixiApplication({ 
      width: window.innerWidth,
      height: window.innerHeight,
    });

    this._app.start();
  }

  get view() {
    return this._app.view;
  }

  quit(): void {
    this._app.stop();
  }
}

export default RenderEngine;