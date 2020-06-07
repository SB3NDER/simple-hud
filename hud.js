class HUD {
	constructor(id) {
		this.canvas = document.getElementById(id);
		this.ctx = this.canvas.getContext('2d');

		this.canvas.width = 1280;
		this.canvas.height = 720;

		this.flightPitch = 0;
		this.flightHeading = 0;

		this.pitch = 0;
		this.roll = 0;
		this.heading = 0;

		this.speed = 0;
		this.altitude = 0;

		this.throtle = 0;

		this.pixelPerDegree = 12;
		this.uncagedMode = false; // align pitch ladders to flight path

		this.timezone = undefined; // default local time, ex. 'America/Los_Angeles' or 'Asia/Tokyo'

		this.lineWidth = 2;
		this.color = 'rgba(0, 255, 127, 1)';

		// font
		this.fontStyle = 'normal';
		this.fontVariant = 'normal';
		this.fontWeight = 'bold';
		this.fontFamily = 'Arial';

		this.draw();
	}

	draw() {
		this.canvas.width = this.canvas.clientWidth; // clear canvas
		this.canvas.height = this.canvas.clientHeight;

		this.ctx.lineWidth = this.lineWidth;
		this.ctx.strokeStyle = this.color;
		this.ctx.fillStyle = this.color;

		//this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // clear canvas

		// dynamic
		this.ctx.save();
		this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2); // center coordinate
		var pixelPerRad = this.pixelPerDegree * (180 / Math.PI); // pixels per radiant

		this.drawFlightPath(
			this.flightHeading * pixelPerRad,
			-(this.flightPitch * pixelPerRad)
		); // flight path

		if (this.uncagedMode) {
			// align pitch ladders to flight path
			this.ctx.translate(
				pixelPerRad *
					(this.flightHeading - this.flightPitch * Math.tan(this.roll)),
				0
			);
		}

		this.ctx.rotate(this.roll); // ladders roll transformation
		this.ctx.translate(0, this.pitch * pixelPerRad); // ladders pitch transformation

		this.drawHorizonLadder(0, 0); // artificial horizon ladder

		var pitchDegStep = 10;

		// top ladders
		for (let deg = pitchDegStep; deg < 90 && deg > -90; deg += pitchDegStep) {
			this.drawPitchLadder(0, -(deg * this.pixelPerDegree), deg);
		}

		// bottom ladders
		for (let deg = -pitchDegStep; deg > -90; deg -= pitchDegStep) {
			this.drawPitchLadder(0, -(deg * this.pixelPerDegree), deg);
		}
		this.ctx.restore();

		// fixed
		var border = 16;

		this.drawVerticalScale(
			border,
			this.canvas.height / 2,
			this.speed,
			'9999',
			41,
			false
		); // speed
		this.drawVerticalScale(
			this.canvas.width - border,
			this.canvas.height / 2,
			this.altitude,
			'99999',
			41,
			true
		); // altitude
		this.drawHeading(this.canvas.width / 2, border, 61, false);

		this.drawThrotle(border + 30, this.canvas.height / 2 - 60);
		this.drawTime(border, this.canvas.height / 2 + 30);

		requestAnimationFrame(() => this.draw()); // '() =>' contain 'this' reference
	}

	setFont(size) {
		this.ctx.font =
			this.fontStyle +
			' ' +
			this.fontVariant +
			' ' +
			this.fontWeight +
			' ' +
			size +
			' ' +
			this.fontFamily;
	}

	drawFlightPath(x, y) {
		this.ctx.save();
		this.ctx.translate(x, y);

		var r = 12;

		// square
		this.ctx.beginPath();
		this.ctx.moveTo(r, 0);
		this.ctx.lineTo(0, r);
		this.ctx.lineTo(-r, 0);
		this.ctx.lineTo(0, -r);
		this.ctx.closePath();

		// lines
		var line = 9;

		// right line
		this.ctx.moveTo(r, 0);
		this.ctx.lineTo(r + line, 0);

		// center top line
		this.ctx.moveTo(0, -r);
		this.ctx.lineTo(0, -r - line);

		// left line
		this.ctx.moveTo(-r, 0);
		this.ctx.lineTo(-r - line, 0);

		this.ctx.stroke();

		this.ctx.restore();
	}

	drawHorizonLadder(x, y) {
		this.ctx.save();
		this.ctx.translate(x, y);

		var length = 460; // total length
		var space = 80; // space betweens
		var q = 12;

		// right
		this.ctx.beginPath();
		this.ctx.moveTo(space / 2, 0);
		this.ctx.lineTo(length / 2 - q, 0);
		this.ctx.lineTo(length / 2, q);
		this.ctx.stroke();

		// left
		this.ctx.beginPath();
		this.ctx.moveTo(-space / 2, 0);
		this.ctx.lineTo(-(length / 2 - q), 0);
		this.ctx.lineTo(-length / 2, q);
		this.ctx.stroke();

		// -1, -2 and -3 degrees pitch
		this.ctx.save();

		this.ctx.setLineDash([6, 4]);

		var length = 26;

		for (let i = 0; i < 3; i++) {
			this.ctx.translate(0, this.pixelPerDegree);

			// right
			this.ctx.beginPath();
			this.ctx.moveTo(space / 2, 0);
			this.ctx.lineTo(space / 2 + length, 0);
			this.ctx.stroke();

			// left
			this.ctx.beginPath();
			this.ctx.moveTo(-space / 2, 0);
			this.ctx.lineTo(-(space / 2 + length), 0);
			this.ctx.stroke();
		}
		this.ctx.restore();

		this.ctx.restore();
	}

	drawPitchLadder(x, y, angle) {
		this.ctx.save();
		this.ctx.translate(x, y);

		var length = 200; // total length
		var space = 80; // space betweens
		var q = 12;

		// right ladder
		this.ctx.beginPath();
		this.ctx.moveTo(space / 2, 0);
		this.ctx.lineTo(length / 2 - q, 0);
		this.ctx.lineTo(length / 2, angle > 0 ? q : -q);
		this.ctx.stroke();

		// left ladder
		this.ctx.beginPath();
		this.ctx.moveTo(-space / 2, 0);
		this.ctx.lineTo(-(length / 2 - q), 0);
		this.ctx.lineTo(-length / 2, angle > 0 ? q : -q);
		this.ctx.stroke();

		// right text
		this.setFont('16px');

		var textBorder = 5;
		var textWidth = this.ctx.measureText('-90').width;

		this.ctx.textAlign = 'right';
		this.ctx.textBaseline = 'middle';
		this.ctx.fillText(
			angle,
			length / 2 + textBorder + textWidth,
			angle > 0 ? q / 2 : -q / 2
		);

		// left text
		this.ctx.textBaseline = 'middle';
		this.ctx.fillText(
			angle,
			-(length / 2 + textBorder),
			angle > 0 ? q / 2 : -q / 2
		);

		this.ctx.restore();
	}

	drawVerticalScale(x, y, value, placeHolder, stepRange = 41, right = false) {
		this.ctx.save();
		this.ctx.translate(x, y);

		var mf = 1;
		if (right) {
			mf = -1;
		}

		// value indicator
		var fontSize = 20;
		this.setFont(fontSize + 'px');

		var textSideBorder = 5;
		var textTopBorder = 4;
		var textWidth = this.ctx.measureText(placeHolder).width;

		var height = fontSize + 2 * textTopBorder;
		var length = textSideBorder * 2 + textWidth + height / 2; // total length

		this.ctx.textAlign = 'right';
		this.ctx.textBaseline = 'middle';

		this.ctx.beginPath();
		this.ctx.moveTo(0, -height / 2);
		this.ctx.lineTo(mf * (textSideBorder * 2 + textWidth), -height / 2);
		this.ctx.lineTo(mf * length, 0);
		this.ctx.lineTo(mf * (textSideBorder * 2 + textWidth), height / 2);
		this.ctx.lineTo(0, height / 2);
		this.ctx.closePath();
		this.ctx.stroke();

		var text = Math.round(value);
		this.ctx.fillText(
			text,
			right ? -textSideBorder : textSideBorder + textWidth,
			0
		);

		// scale |----I----|----I----|----I----|
		fontSize = 16;
		this.setFont(fontSize + 'px');
		var textBorder = 4;

		var border = 3;

		var stepHeight = 8;
		var stepLength = [16, 11, 7];

		this.ctx.textAlign = right ? 'right' : 'left';
		this.ctx.textBaseline = 'middle';

		this.ctx.translate(
			mf * (length + Math.ceil(this.lineWidth / 2) + border),
			0
		); // border

		this.ctx.rect(
			0,
			-((stepRange * stepHeight) / 2),
			mf * 100,
			stepRange * stepHeight
		); // visible step range clip
		this.ctx.clip();

		var stepMargin = 5; // top and bottom extra steps
		var stepZeroOffset = Math.ceil(stepRange / 2) + stepMargin; // '0' offset from bottom (35.5 -> 18, 35 -> 18)
		var stepValueOffset = Math.floor(value); // 35.5 -> 35
		var stepOffset = value - stepValueOffset; // 35.5 -> 0.5

		this.ctx.translate(0, (stepZeroOffset + stepOffset) * stepHeight); // translate to bottom

		for (
			let i = -stepZeroOffset + stepValueOffset;
			i < stepZeroOffset + stepValueOffset;
			i++
		) {
			this.ctx.beginPath();
			this.ctx.moveTo(0, 0);
			switch ((i * Math.sign(i)) % 10) {
				case 0:
					this.ctx.lineTo(mf * stepLength[0], 0);

					let text = i;

					this.ctx.fillText(text, mf * (stepLength[0] + textBorder), 0);
					break;

				case 5:
					this.ctx.lineTo(mf * stepLength[1], 0);
					break;

				default:
					this.ctx.lineTo(mf * stepLength[2], 0);
					break;
			}
			this.ctx.stroke();

			this.ctx.translate(0, -stepHeight);
		}

		this.ctx.restore();
	}

	drawHeading(x, y, stepRange = 41, bottom = false) {
		this.ctx.save();
		this.ctx.translate(x, y);

		var mf = 1;
		if (bottom) {
			mf = -1;
		}

		// value indicator
		var value = this.heading * (180 / Math.PI);

		var fontSize = 20;
		this.setFont(fontSize + 'px');

		var textSideBorder = 5;
		var textTopBorder = 4;
		var textWidth = this.ctx.measureText('360').width;

		var length = textSideBorder * 2 + textWidth; // total length
		var height = textTopBorder * (3 / 2) + fontSize + length / 4; // total height

		this.ctx.textAlign = 'right';
		this.ctx.textBaseline = 'middle';

		this.ctx.beginPath();
		this.ctx.moveTo(-length / 2, 0);
		this.ctx.lineTo(length / 2, 0);
		this.ctx.lineTo(length / 2, mf * (textTopBorder * (3 / 2) + fontSize));
		this.ctx.lineTo(0, mf * height);
		this.ctx.lineTo(-length / 2, mf * (textTopBorder * (3 / 2) + fontSize));
		this.ctx.closePath();
		this.ctx.stroke();

		var text = Math.round(value);
		this.ctx.fillText(
			text,
			length / 2 - textSideBorder,
			(mf * (2 * textTopBorder + fontSize)) / 2
		);

		// scale |----I----|----N----|----I----|
		fontSize = 16;
		this.setFont(fontSize + 'px');
		var textBorder = 4;

		var border = 3;

		var stepHeight = 8;
		var stepLength = [16, 11, 7];

		this.ctx.textAlign = 'center';
		this.ctx.textBaseline = 'middle';

		this.ctx.translate(0, mf * (height + textBorder)); // border

		this.ctx.rect(
			(-stepRange * stepHeight) / 2,
			0,
			stepHeight * stepRange,
			mf * 100
		); // visible step range clip
		this.ctx.clip();

		var stepMargin = 5; // left and right extra steps
		var stepZeroOffset = Math.ceil(stepRange / 2) + stepMargin; // '0' offset from left (35.5 -> 18, 35 -> 18)
		var stepValueOffset = Math.floor(value); // 35.5 -> 35
		var stepOffset = value - stepValueOffset; // 35.5 -> 0.5

		this.ctx.translate(-(stepZeroOffset + stepOffset) * stepHeight, 0); // translate to bottom

		for (
			let i = -stepZeroOffset + stepValueOffset;
			i < stepZeroOffset + stepValueOffset;
			i++
		) {
			let posI = i * Math.sign(i);

			this.ctx.beginPath();
			this.ctx.moveTo(0, 0);
			switch (
				posI % 10 // steps
			) {
				case 0:
					this.ctx.lineTo(0, mf * stepLength[0]);
					break;

				case 5:
					this.ctx.lineTo(0, mf * stepLength[1]);
					break;

				default:
					this.ctx.lineTo(0, mf * stepLength[2]);
					break;
			}
			this.ctx.stroke();

			if (posI % 90 == 0 || posI % 45 == 0 || posI % 10 == 0) {
				switch (
					posI % 360 // text
				) {
					case 0:
						text = 'N';
						break;

					case 45:
						text = 'NE';
						break;

					case 90:
						text = 'E';
						break;

					case 135:
						text = 'SE';
						break;

					case 180:
						text = 'S';
						break;

					case 225:
						text = 'SW';
						break;

					case 270:
						text = 'W';
						break;

					case 315:
						text = 'SE';
						break;

					default:
						if (i >= 0) {
							text = i % 360;
						} else {
							text = 360 + (i % 360);
						}
						break;
				}

				this.ctx.fillText(
					text,
					0,
					mf * (stepLength[0] + (textBorder + fontSize) / 2)
				);
			}

			this.ctx.translate(stepHeight, 0);
		}

		this.ctx.restore();
	}

	drawThrotle(x, y) {
		this.ctx.save();
		this.ctx.translate(x, y);

		this.setFont('16px');
		this.ctx.textAlign = 'center';
		this.ctx.textBaseline = 'middle';

		this.ctx.fillText(Math.round(this.throtle * 100) + '%', 0, 0);

		var radius = 28;
		var indexLenght = 6;
		var range = (3 / 2) * Math.PI;
		var start = (1 / 2) * Math.PI;

		this.ctx.beginPath();
		this.ctx.arc(0, 0, radius, start, start + range * this.throtle);
		this.ctx.lineTo(
			(radius + indexLenght) * Math.cos(start + range * this.throtle),
			(radius + indexLenght) * Math.sin(start + range * this.throtle)
		);
		this.ctx.stroke();

		this.ctx.beginPath();
		this.ctx.globalAlpha = 0.5;
		this.ctx.arc(0, 0, radius, start + range * this.throtle, start + range);
		this.ctx.stroke();

		this.ctx.restore();
	}

	drawTime(x, y) {
		this.ctx.save();
		this.ctx.translate(x, y);

		this.setFont('16px');
		this.ctx.textAlign = 'left';
		this.ctx.textBaseline = 'top';

		var now = new Date();

		this.ctx.fillText(
			now.toLocaleTimeString(undefined, {
				timeZone: this.timezone,
				hour12: false,
				hourCycle: 'h23',
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit',
			}),
			0,
			0
		);

		this.ctx.restore();
	}
}
