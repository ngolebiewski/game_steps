import SceneManager from "./sceneManager";

// --- Buttons ---
// Configs to be dropped into levels so the event listeners don;t cancel eachother out
// One Day: Turn into classes? Unless Buttons just dropped for Sprite based interactive things.

// titleScene.buttonConfig 
export const titleSceneButton = {
  text: "START",
  x: 150,
  y: 150,
  width: 120,
  height: 50,
  onClick: () => {
    playStart();
    startSong();
    sceneManager.changeScene(sceneOne);
    sceneOne.start();
  },
  color: "green",
};

// endScene.buttonConfig 
export const endSceneButton = {
  text: "PLAY AGAIN",
  x: 150,
  y: 150,
  width: 120,
  height: 50,
  onClick: () => {
    playStart();
    g.deathsCollected++;
    sceneManager.changeScene(sceneOne);
    sceneOne.start();
  },
  color: "purple",
};