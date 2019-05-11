'use strict';
// File that sets up the site,
// and uses the SnailGame class
// All site specific stuff goes here

// Globals
var canvas = null;
var ctx = null;

// helper functions
function refitCanvas() {
    var dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);
    console.log("Scaled canvas to", (window.innerWidth * dpr), "by", (window.innerHeight * dpr));
}


var dbgglobal = null;
// Start stuff
document.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById("can_chat");
    ctx = canvas.getContext('2d');
    
    //TODO first, character customize

    // create character / game
    let game = new SnailGame(canvas, ctx);

    dbgglobal = game;

    // fit canvas
    window.addEventListener('resize', () => {
        refitCanvas();
        game.resize();
    });

    refitCanvas();
    game.resize();

    let prevtime = performance.now();
    // start drawing
    let framefunc = (timestamp) => {
        window.requestAnimationFrame(framefunc);
        game.update(timestamp - prevtime);
        game.draw(timestamp - prevtime);
        prevtime = timestamp;
    }
    framefunc(0);

    //TODO
    // request updates from server
    // tell the game to connect to the websocket

    // Accept input


    document.addEventListener('keydown', (event) => {
        if (event.repeat) {
            return;
        }
        switch(event.code) {
            case "ArrowLeft":
                game.moveHeading(-1);
                return;
            case "ArrowRight":
                game.moveHeading(1);
                return;
        }
        if (event.key.length === 1) {
            game.insertCharacter(event.key);
        }
        
    });
    document.addEventListener('keyup', (event) => {
        switch(event.code) {
            case "ArrowLeft":
            case "ArrowRight":
                game.moveHeading(0);
                return;
        }
    });
    
});
