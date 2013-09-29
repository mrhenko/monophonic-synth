// The Basics
		var audioContext = new webkitAudioContext();	

		// This function is used to create Oscillator objects
		// It creates an Oscillator node and a Gain node.
		// The Gain node is used to mix the various Oscillators
		// together.
		function Oscillator(waveshape, frequency) {
			// Create the oscillator
			this.osc = audioContext.createOscillator(); // Create the Oscillator node
			
			// Basic settings
			this.osc.waveshape = waveshape;
			this.osc.frequency.value = frequency;
			this.osc.start(0);

			return this.osc;
		}	

		Oscillator.prototype.frequency = function(f) {
			this.osc.frequency.value = f;
		}

		function NoiseGenerator() {
			// Create a 2 seconds long audio buffer
			var lengthInSamples =  2 * audioContext.sampleRate;
			noiseBuffer = audioContext.createBuffer(1, lengthInSamples, audioContext.sampleRate );
			var bufferData = noiseBuffer.getChannelData(0);
			
			// Fill the buffer with randomness
			for (var i = 0; i < lengthInSamples; ++i) {
				bufferData[i] = (2 * Math.random() - 1);  // -1 to +1
			}

			// Loop the buffer, connect it to a Gain node and play it
			this.sourceNode = audioContext.createBufferSource();
			this.sourceNode.buffer = noiseBuffer;
			this.sourceNode.loop = true;
			this.sourceNode.noteOn(0);
			this.gain = audioContext.createGainNode();
			this.sourceNode.connect(this.gain);
			return this.gain;
			//return sourceNode;

		}

	// Creates a mixer with [ins] number of inputs
		function LineMixer(ins) {
			this.inputs = [];

			for (var i = 0; i < ins; i++) {
				this.inputs[i] = audioContext.createGainNode();
			}
		}

		// Takes an array as input. One index per mixer input.
		LineMixer.prototype.mix = function(level) {
			for (var i = 0; i < level.length; i++) {
				if (level[i] !== null)
					this.inputs[i].gain.value = level[i];
			}
		}

		LineMixer.prototype.connect = function(val) {
			for (var i = 0; i < this.inputs.length; i++) {
				this.inputs[i].connect(val);
			}
		}

		function Filter() {
			this.filter = audioContext.createBiquadFilter();
			this.filter.type = this.filter.LOWPASS;
			this.filter.frequency = 0;
			this.filter.Q = 0;

			return this.filter;
		}

		/*Filter.prototype.freq = function(f) {
			console.log(f);
			//this.filter.frequency.value = f;
		}*/

		// A Synth object consists of 2 oscillators and one noise generator
		// which is mixed together, passes a gate, then an envelope, a filter
		// and finally a Master Volume Control.
		function Synth() {
			// Create the sound sources
			this.oscillator1 = new Oscillator(4, 250);
			this.oscillator2 = new Oscillator(2, 63);
			this.noise = new NoiseGenerator();

			// Collect the oscillators in an array
			this.oscillators = [this.oscillator1, this.oscillator2];

			// Basic octaves for the oscillators
			this.oscillatorsTuning = [1, 0.5];

			// Line Mixer
			this.mixer = new LineMixer(3);

			// Connect the sound sources to the mixer
			this.oscillator1.connect(this.mixer.inputs[0]);
			this.oscillator2.connect(this.mixer.inputs[1]);
			this.noise.connect(this.mixer.inputs[2]);

			// Connect the mixer to a filter
			this.filter = new Filter();
			this.mixer.connect(this.filter);

			// Create Gate
			this.gate = audioContext.createGainNode();
			this.gate.gain.value = 0.0;

			this.filter.connect(this.gate);

			// Connect the output of the gate to a master volume
			this.masterVolume = audioContext.createGainNode();
			this.masterVolume.gain.value = 0.5;
			this.masterVolume.connect(audioContext.destination);
			this.gate.connect(this.masterVolume);



			// The scale
			this.scale = {
				a: '110',
				asharp: '116.54',
				b: '123.47',
				c: '130.81',
				csharp: '138.59',
				d: '146.83',
				dsharp: '155.56',
				e: '164.81',
				f: '174.61',
				fsharp: '185.00',
				g: '196',
				gsharp: '207.65'
			}

			this.octave = 1;
		}

		Synth.prototype.noteOn = function() {
			this.gate.gain.value = 1;
		}

		Synth.prototype.noteValue = function(n) {
			//this.oscillator1.frequency.value = n;
			for (var i = 0; i < this.oscillators.length; i++) {
				this.oscillators[i].frequency.value = this.oscillatorsTuning[i] * this.scale[n] * this.octave;
				// console.log(this.scale[n]);
			}
		}

		Synth.prototype.noteOff = function() {
			this.gate.gain.value = 0;
		}

		Synth.prototype.setOctave = function(o) {
			this.octave = o;
		}

		/*
	
		Synth.prototype.envelope = function() {
			var now = audioContext.currentTime;
			this.gate.gain.setValueAtTime( 0, now );
			this.gate.gain.linearRampToValueAtTime( 1.0, now + 0.02 );
			this.gate.gain.linearRampToValueAtTime( 0.0, now + 0.5 );
		}*/



