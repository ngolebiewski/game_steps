// --- SceneManager ---
export default class SceneManager {
  constructor() {
    this.scene = null;
  }

  changeScene(scene) {
    if (this.scene) this.scene.destroy();
    this.scene = scene;
    this.scene.init();
  }
}