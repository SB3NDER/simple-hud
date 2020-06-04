var hud;
function init() {
    hud=new HUD('hud');
}

class HUD {
    constructor(id) {
        this.canvas = document.getElementById(id);
        this.ctx = this.canvas.getContext('2d');

        this.canvas.width  = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
        window.addEventListener('resize', () => {
            this.canvas.width  = this.canvas.clientWidth;
            this.canvas.height = this.canvas.clientHeight;
        },false);

        this.pitch=0.0;
        this.roll=0.0;
        this.heading=0.0;

        this.speed=0.0;
        this.throtle=0.0;
        this.altitude=0.0;

        this.flightPitch=0.0;
        this.flightHeading=0.0;

        this.pixelPerDegree=12;

        //this.time=new Date('2291-06-03T00:00:00');

        this.lineWidth=2.0;
        this.color='rgba(0, 255, 127, 1)';

        // font
        this.fontWeight='bold';
        this.fontFamily='Arial';

        this.draw();
    }

    draw() {
        this.ctx.lineWidth=this.lineWidth;
        this.ctx.strokeStyle=this.color;
        this.ctx.fillStyle=this.color;
        this.setFont('16px');

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // clear canvas

        this.ctx.save();
        this.ctx.translate(this.canvas.width/2, this.canvas.height/2);// center coordinate
        var pixelPerRad=this.pixelPerDegree*(180/Math.PI);// pixels per radiant

        this.drawFlightPath(this.flightHeading*pixelPerRad, -(this.flightPitch*pixelPerRad));// flight path
        
        this.ctx.rotate(this.roll);// ladders roll transformation
        this.ctx.translate(0, this.pitch*pixelPerRad);// ladders pitch transformation

        this.drawHorizonLadder(0, 0);// artificial horizon ladder

        var pitchDegInterval=10;

        // top ladders
        for (let deg = pitchDegInterval; deg < 90 && deg >-90; deg+=pitchDegInterval) {
            this.drawPitchLadder(0, -(deg*this.pixelPerDegree), deg);
        }

        // bottom ladders
        for (let deg = -pitchDegInterval; deg >-90; deg-=pitchDegInterval) {
            this.drawPitchLadder(0, -(deg*this.pixelPerDegree), deg);
        }
        this.ctx.restore();

        

        requestAnimationFrame(() => this.draw());// '() =>' contain 'this' reference
    }

    setFont(size) {
        this.ctx.font = this.fontWeight+' '+size+' '+this.fontFamily;
    }

    drawFlightPath(x, y) {
        this.ctx.save();
        this.ctx.translate(x, y);

        var r=12;

        // square
        this.ctx.beginPath();
        this.ctx.moveTo(r, 0);
        this.ctx.lineTo(0, r);
        this.ctx.lineTo(-r, 0);
        this.ctx.lineTo(0, -r);
        this.ctx.lineTo(r, 0);
        //this.ctx.closePath();
        this.ctx.stroke();

        // lines
        var line=9;

        // right line
        this.ctx.beginPath();
        this.ctx.moveTo(r, 0);
        this.ctx.lineTo(r+line, 0);
        this.ctx.stroke();

        // center top line
        this.ctx.beginPath();
        this.ctx.moveTo(0, -r);
        this.ctx.lineTo(0, -r-line);
        this.ctx.stroke();

        // left line
        this.ctx.beginPath();
        this.ctx.moveTo(-r, 0);
        this.ctx.lineTo(-r-line, 0);
        this.ctx.stroke();

        this.ctx.restore();
    }

    drawHorizonLadder(x, y) {
        this.ctx.save();
        this.ctx.translate(x, y);
        
        var length=350;// total length
        var space=80;// space betweens
        var q=12;

        // right
        this.ctx.beginPath();
        this.ctx.moveTo(space/2, 0);
        this.ctx.lineTo(length/2-q, 0);
        this.ctx.lineTo(length/2, q);
        this.ctx.stroke();

        // left
        this.ctx.beginPath();
        this.ctx.moveTo(-space/2, 0);
        this.ctx.lineTo(-(length/2-q), 0);
        this.ctx.lineTo(-length/2, q);
        this.ctx.stroke();

        // -1, -2 and -3 degrees pitch
        this.ctx.save();

        this.ctx.setLineDash([6, 4]);

        var length=26;

        for (let i = 0; i < 3; i++) {
            this.ctx.translate(0, this.pixelPerDegree);

            // right
            this.ctx.beginPath();
            this.ctx.moveTo(space/2, 0);
            this.ctx.lineTo(space/2+length, 0);
            this.ctx.stroke();

            // left
            this.ctx.beginPath();
            this.ctx.moveTo(-space/2, 0);
            this.ctx.lineTo(-(space/2+length), 0);
            this.ctx.stroke();
        }
        this.ctx.restore();

        this.ctx.restore();
    }

    drawPitchLadder(x, y, angle) {
        this.ctx.save();
        this.ctx.translate(x, y);

        var length=200;// total length
        var space=80;// space betweens
        var q=12;
        
        // right ladder
        this.ctx.beginPath();
        this.ctx.moveTo(space/2, 0);
        this.ctx.lineTo(length/2-q, 0);
        this.ctx.lineTo(length/2, angle>0 ? q : -q);
        this.ctx.stroke();

        // left ladder
        this.ctx.beginPath();
        this.ctx.moveTo(-space/2, 0);
        this.ctx.lineTo(-(length/2-q), 0);
        this.ctx.lineTo(-length/2, angle>0 ? q : -q);
        this.ctx.stroke();

        // right text
        this.setFont('16px');

        var textSpace=5;
        var textLenght=this.ctx.measureText('-90').width;

        this.ctx.textAlign='right';
        this.ctx.textBaseline='middle';
        this.ctx.fillText(angle, length/2+textSpace+textLenght, angle>0 ? q/2 : -q/2);
        
        // left text
        this.ctx.textBaseline='middle';
        this.ctx.fillText(angle, -(length/2+textSpace), angle>0 ? q/2 : -q/2);

        this.ctx.restore();
    }
}