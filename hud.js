'use strict';

class HUD {
	constructor(node) {
		this.canvas = node;
		this.ctx = this.canvas.getContext('2d');

		this.running = false;

		// default sizes
		this.canvas.width = 1280;
		this.canvas.height = 720;

		this.data = {
			pitch: 0,
			roll: 0,
			heading: 0,
			flight: {
				pitch: 0,
				heading: 0,
			},
			speed: 0,
			altitude: 0,
			throtle: 0,
		};

		this.settings = {
			pixelPerDeg: null, // pixel per degree
			pixelPerRad: null, // pixels per radiant
			set setPixelPerDeg(val) {
				this.pixelPerDeg = val;
				this.pixelPerRad = val * (180 / Math.PI);
			},
			set setPixelPerRad(val) {
				this.pixelPerRad = val;
				this.pixelPerDeg = val * (Math.PI / 180);
			},
			uncagedMode: false, // align pitch ladders to flight path
			exactRollRadius: false,
			timezone: undefined, // default local time, ex. 'America/Los_Angeles' or 'Asia/Tokyo'
		};

		// set both the degree and radiant variant
		this.settings.setPixelPerDeg = 12;

		this.style = {
			lineWidth: 2,
			color: 'rgba(0, 255, 127, 1)',
			font: {
				style: 'normal',
				variant: 'normal',
				weight: 'bold',
				family: 'Arial',
				scale: 1,
			},
			hasShadow: true,
			shadow: {
				lineWidth: 2.5,
				color: 'rgba(0, 0, 0, 0.6)',
				offset: 1.8,
			},
		};
	}

	start() {
		if (!this.running) {
			this.running = true;
			requestAnimationFrame(this.draw);
		}
	}

	stop() {
		this.running = false;
	}

	draw = () => {
		if (
			this.canvas.width == this.canvas.clientWidth &&
			this.canvas.height == this.canvas.clientHeight
		) {
			// no size changes

			// clear canvas
			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // faster?
		} else {
			// clear and resize the canvas
			this.canvas.width = this.canvas.clientWidth;
			this.canvas.height = this.canvas.clientHeight;
		}

		if (!this.running) {
			return;
		}

		//set the attributes
		this.ctx.lineWidth = this.style.lineWidth;
		this.ctx.strokeStyle = this.style.color;
		this.ctx.fillStyle = this.style.color;

		// dynamic ui

		this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2); // center coordinate

		// flight path
		this.drawWithShadow(() => {
			this.drawFlightPath(
				this.data.flight.heading * this.settings.pixelPerRad,
				-(this.data.flight.pitch * this.settings.pixelPerRad)
			);
		});

		// pitch

		if (this.settings.uncagedMode) {
			// align pitch ladders to flight path
			this.ctx.translate(
				this.settings.pixelPerRad *
					(this.data.flight.heading -
						this.data.flight.pitch * Math.tan(this.data.roll)),
				0
			);
		}

		// ladders
		this.drawWithShadow(() => {
			this.ctx.rotate(this.data.roll); // ladders roll transformation
			this.ctx.translate(0, this.data.pitch * this.settings.pixelPerRad); // ladders pitch transformation

			this.drawHorizonLadder(0, 0); // artificial horizon ladder

			var pitchDegStep = 10;

			// top ladders
			for (let deg = pitchDegStep; deg <= 90; deg += pitchDegStep) {
				this.drawPitchLadder(0, -(deg * this.settings.pixelPerDeg), deg);
			}

			// bottom ladders
			for (let deg = -pitchDegStep; deg >= -90; deg -= pitchDegStep) {
				this.drawPitchLadder(0, -(deg * this.settings.pixelPerDeg), deg);
			}
		});
		this.ctx.setTransform(1, 0, 0, 1, 0, 0); // reset trasformation

		// fixed ui

		var border = 16;

		// speed
		this.drawWithShadow(() => {
			this.drawVerticalScale(
				border,
				this.canvas.height / 2,
				this.data.speed,
				'9999',
				41,
				false
			);
		});

		// altitude
		this.drawWithShadow(() => {
			this.drawVerticalScale(
				this.canvas.width - border,
				this.canvas.height / 2,
				this.data.altitude,
				'99999',
				41,
				true
			);
		});

		// heading
		this.drawWithShadow(() => {
			this.drawHeading(this.canvas.width / 2, border, 61, false);
		});

		// roll
		this.drawWithShadow(() => {
			this.drawRoll(
				this.canvas.width / 2,
				this.canvas.height - border,
				51,
				260,
				true
			);
		});

		// others
		this.drawWithShadow(() => {
			// hard coded from drawVerticalScale()
			var yDif = 20 * this.style.font.scale + 4;

			// throtle
			this.drawThrotle(border, this.canvas.height / 2 - yDif);

			// time
			this.drawTime(border, this.canvas.height / 2 + yDif);
		});

		requestAnimationFrame(this.draw);
	};

	setFont(size, unit) {
		this.ctx.font =
			this.style.font.style +
			' ' +
			this.style.font.variant +
			' ' +
			this.style.font.weight +
			' ' +
			size +
			unit +
			' ' +
			this.style.font.family;
	}

	setFontScale(size, unit) {
		size *= this.style.font.scale;
		this.setFont(size, unit);
	}

	drawWithShadow(drawCall) {
		if (this.style.hasShadow) {
			this.ctx.save();

			// set attributes
			this.ctx.lineWidth = this.style.shadow.lineWidth;
			this.ctx.strokeStyle = this.style.shadow.color;
			this.ctx.fillStyle = this.style.shadow.color;

			this.ctx.translate(this.style.shadow.offset, this.style.shadow.offset);
			drawCall();

			this.ctx.restore();
		}

		drawCall();
	}

	drawFlightPath(x, y) {
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

		this.ctx.translate(-x, -y);
	}

	drawHorizonLadder(x, y) {
		this.ctx.translate(x, y);

		var length = 460; // total length
		var space = 80; // space betweens
		var q = 12;

		this.ctx.beginPath();

		// right
		this.ctx.moveTo(space / 2, 0);
		this.ctx.lineTo(length / 2 - q, 0);
		this.ctx.lineTo(length / 2, q);

		// left
		this.ctx.moveTo(-space / 2, 0);
		this.ctx.lineTo(-(length / 2 - q), 0);
		this.ctx.lineTo(-length / 2, q);

		this.ctx.stroke();

		// -1, -2 and -3 degrees pitch

		this.ctx.setLineDash([6, 4]);

		var length = 26;

		this.ctx.beginPath();
		for (let i = 0; i < 3; i++) {
			this.ctx.translate(0, this.settings.pixelPerDeg);

			// right
			this.ctx.moveTo(space / 2, 0);
			this.ctx.lineTo(space / 2 + length, 0);

			// left
			this.ctx.moveTo(-space / 2, y);
			this.ctx.lineTo(-(space / 2 + length), 0);
		}
		this.ctx.stroke();

		this.ctx.setLineDash([]);
		this.ctx.translate(-x, -y - 3 * this.settings.pixelPerDeg);
	}

	drawPitchLadder(x, y, value) {
		this.ctx.translate(x, y);

		var length = 200; // total length
		var space = 80; // space betweens
		var q = 12;

		this.ctx.beginPath();

		// right ladder
		this.ctx.moveTo(space / 2, 0);
		this.ctx.lineTo(length / 2 - q, 0);
		this.ctx.lineTo(length / 2, value > 0 ? q : -q);

		// left ladder
		this.ctx.moveTo(-space / 2, 0);
		this.ctx.lineTo(-(length / 2 - q), 0);
		this.ctx.lineTo(-length / 2, value > 0 ? q : -q);

		this.ctx.stroke();

		this.setFontScale(16, 'px');
		this.ctx.textAlign = 'right';
		this.ctx.textBaseline = 'middle';

		var textBorder = 4;
		var textWidth = this.ctx.measureText('-90').width;

		// right text
		this.ctx.fillText(
			value,
			length / 2 + textBorder + textWidth,
			value > 0 ? q / 2 : -q / 2
		);

		// left text
		this.ctx.fillText(
			value,
			-(length / 2 + textBorder),
			value > 0 ? q / 2 : -q / 2
		);

		this.ctx.translate(-x, -y);
	}

	drawVerticalScale(x, y, value, exampleValue, stepRange, right) {
		this.ctx.save();
		this.ctx.translate(x, y);

		var mf = 1;
		if (right) {
			mf = -1;
		}

		// value indicator
		var fontSize = 20 * this.style.font.scale;
		this.setFont(fontSize, 'px');

		var textSideBorder = 5;
		var textTopBorder = 4;
		var textWidth = this.ctx.measureText(exampleValue).width;

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
		fontSize = 16 * this.style.font.scale;
		this.setFont(fontSize, 'px');
		var textBorder = 3;

		var border = 4;

		var stepWidth = 8;
		var stepLength = [16, 11, 7];

		if (!right) this.ctx.textAlign = 'left';

		// space from value indicator
		this.ctx.translate(mf * (length + border), 0);

		// visible step range clip
		this.ctx.rect(
			0,
			-((stepRange * stepWidth) / 2),
			// prettier-ignore
			mf * (stepLength[0] + 2 * textBorder + this.ctx.measureText(exampleValue + '9').width), // (step + 2*textBorder + textWidth)
			stepRange * stepWidth
		);
		this.ctx.clip();

		var stepMargin = 5; // top and bottom extra steps
		var stepZeroOffset = Math.ceil(stepRange / 2) + stepMargin; // '0' offset from bottom (35.5 -> 18, 35 -> 18)
		var stepValueOffset = Math.floor(value); // 35.5 -> 35
		var stepOffset = value - stepValueOffset; // 35.5 -> 0.5

		this.ctx.translate(0, (stepZeroOffset + stepOffset) * stepWidth); // translate to start position

		this.ctx.beginPath();
		for (
			let i = -stepZeroOffset + stepValueOffset;
			i < stepZeroOffset + stepValueOffset;
			i++
		) {
			this.ctx.moveTo(0, 0);
			switch (Math.abs(i) % 10) {
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

			this.ctx.translate(0, -stepWidth);
		}
		this.ctx.stroke();

		this.ctx.restore();
	}

	drawHeading(x, y, stepRange, bottom) {
		this.ctx.save();
		this.ctx.translate(x, y);

		var mf = 1;
		if (bottom) {
			mf = -1;
		}

		// value indicator
		var value = this.data.heading * (180 / Math.PI);

		var fontSize = 20 * this.style.font.scale;
		this.setFont(fontSize, 'px');

		var textSideBorder = 5;
		var textTopBorder = 4;
		var textWidth = this.ctx.measureText('360').width;

		var length = textSideBorder * 2 + textWidth; // total length
		var height = textTopBorder * 1.5 + fontSize + length / 4; // total height

		this.ctx.textAlign = 'right';
		this.ctx.textBaseline = 'middle';

		this.ctx.beginPath();
		this.ctx.moveTo(-length / 2, 0);
		this.ctx.lineTo(length / 2, 0);
		this.ctx.lineTo(length / 2, mf * (textTopBorder * 1.5 + fontSize));
		this.ctx.lineTo(0, mf * height);
		this.ctx.lineTo(-length / 2, mf * (textTopBorder * 1.5 + fontSize));
		this.ctx.closePath();
		this.ctx.stroke();

		var text = Math.round(value);
		this.ctx.fillText(
			text,
			textWidth / 2,
			(mf * (2 * textTopBorder + fontSize)) / 2
		);

		// scale |----I----|----N----|----I----|
		fontSize = 16 * this.style.font.scale;
		this.setFont(fontSize, 'px');
		var textBorder = 2;

		var border = 4;

		var stepWidth = 8;
		var stepLength = [16, 11, 7];

		this.ctx.textAlign = 'center';

		// space from value indicator
		this.ctx.translate(0, mf * (height + border));

		// visible step range clips
		this.ctx.rect(
			(-stepRange * stepWidth) / 2,
			0,
			stepWidth * stepRange,
			mf * (stepLength[0] + 2 * textBorder + fontSize)
		);
		this.ctx.clip();

		var stepMargin = 5; // left and right extra steps
		var stepZeroOffset = Math.ceil(stepRange / 2) + stepMargin; // '0' offset from left (35.5 -> 18, 35 -> 18)
		var stepValueOffset = Math.floor(value); // 35.5 -> 35
		var stepOffset = value - stepValueOffset; // 35.5 -> 0.5

		this.ctx.translate(-(stepZeroOffset + stepOffset) * stepWidth, 0); // translate to start position

		this.ctx.beginPath();
		for (
			let i = -stepZeroOffset + stepValueOffset;
			i < stepZeroOffset + stepValueOffset;
			i++
		) {
			let posI = Math.abs(i);

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
					mf * (stepLength[0] + textBorder + fontSize / 2)
				);
			}

			this.ctx.translate(stepWidth, 0);
		}
		this.ctx.stroke();

		this.ctx.restore();
	}

	drawRoll(x, y, stepRange, radius, bottom) {
		this.ctx.save();
		this.ctx.translate(x, y);

		var mf = 1;
		if (bottom) {
			mf = -1;
		}

		// value indicator
		var value = this.data.roll * (180 / Math.PI);

		var fontSize = 20 * this.style.font.scale;
		this.setFont(fontSize, 'px');

		var textSideBorder = 5;
		var textTopBorder = 4;
		var textWidth = this.ctx.measureText('180').width;

		var length = textSideBorder * 2 + textWidth; // total length
		var height = textTopBorder * 1.5 + fontSize + length / 4; // total height

		this.ctx.textAlign = 'right';
		this.ctx.textBaseline = 'middle';

		this.ctx.beginPath();
		this.ctx.moveTo(-length / 2, 0);
		this.ctx.lineTo(length / 2, 0);
		this.ctx.lineTo(length / 2, mf * (textTopBorder * 1.5 + fontSize));
		this.ctx.lineTo(0, mf * height);
		this.ctx.lineTo(-length / 2, mf * (textTopBorder * 1.5 + fontSize));
		this.ctx.closePath();
		this.ctx.stroke();

		var text = Math.round(value);
		this.ctx.fillText(
			text,
			textWidth / 2,
			(mf * (2 * textTopBorder + fontSize)) / 2
		);

		// scale | _.i---|-''I''-|---i._ |
		fontSize = 16 * this.style.font.scale;
		this.setFont(fontSize, 'px');
		var textBorder = 2;

		var border = 4;

		var stepWidth = 8;
		var stepLength = [16, 11, 7];

		this.ctx.textAlign = 'center';

		// space from value indicator
		this.ctx.translate(0, mf * (height + border));

		if (this.settings.exactRollRadius) {
			// exact dynamic radius (half canvas - border - value indicator)
			radius =
				this.canvas.height / 2 -
				(bottom ? this.canvas.height - y : y) -
				(height + border);
		}

		if (radius < 0) {
			this.ctx.restore();
			return;
		}

		this.ctx.translate(0, mf * radius); // center of rotation

		// clip
		var angle = (stepRange * stepWidth) / radius;

		this.ctx.beginPath();
		this.ctx.moveTo(0, 0);
		this.ctx.arc(
			0,
			0,
			radius,
			(bottom ? 0.5 : 1.5) * Math.PI - angle / 2,
			(bottom ? 0.5 : 1.5) * Math.PI + angle / 2
		);
		this.ctx.closePath();
		this.ctx.clip();

		var stepMargin = 5; // left and right extra steps
		var stepZeroOffset = Math.ceil(stepRange / 2) + stepMargin; // '0' offset from left (35.5 -> 18, 35 -> 18)
		var stepValueOffset = Math.floor(value); // 35.5 -> 35
		var stepOffset = value - stepValueOffset; // 35.5 -> 0.5

		this.ctx.beginPath();
		for (
			let i = -stepZeroOffset + stepValueOffset;
			i < stepZeroOffset + stepValueOffset;
			i++
		) {
			this.ctx.rotate(
				(mf * -(stepValueOffset - i + stepOffset) * stepWidth) / radius
			);
			this.ctx.translate(0, mf * -radius); // bottom of steps

			this.ctx.moveTo(0, 0);
			switch (
				Math.abs(i) % 10 // steps
			) {
				case 0:
					this.ctx.lineTo(0, mf * stepLength[0]);

					let val = i % 360;

					if (val > 180 || val <= -180) {
						text = val - Math.sign(i) * 360;
					} else {
						text = val;
					}

					this.ctx.fillText(
						text,
						0,
						mf * (stepLength[0] + textBorder + fontSize / 2)
					);
					break;

				case 5:
					this.ctx.lineTo(0, mf * stepLength[1]);
					break;

				default:
					this.ctx.lineTo(0, mf * stepLength[2]);
					break;
			}

			this.ctx.translate(0, mf * radius); // center of rotation
			this.ctx.rotate(
				(mf * (stepValueOffset - i + stepOffset) * stepWidth) / radius
			);
		}
		this.ctx.stroke();

		this.ctx.restore();
	}

	drawThrotle(x, y) {
		this.setFontScale(16, 'px');
		this.ctx.textAlign = 'center';
		this.ctx.textBaseline = 'middle';

		var border = 8;
		var indexLenght = 6;
		var range = 1.5 * Math.PI;
		var start = 0.5 * Math.PI;

		var radius = this.ctx.measureText('100%').width / 2 + border;
		var angle = start + range * this.data.throtle;

		var trX = x + radius + indexLenght;
		var trY = y - radius - indexLenght;
		this.ctx.translate(trX, trY);

		this.ctx.fillText(Math.round(this.data.throtle * 100) + '%', 0, 0);

		this.ctx.beginPath();
		this.ctx.arc(0, 0, radius, start, angle);
		this.ctx.lineTo(
			(radius + indexLenght) * Math.cos(angle),
			(radius + indexLenght) * Math.sin(angle)
		);
		this.ctx.stroke();

		this.ctx.globalAlpha = 0.5;

		this.ctx.beginPath();
		this.ctx.arc(0, 0, radius, angle, start + range);
		this.ctx.stroke();

		this.ctx.globalAlpha = 1;

		this.ctx.translate(-trX, -trY);
	}

	drawTime(x, y) {
		this.ctx.translate(x, y);

		this.setFontScale(16, 'px');
		this.ctx.textAlign = 'left';
		this.ctx.textBaseline = 'top';

		var now = new Date();

		this.ctx.fillText(
			now.toLocaleTimeString(undefined, {
				timeZone: this.settings.timezone,
				hour12: false,
				hourCycle: 'h23',
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit',
			}),
			0,
			0
		);

		this.ctx.translate(-x, -y);
	}
}
