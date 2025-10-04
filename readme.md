# Game Experiments --> JavaScript/Canvas Game making sans engines and libraries.

Using "Tiny Dungeon" 2d image assets from Kenney: https://kenney.nl/assets/tiny-dungeon via Creative Commons CC0 license

Saving a different folder for each 'milestone' putting a game together.

Canvas reference via MDN (Mozilla Developer Network): https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
Mozilla's Game Development: https://developer.mozilla.org/en-US/docs/Games

## 00_scene_manager

Goal: Set up a Scene manager and level system. Let's go from a title scene to a game scene (level one) to an end scene.

- Make a fixed sized small canvas
- Implemented a scene system with buttons to move between them. Use Object Oriented Programming.
- Had an issue with the buttons not working, it was becuase event listeners for a click event kept on stacking up. Answer: DESTROY them.
- Also, on the button note, only create them when being used in a level/scene, so everything is created that needs to be created.
- Side note: Probably better to use a button sprite than draw a button shape like this in the long run
- Other note: Drawing text looks terrible, Later on we'll add in a bitmap font.

## 01_basic_sprites

Goal: What's a game without a character to move around? Here we get some sprites from a spritesheet and make them move around.

- Grab some Creative Commons CC0 license game assets from Kenney: https://kenney.nl/assets/tiny-dungeon
- Ok, lets use a wizard and have the wizard get to the cross. 
- Unusual approach to tiles here, usually they're numbered, but here doing a column/row finding method
- Later on, lets make a character class, but now there's just 2 sprites, so this is ok
- A Math Min/MAx function *clamps* the player to within the bounds of the canvas. May rewrite in another iteration using `clamp`
- Win state is reaching the gravestone cross, which takes you to the 'game over' scene.
- Reset the pplayer to the start position, and randomly replace the cross.
- Note: It's fun to move fast, but we really need some obstacles and interaction on the way there. Stay tuned.

## 02_fullscreen_buffer

Goal: Resize Canvas to browser fullscreen size while keeping sprite pixels sharp and retro VIA a buffer. Draw on the initial scale. then resize up.

- 2 canvas system, kind of leaning on AI.
- BVr

## 03_sound_effects

Goal: Games *NEED* sound! Add in soundeffects and some music, all generated with JavaScript.

- Web Audio Context API here we go.

## 04_player_class_refactor

Goal: We need opponents (monsters, villains, you name it). We'll need to track location, health, etc -- so let's pull the player into a character/player class, and extend that to a monster class. Let's break out some of the other classes too, because this code is getting LONG.

- ok, added in Classes as independent js files for:
    - Button
    - GameView (does all the canvas, buffer, and context drawing)
    - globals (on the fence about this. Should probably be its own class...)
    - Level
    - MovementControler (decouple the controls from the level functions/sprites -- and add in touch controls (to be tested))
    - SceneManager (switch between levels)
    - Sprite (gets the sprite for you)

- now this is a lot more manageable

## 05 Walls

Goal: We need walls! It is way to easy to get to the cross. So, lets add in a maze. I feel like this will be Pac-Man-ish! But, what about autogenerating the course each time. Procedural dungeons...

Eventually lets have a tilemap, but for now, with 1 wall tile, lets see what we can make.

## 06 Endless Maze

Want to work from a current version, so it is easier to see what has changed. When a new 'level' has been reached, i.e. 06 Expand walls add camera, save it as that in another folder to have a playable record of each iteration.

- Maze generation, Breadth First Search (BFS) out in the wild!

- moved out button config data to ui.js --> Could probably make a class, but may just drop that feature since it draws a regular font, and not a bitmap font --> UPDATE: didn't work, ignore since will end up dropping buttons.

- Quick to implement, Longer to refactor into a mazeGenerator and Camera Class.

- Moved the Global variables into a Global class, so managed slightly better.

## 07 Monster Time

This game is boring without an adversary. Let's get some monsters in the maze. More collission detection, health, death state...

## GAMEPLAN...
- IDEA: Make candles be an object to find. Less candles, less light and the view distance radius decreases. Always with a bit of flicker, maybe cool flame particles. Out of light? Search around in the darkness for a few seconds then...GAME OVER! 

*Kudos to my favorite game when I was 6: 'Cave of the Word Wizard'.*

>It's getting darker...
