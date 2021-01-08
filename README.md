# simple-hud

A simple javascript canvas drone/plane hud overlay.
[index.html](https://htmlpreview.github.io/?https://github.com/SB3NDER/simple-hud/blob/master/index.html)

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](http://opensource.org/licenses/MIT)

## Usage

```javascript
var canvas = document.getElementById('hud');
var hud = new HUD(canvas);
hud.start();
```

### Data feed

- Units
  Angles: radians,
  Lenght: unitless

```javascript
Object.assign(hud.data, {
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
});
```

### Settings

```javascript
Object.assign(hud.settings, {
	pixelPerDeg: 12, // or pixelPerRad
	uncagedMode: false, // align pitch ladders to flight path
	rollRadius: 'none', // 'none' / 'exact' / 'center'
	timezone: undefined, // default local time, ex. 'America/Los_Angeles' or 'Asia/Tokyo'
	scale: 1, // resolution scale
});
```

### Style

```javascript
Object.assign(hud.style, {
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
	scale: 1, // ui scale
	stepWidth: 8,
});
```
