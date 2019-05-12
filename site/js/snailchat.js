'use strict';
// File that sets up the site,
// and uses the SnailGame class
// All site specific stuff goes here

// constants
const MSG_POINT     = 0
const MSG_SNAIL     = 1
const MSG_NEW_SNAIL = 2
const MSG_DED_SNAIL = 3

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

    // request updates from server, spawn
    ws = new WebSocket("ws://"+ location.host +"/ws");
    ws.binaryType = 'arraybuffer';
    ws.onerror = (err_evt) => {
        console.log("Error", err_evt);
        alert("Connection Lost");
    }
    ws.onclose = (close_evt) => {
        console.log("Close", close_evt);
        alert("Connection Lost");
    }
    ws.onopen = (open_evt) => {
        console.log("Connected");
        // give the snail game this connection
        game.addLetterCallback = (inchar, x, y, ang, color) => {

        };

        game.moveSnailCallback = (x, y, ang) => {

        };
    }
    ws.onmessage = (msg_evt) => {
        // parse message, then send it to the snail game
        let data = msg_evt.data;
        let dv = new DataView(data);
        // get message type

        //game.addSnail(id, x, y, ang, color)
        //game.addChar(inchar, x, y, ang, color)
        //game.moveSnail(id, x, y, ang)
        //game.removeSnail(id)
    }


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
