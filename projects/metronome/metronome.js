/* Extended Metronome, v0.10
 * Copyright © Enoch Ng 2017
 * See the README file for more information. */

function metronome() {
	var DEFAULT_BPM = 120,
		DEFAULT_BEATS_PER_MEASURE = 4,
		DEFAULT_REDUNDANT_SOUNDS = 3;
		SMALL_TEMPO_ADJUST_AMNT = 4;

	var tempo = DEFAULT_BPM,
		beats_per_measure = DEFAULT_BEATS_PER_MEASURE;
	
	var t = 0; // Variable for keeping track of time with the metronome. If t = 0, metronome is off. Otherwise, t represents the amount of ms that should have elapsed at every beat, assuming perfect timing.
	var time_interval = 60000.0 / tempo; // Time to wait between clicks, in ms
	var current_beat; // Increments with every metronome click. Ranges from 0 to beats_per_measure - 1. 0 is the start of the measure. 
	
	// Class definition for Sprite, which represents any image. It provides the clicked() function since there is no built-in way to determine whether or not an element on an HTML canvas has been clicked.
	function Sprite(src, x, y, width, height) {
		this.img = new Image();
		this.img.src = src;
		
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		
		this.clicked = function(x, y) {
			return (y > this.y && y < this.y + this.height && x > this.x && x < this.x + this.width);
		}
	}
	
	// Class definition for a Sound, which represents any sound. This provides a solution to the problem of play() not being able to play the same sound multiple times in the span of its own duration.
	function Sound(src) {
		this.sounds = []; // Multiple instances of the same Audio object are needed	
		this.current = 0;

		this.play = function() {
			this.sounds[this.current].play();
			
			if (this.current < DEFAULT_REDUNDANT_SOUNDS - 1) {
				this.current++;
			}

			else {
				this.current = 0;
			}
		}

		for (var i = 0; i < DEFAULT_REDUNDANT_SOUNDS; i++) {
			this.sounds.push(new Audio(src));
		}
	}

	function restart() {
		t = Date.now();
		sounds.high.play();
		current_beat = 1;
	}

	var sprites = {
		up: new Sprite('up.png', 175, 50, 64, 64),
		down: new Sprite('down.png', 375, 50, 64, 64),
		onoff: new Sprite('onoff.png', 170, 300, 256, 64),
		left: new Sprite('left.png', 210, 200, 64, 64),
		right: new Sprite('right.png', 310, 200, 64, 64) 
	};
	
	var sounds = {
		high: new Sound('click_high.wav'),
		low: new Sound('click_low.wav')
	};

	var canvas = document.getElementById('metronome');
	
	if (canvas.getContext) {
		var context = canvas.getContext('2d');
	}

	context.font = '24px serif';
	canvas.addEventListener('click', function(event) {
		// Maybe make this into a loop later, if possible
		var x = event.pageX - canvas.offsetLeft,
			y = event.pageY - canvas.offsetTop;
			
		if (sprites.up.clicked(x, y)) {
			// No hardcoded upper limit, though the program encounters some issues at around 340 BPM.
			tempo += SMALL_TEMPO_ADJUST_AMNT;
			time_interval = 60000.0 / tempo;
		}
			
		else if (sprites.down.clicked(x, y)) {
			if (tempo > SMALL_TEMPO_ADJUST_AMNT) {
				tempo -= SMALL_TEMPO_ADJUST_AMNT;
				time_interval = 60000.0 / tempo;
			}
		}

		else if (sprites.left.clicked(x, y)) {
			if (beats_per_measure > 1) {
				beats_per_measure -= 1;
				if (t > 0) restart();
			}
		}

		else if (sprites.right.clicked(x, y)) {
			beats_per_measure += 1;
			if (t > 0) restart();
		}

		else if (sprites.onoff.clicked(x, y)) {
			if (t == 0) restart();
			else t = 0;
		}
	}, false);
	
	window.requestAnimationFrame(draw);
	
	function draw() {
		if (t > 0 && Date.now() > t + time_interval) {
			if (current_beat == 0) {
				sounds.high.play();
				current_beat++;
			}
			
			else {
				sounds.low.play();

				if (current_beat == beats_per_measure - 1) {
					current_beat = 0;
				}
				
				else {
					current_beat++;
				}
			}
			
			t += time_interval;
		}
	
		context.clearRect(0, 0, canvas.width, canvas.height);
		
		context.fillText(tempo + ' BPM', 255, 90);
		context.fillText(beats_per_measure, 285, 240); 
	
		for (var s in sprites) {
			context.drawImage(sprites[s].img, sprites[s].x, sprites[s].y);
		}

		window.requestAnimationFrame(draw);
	}
}
