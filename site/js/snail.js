'use strict';
// File with snail game specific stuff here
// but no site specific stuff
// we don't care about where the canvas is
// or where we are connected to

//unprintable characters
var unprintable = /[\0-\x1F\x7F-\x9F\xAD\u0378\u0379\u037F-\u0383\u038B\u038D\u03A2\u0528-\u0530\u0557\u0558\u0560\u0588\u058B-\u058E\u0590\u05C8-\u05CF\u05EB-\u05EF\u05F5-\u0605\u061C\u061D\u06DD\u070E\u070F\u074B\u074C\u07B2-\u07BF\u07FB-\u07FF\u082E\u082F\u083F\u085C\u085D\u085F-\u089F\u08A1\u08AD-\u08E3\u08FF\u0978\u0980\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA\u09BB\u09C5\u09C6\u09C9\u09CA\u09CF-\u09D6\u09D8-\u09DB\u09DE\u09E4\u09E5\u09FC-\u0A00\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A\u0A3B\u0A3D\u0A43-\u0A46\u0A49\u0A4A\u0A4E-\u0A50\u0A52-\u0A58\u0A5D\u0A5F-\u0A65\u0A76-\u0A80\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA\u0ABB\u0AC6\u0ACA\u0ACE\u0ACF\u0AD1-\u0ADF\u0AE4\u0AE5\u0AF2-\u0B00\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A\u0B3B\u0B45\u0B46\u0B49\u0B4A\u0B4E-\u0B55\u0B58-\u0B5B\u0B5E\u0B64\u0B65\u0B78-\u0B81\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BBD\u0BC3-\u0BC5\u0BC9\u0BCE\u0BCF\u0BD1-\u0BD6\u0BD8-\u0BE5\u0BFB-\u0C00\u0C04\u0C0D\u0C11\u0C29\u0C34\u0C3A-\u0C3C\u0C45\u0C49\u0C4E-\u0C54\u0C57\u0C5A-\u0C5F\u0C64\u0C65\u0C70-\u0C77\u0C80\u0C81\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA\u0CBB\u0CC5\u0CC9\u0CCE-\u0CD4\u0CD7-\u0CDD\u0CDF\u0CE4\u0CE5\u0CF0\u0CF3-\u0D01\u0D04\u0D0D\u0D11\u0D3B\u0D3C\u0D45\u0D49\u0D4F-\u0D56\u0D58-\u0D5F\u0D64\u0D65\u0D76-\u0D78\u0D80\u0D81\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0DC9\u0DCB-\u0DCE\u0DD5\u0DD7\u0DE0-\u0DF1\u0DF5-\u0E00\u0E3B-\u0E3E\u0E5C-\u0E80\u0E83\u0E85\u0E86\u0E89\u0E8B\u0E8C\u0E8E-\u0E93\u0E98\u0EA0\u0EA4\u0EA6\u0EA8\u0EA9\u0EAC\u0EBA\u0EBE\u0EBF\u0EC5\u0EC7\u0ECE\u0ECF\u0EDA\u0EDB\u0EE0-\u0EFF\u0F48\u0F6D-\u0F70\u0F98\u0FBD\u0FCD\u0FDB-\u0FFF\u10C6\u10C8-\u10CC\u10CE\u10CF\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B\u135C\u137D-\u137F\u139A-\u139F\u13F5-\u13FF\u169D-\u169F\u16F1-\u16FF\u170D\u1715-\u171F\u1737-\u173F\u1754-\u175F\u176D\u1771\u1774-\u177F\u17DE\u17DF\u17EA-\u17EF\u17FA-\u17FF\u180F\u181A-\u181F\u1878-\u187F\u18AB-\u18AF\u18F6-\u18FF\u191D-\u191F\u192C-\u192F\u193C-\u193F\u1941-\u1943\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19CF\u19DB-\u19DD\u1A1C\u1A1D\u1A5F\u1A7D\u1A7E\u1A8A-\u1A8F\u1A9A-\u1A9F\u1AAE-\u1AFF\u1B4C-\u1B4F\u1B7D-\u1B7F\u1BF4-\u1BFB\u1C38-\u1C3A\u1C4A-\u1C4C\u1C80-\u1CBF\u1CC8-\u1CCF\u1CF7-\u1CFF\u1DE7-\u1DFB\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FC5\u1FD4\u1FD5\u1FDC\u1FF0\u1FF1\u1FF5\u1FFF\u200B-\u200F\u202A-\u202E\u2060-\u206F\u2072\u2073\u208F\u209D-\u209F\u20BB-\u20CF\u20F1-\u20FF\u218A-\u218F\u23F4-\u23FF\u2427-\u243F\u244B-\u245F\u2700\u2B4D-\u2B4F\u2B5A-\u2BFF\u2C2F\u2C5F\u2CF4-\u2CF8\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D71-\u2D7E\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF\u2E3C-\u2E7F\u2E9A\u2EF4-\u2EFF\u2FD6-\u2FEF\u2FFC-\u2FFF\u3040\u3097\u3098\u3100-\u3104\u312E-\u3130\u318F\u31BB-\u31BF\u31E4-\u31EF\u321F\u32FF\u4DB6-\u4DBF\u9FCD-\u9FFF\uA48D-\uA48F\uA4C7-\uA4CF\uA62C-\uA63F\uA698-\uA69E\uA6F8-\uA6FF\uA78F\uA794-\uA79F\uA7AB-\uA7F7\uA82C-\uA82F\uA83A-\uA83F\uA878-\uA87F\uA8C5-\uA8CD\uA8DA-\uA8DF\uA8FC-\uA8FF\uA954-\uA95E\uA97D-\uA97F\uA9CE\uA9DA-\uA9DD\uA9E0-\uA9FF\uAA37-\uAA3F\uAA4E\uAA4F\uAA5A\uAA5B\uAA7C-\uAA7F\uAAC3-\uAADA\uAAF7-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F-\uABBF\uABEE\uABEF\uABFA-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBC2-\uFBD2\uFD40-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFE\uFDFF\uFE1A-\uFE1F\uFE27-\uFE2F\uFE53\uFE67\uFE6C-\uFE6F\uFE75\uFEFD-\uFF00\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFDF\uFFE7\uFFEF-\uFFFB\uFFFE\uFFFF]/g;

class SnailPlayer {
    constructor(id, x, y, ang, color) {
        this.id = id;
        this.x = x; // in pxish
        this.y = y; // in px
        this.ang = ang; // in radians
        this.color = color; // as css color value string
        //this.font = font; // as css font value string
        //TODO lerp position between key presses
        this.img = new Image();
        this.img.src = '/img/snailSmall.png';
    }
}

class SnailGame {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;

        this.dirty = true;

        // each data point is: character(uint16), pos(2 uint16s), ang(uint16?), color(uint16)
        // in the future I might add stroke color and font
        // in which case I will have a style table, and a style index per char?
        //TODO
        // garbage collect data way far away
        this.data = [];

        // player info
        this.user = null;
        this.players = [];

        // user specific info
        this.lastinputspace = 0;
        this.rotTo = 0;
        this.rotIn = 0;
        this.WanderPos = 0.0;

        // overall game settings
        this.rotRate = 0.075;
        this.WanderRate = 0.3;
        this.WanderMax = 0.06;
        this.maxspace = 3;

        // set ctx settings that don't change
        this.setCtx();

        this.dirty = true;
        this.w2 = 0;
        this.h2 = 0;

        this.moveSnailCallback = null;
        this.addLetterCallback = null;
    }

    addSnail(id, x, y, ang, color) {
        let newsnail = new SnailPlayer(id, x, y, ang, color);
        this.players.push(newsnail);
        if (id == 0) {
            this.rotTo = ang;
            this.user = newsnail;
        }
        this.dirty = true;

        console.log("Got another snail with id", id, "at", x, y);
    }

    moveSnail(id, x, y, ang) {
        for (let i=0; i<this.players.length; i++) {
            if (id === this.players[i].id) {
                this.players[i].x = x;
                this.players[i].y = y;
                this.players[i].ang = ang;
                this.dirty = true;
                break;
            }
        }

        this.dirty = true;
    }

    removeSnail(id) {
        // race condition here?
        this.players = this.players.filter((player) => player.id != id);
        this.dirty = true;

        console.log("Removed snail", id);

        this.dirty = true;
    }

    setCtx() {
        // sets default context stuff
        // should only have to be done at the start, and after a resize
        this.ctx.fillStyle = '#000000';
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.font = "21px sans-serif";
        this.ctx.textAlign = "left";
        this.ctx.textBaseline = "middle";
    }

    resize() {
        this.w2 = this.canvas.width/2;
        this.h2 = this.canvas.height/2;
        this.dirty = true;
        ctx.restore();
        this.setCtx();
    }

    wanderAmt() {
        let goless = this.WanderPos >= ((Math.random()*2)-1);
        let amt = Math.random() * this.WanderRate;
        if (goless) {
            amt *= -1;
        }

        this.WanderPos += amt;

        return this.WanderPos * this.WanderMax;
    }

    rotateStep() {
        if (this.user == null) {
            return;
        }
        // update user.ang based on current ang, rotRate, rotTo, and rotRand()
        let dr = this.rotTo - this.user.ang;
        // adjust so we turn the correct way
        while (dr > Math.PI) {
            dr -= 2*Math.PI;
        }
        while (dr < -Math.PI) {
            dr += 2*Math.PI;
        }

        let rotAmt = dr * this.rotRate;
        this.user.ang += rotAmt + this.wanderAmt();
    }

    moveHeading(amt) {
        this.rotIn = amt;
    }

    addChar(inchar, x, y, ang, color) {
        this.data.push({
            c: inchar,
            x: x,
            y: y,
            ang: ang, 
            color: color
        });

        this.dirty = true;
    }

    insertCharacter(inchar) {
        if (this.user == null) {
            return false;
        }
        if (this.moveSnailCallback === null || this.addLetterCallback === null) {
            return false;
        }
        // if it is a whitespace character, limit it to only one
        if (inchar.length !== 1) {
            return false;
        }
        if (inchar == ' ') {
            if (this.lastinputspace >= this.maxspace) {
                return false;
            } else {
                this.lastinputspace++;
            }
        } else {
            this.lastinputspace = 0;
        }

        // check for unprintable
        if (inchar.replace(unprintable, '').length !== 1) {
            return false;
        }

        // ok, add the character
        if (inchar != ' ') {
            this.addChar(inchar, this.user.x, this.user.y, this.user.ang, this.user.color);
            this.addLetterCallback(inchar, this.user.x, this.user.y, this.user.ang, this.user.color);
        }

        // move forward
        // first step the rotation amount
        this.rotateStep();

        // set font based on users font to get correct length
        //TODO ctx.font = this.user.font
        let movdst = ctx.measureText(inchar).width;
        this.user.x += movdst * Math.cos(this.user.ang);
        this.user.y += movdst * Math.sin(this.user.ang);

        // Wrap around x and y coords to a uint16
        this.user.x = this.user.x % 0x10000;
        this.user.y = this.user.y % 0x10000;
        if (this.user.x < 0) {
            this.user.x += 0x10000;
        }
        if (this.user.y < 0) {
            this.user.y += 0x10000;
        }

        this.dirty = true;

        this.moveSnailCallback(this.user.x, this.user.y, this.user.ang);

        console.log(this.user.x,this.user.y);

        return true;
    }

    setTransform(ang, posx, posy) {
        let userang = 0;
        let userx = 0;
        let usery = 0;
        if (this.user !== null) {
            userang = this.user.ang;
            userx = this.user.x;
            usery = this.user.y;
        }

        // Wrap around x and y coords to a uint16
        posx = posx % 0x10000;
        posy = posy % 0x10000;
        if (Math.abs(userx - (posx - 0x10000)) < Math.abs(userx - posx)) {
            posx = posx - 0x10000;
        }
        if (Math.abs(userx - (posx + 0x10000)) < Math.abs(userx - posx)) {
            posx = posx + 0x10000;
        }
        if (Math.abs(usery - (posy - 0x10000)) < Math.abs(usery - posy)) {
            posy = posy - 0x10000;
        }
        if (Math.abs(usery - (posy + 0x10000)) < Math.abs(usery - posy)) {
            posy = posy + 0x10000;
        }

        ang -= userang;
        posx -= userx;
        posy -= usery;

        // apply offset from user, then rotate, then offset from center.

        let usin = Math.sin(-userang);
        let ucos = Math.cos(-userang);
        let sin = Math.sin(ang);
        let cos = Math.cos(ang);

        let rx = (posx * ucos) - (posy * usin);
        let ry = (posx * usin) + (posy * ucos);

        this.ctx.setTransform(
            cos,
            sin,
            -sin,
            cos,
            rx + this.w2,
            ry + this.h2
        );
    }

    update(dt) {
        // Update our heading based on input
        if (this.rotIn != 0) {
            this.dirty = true;

            this.rotTo += dt * 0.006 * this.rotIn;

            if (this.rotTo > Math.PI) {
                this.rotTo -= 2 * Math.PI;
            } else if (this.rotTo < -Math.PI) {
                this.rotTo += 2 * Math.PI;
            }
        }
    }

    draw(dt) {
        // now do draw stuff
        let ctx = this.ctx;

        if (!this.dirty) {
            return;
        }
        this.dirty = false;

        ////////////////////////////
        // Clear the Screen
        ////////////////////////////

        // we don't bother saving context, we are going to trash the transform
        // because we have to reset it for every character
        ctx.setTransform(1,0,0,1,0,0);
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        ////////////////////////////
        // Draw characters on screen
        ////////////////////////////
        for (let i=0; i<this.data.length; i++) {
            this.setTransform(this.data[i].ang, this.data[i].x, this.data[i].y);
            ctx.strokeStyle = "#ffffff";
            ctx.strokeText(this.data[i].c, 0, 0);
            ctx.fillStyle = this.data[i].color;
            ctx.fillText(this.data[i].c, 0, 0);
        }

        ////////////////////////////
        // Draw user's heading & UI
        ////////////////////////////
        if (this.user !== null) {
            this.setTransform(this.user.ang, this.user.x, this.user.y);
            ctx.beginPath();
            let xoff = 10;
            let yoff = -5;
            let len = 54;
            ctx.moveTo(xoff, yoff);
            ctx.lineTo(
                Math.cos(this.rotTo - this.user.ang)*len + xoff,
                Math.sin(this.rotTo - this.user.ang)*len + yoff
            );
            ctx.strokeStyle = "#000000";
            ctx.stroke();
        }
        

        //TODO draw arrows to snails off the edge of view



        ////////////////////////////
        // Draw players
        ////////////////////////////
        for (let i=0; i<this.players.length; i++) {
            this.setTransform(this.players[i].ang, this.players[i].x, this.players[i].y);
            //ctx.fillText(String.fromCodePoint(128012), 0, 0);
            let img = this.players[i].img;
            ctx.drawImage(img, -3, -27);
        }
    }
}