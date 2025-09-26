# Game Experiment_02
## Scale up canvas via implementing a buffer

Draw original pixel ratio of everything to a canvas (buffer).
Take that buffer canvas and scale it to screen size/full screen,
Accommodate device pixel ratio (DPR), i.e. so pixels don't get blurry on retina screens,' ref: https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio
Note: Drawing text and then resizing makes it look terrible. Fix in future: make pixel font

