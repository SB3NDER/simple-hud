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
        }, false);

        this.pitch=0.0;
        this.roll=0.0;
        this.heading=0.0;

        this.speed=0.0;
        this.throtle=0.0;
        this.altitude=0.0;

        this.flightPitch=0.0;
        this.flightHeading=0.0;

        this.pixelPerDegree=12;
        this.alignLadders=false;

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

        // dynamic
        this.ctx.save();
        this.ctx.translate(this.canvas.width/2, this.canvas.height/2);// center coordinate
        var pixelPerRad=this.pixelPerDegree*(180/Math.PI);// pixels per radiant

        this.drawFlightPath(this.flightHeading*pixelPerRad, -(this.flightPitch*pixelPerRad));// flight path

        if (this.alignLadders) {
            this.ctx.translate(this.flightHeading*pixelPerRad, 0);// align ladders to flight path
        } 
        
        this.ctx.rotate(this.roll);// ladders roll transformation
        this.ctx.translate(0, this.pitch*pixelPerRad);// ladders pitch transformation

        this.drawHorizonLadder(0, 0);// artificial horizon ladder

        var pitchDegStep=10;

        // top ladders
        for (let deg = pitchDegStep; deg < 90 && deg >-90; deg+=pitchDegStep) {
            this.drawPitchLadder(0, -(deg*this.pixelPerDegree), deg);
        }

        // bottom ladders
        for (let deg = -pitchDegStep; deg >-90; deg-=pitchDegStep) {
            this.drawPitchLadder(0, -(deg*this.pixelPerDegree), deg);
        }
        this.ctx.restore();

        // fixed
        var border=15;

        this.drawScale(border, this.canvas.height / 2, this.speed, '9999', false);// speed
        this.drawScale(this.canvas.width - border, this.canvas.height / 2, this.altitude, '99999', true);// altitude
        this.drawHeading(this.canvas.width/2, border);

        this.drawThrotle(border+10, this.canvas.height/2 - 50);
        this.drawTime(border, this.canvas.height/2 + 30);

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
        
        var length=460;// total length
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

        var textBorder=5;
        var textWidth=this.ctx.measureText('-90').width;

        this.ctx.textAlign='right';
        this.ctx.textBaseline='middle';
        this.ctx.fillText(angle, length/2+textBorder+textWidth, angle>0 ? q/2 : -q/2);
        
        // left text
        this.ctx.textBaseline='middle';
        this.ctx.fillText(angle, -(length/2+textBorder), angle>0 ? q/2 : -q/2);

        this.ctx.restore();
    }

    drawScale(x, y, value, placeHolder, right=false) {
        this.ctx.save();
        this.ctx.translate(x, y);

        var mf=1;
        if (right) {
            mf=-1;
        }

        // value indicator
        this.setFont('20px');
        
        var textBorder=10;
        var textWidth=this.ctx.measureText(placeHolder).width;

        var height=32;
        var length=textBorder*2 + textWidth + height/2;// total length
        
        this.ctx.textAlign='right';
        this.ctx.textBaseline='middle';

        this.ctx.beginPath();
        this.ctx.moveTo(0, -height/2);
        this.ctx.lineTo(mf*(textBorder*2 + textWidth), -height/2);
        this.ctx.lineTo(mf*length, 0);
        this.ctx.lineTo(mf*(textBorder*2 + textWidth), height/2);
        this.ctx.lineTo(0, height/2);
        this.ctx.lineTo(0, -height/2);
        this.ctx.stroke();

        this.ctx.fillText(value, right? -textBorder : textBorder+textWidth, 0);

        // scale |----I----|----I----|----I----|
        this.setFont('16px');
        textBorder=4;

        var border=4;
        
        var stepHeight=8;
        var visibleStepRange=41;
        var stepLenght = [16, 11, 7];

        this.ctx.textAlign=right?'right':'left';
        this.ctx.textBaseline='middle';

        var stepRange=Math.ceil(visibleStepRange/10)*10;// ex. 28.6 -> 30
        
        this.ctx.translate(mf*(length + border), 0);// border

        this.ctx.rect(0, -visibleStepRange*stepHeight/2, mf*100, stepHeight * visibleStepRange);// visible step range clip
        this.ctx.clip();

        this.ctx.translate(0, stepRange / 2 * stepHeight);// translate to bottom

        var offset=value % 10 * stepHeight;
        this.ctx.translate(0, offset);

        var start=0;// start with normal step (ex. 10, 20, 30)
        if (stepRange / 10 % 2 != 0) {
            // start with middle step (ex. 15, 25, 35)
            var start=5;
        }

        if (value>=0) {
            var valueStepOffset=Math.floor(value/10)*10;// ex. 28.6 -> 20
        }else{
            var valueStepOffset=Math.ceil(value/10)*10;// ex. -28.6 -> -30
        }
        
        var stepOffset=stepRange/2+start;// 0 offset from bottom

        for (let i = start; i < stepRange+10+1; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            switch (i % 10) {
                case 0:
                    this.ctx.lineTo(mf*stepLenght[0], 0);
                    let text=i-stepOffset+valueStepOffset;
                    this.ctx.fillText(text, mf*(stepLenght[0]+textBorder), 0);
                    break;
                
                case 5:
                    this.ctx.lineTo(mf*stepLenght[1], 0);
                    break;
            
                default:
                    this.ctx.lineTo(mf*stepLenght[2], 0);
                    break;
            }
            this.ctx.stroke();

            this.ctx.translate(0, -stepHeight);
        }

        this.ctx.restore();
    }

    drawHeading(x, y) {

    }

    drawThrotle(x, y) {

    }

    pad(num, size) {
        var str = num+'';
        while (str.length < size)
            str = '0' + str;
        return str;
    }

    drawTime(x, y) {
        this.ctx.save();

        this.setFont('16px');
        this.ctx.textAlign='left';
        this.ctx.textBaseline='top';

        var now = new Date();

        this.ctx.fillText(this.pad(now.getHours(), 2) + ':' + this.pad(now.getMinutes(), 2) + ':' + this.pad(now.getSeconds(), 2), x, y);

        this.ctx.restore();
    }
}