'use strict';
// File that sets up the site,
// and uses the SnailGame class
// All site specific stuff goes here

// constants
const MSG_POINT     = 0
const MSG_SNAIL     = 1
const MSG_NEW_SNAIL = 2
const MSG_DED_SNAIL = 3

// size of out packets (don't include id)
const MSG_POINT_SZ  = 11
const MSG_SNAIL_SZ  = 7

// Globals
var canvas = null;
var ctx = null;

// helper functions
function refitCanvas() {
    var dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);
}

function u16ToColor(num) {
    // 16 bit color, round down
    let r = (num & 0xf800) >> 8;
    let g = (num & 0x07E0) >> 3;
    let b = (num & 0x001F) << 3;

    let cs = "#";
    cs += r.toString(16).padStart(2,'0');
    cs += g.toString(16).padStart(2,'0');
    cs += b.toString(16).padStart(2,'0');

    console.log(cs);
    return cs;
}

function colorToU16(col) {
    // take string of type "#rrggbb" and change it to 16 bit num;
    let r = parseInt(col.substr(1,2), 16);
    let g = parseInt(col.substr(3,2), 16);
    let b = parseInt(col.substr(5,2), 16);

    let num = b >> 3;
    num |= (g & 0xfc) << 3;
    num |= (r & 0xf8) << 8;

    return num;
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
    let ws = new WebSocket("ws://"+ location.host +"/ws");
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
            // send a MSG_POINT
            let msg = new ArrayBuffer(MSG_POINT_SZ);
            let dv = new DataView(msg);

            // Type
            dv.setUint8(0, MSG_POINT, true);
            // x
            dv.setUint16(1, x, true);
            // y
            dv.setUint16(3, y, true);
            // ang
            dv.setUint16(5, ang * 180 / Math.PI, true);
            // color
            dv.setUint16(7, colorToU16(color), true);
            // char
            dv.setUint16(9, inchar.charCodeAt(0), true);

            ws.send(msg);
        };

        game.moveSnailCallback = (x, y, ang) => {
            let msg = new ArrayBuffer(MSG_SNAIL_SZ);
            let dv = new DataView(msg);

            // Type
            dv.setUint8(0, MSG_SNAIL, true);
            // x
            dv.setUint16(1, x, true);
            // y
            dv.setUint16(3, y, true);
            // ang
            dv.setUint16(5, ang * 180 / Math.PI, true);

            ws.send(msg);
        };
    }
    ws.onmessage = (msg_evt) => {
        // parse message, then send it to the snail game
        let data = msg_evt.data;
        let dv = new DataView(data);
        // get message type
        let mt = dv.getUint8(0, true);
        // get Id
        let id = dv.getUint16(1, true);
        let x = 0;
        let y = 0;
        let a = 0;
        let clr = 0;
        let chr = 0;
        let ang = 0;
        let inchar = 0;
        let color = 0;
        switch (mt) {
            case MSG_POINT:
                // x
                x = dv.getUint16(3, true);
                // y
                y = dv.getUint16(5, true);
                // ang
                a = dv.getUint16(7, true);
                // color
                clr = dv.getUint16(9, true);
                // wchar
                chr = dv.getUint16(11, true);

                ang = a * Math.PI / 180;
                inchar = String.fromCharCode(chr);
                color = u16ToColor(clr);

                game.addChar(inchar, x, y, ang, color);
                break;
            case MSG_SNAIL:
                // x
                x = dv.getUint16(3, true);
                // y
                y = dv.getUint16(5, true);
                // ang
                a = dv.getUint16(7, true);

                ang = a * Math.PI / 180;

                game.moveSnail(id, x, y, ang);
                break;
            case MSG_NEW_SNAIL:
                // x
                x = dv.getUint16(3, true);
                // y
                y = dv.getUint16(5, true);
                // ang
                a = dv.getUint16(7, true);
                // color
                clr = dv.getUint16(9, true);

                ang = a * Math.PI / 180;
                color = u16ToColor(clr);

                game.addSnail(id, x, y, ang, color);
                break;
            case MSG_DED_SNAIL:

                game.removeSnail(id);
                break;
            default:
                alert("Got bad Message type!");
        }
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
