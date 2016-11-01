
;(function(){
	"use strict";

	// KEYBOARD STUFF
	(function() {
		const module = window.load = {
			name: "keyboard",
			exports: {}
		};

		const keys = module.exports.keys = {};
		const keyCodes = {
			8: "backspace",
			9: "tab",
			16: "shift",
			20: "capslock",
			17: "ctrl",
			18: "alt",
			32: "space",
			37: "left",
			38: "up",
			39: "right",
			40: "down",
			13: "return",
			107: "KP_plus",
			109: "KP_minus",
			106: "KP_multiply",
			111: "KP_divide",
			27: "escape"
		};

		[...Array(26)].map((nothing, i) => {
			keyCodes[i + 65] = String.fromCharCode(i + 97);
		});
		[...Array(10)].map((nothing, i) => {
			keyCodes[i + 48] = i;
			keyCodes[i + 96] = "KP_" + i;
		});

		Object.keys(keyCodes).map(key => keys[keyCodes[key]] = false);

		window.addEventListener("keydown", e => {
			if (e.which in keyCodes) keys[keyCodes[e.which]] = true;
			e.preventDefault();
			e.stopPropagation();
		});

		window.addEventListener("keyup", e => {
			if (e.which in keyCodes) keys[keyCodes[e.which]] = false;
			e.preventDefault();
			e.stopPropagation();
		});

	})();


	// GAMEPAD STUFF
	(function() {
		const module = window.load = {
			name: "gamepad",
			exports: {}
		};

		let pads;

		const runner = () => {
			requestAnimationFrame(runner);

			module.exports.pads = pads = Array.prototype.filter.call(navigator.getGamepads(),
				pad => pad && pad.connected && pad.timestamp > 0
			);

		};

		runner();

	})();


	// TODO: make it possible to have multiple gamepads represent multiple players


	// INPUT STUFF
	(function () {
		let keyboard, gamepad;

		const module = window.load = {
			name: "input",
			exports: {
				deadzone: 0.1
				// TODO: add cap
			},
			init: ($gamepad, $keyboard) => {
				gamepad = module.exports.gamepad = $gamepad;
				keyboard = module.exports.keyboard = $keyboard;
			}
		};

		const gamepadRegex = /^(?:(b)|(a)([-+]))(\d+)$/;
		// 1: b, 2: a, 3: +-, 4: value

		const unwrapDescriptor = (desc) => {
			const match = desc.match(gamepadRegex);
			if (!match) return;

			return {
				button: !!match[1],
				axes: !!match[2],
				positive: match[3] == "+",
				id: match[4]
			}
		};

		const fetch = opts => {
			const out = {
				pressed: false,
				value: 0
			};

			const keys = keyboard.keys;

			for (let i = 0; i < opts.keys.length; i++) {
				const key = opts.keys[i];
				if (key in keys && keys[key]) {
					out.pressed = true;
					out.value = 1;
					break;
				}
			}

			if (out.value != 0) return out;


			const pads = gamepad.pads;

			for (let i = 0; i < opts.pad.length; i++) {
				const desc = unwrapDescriptor(opts.pad[i]);
				if (!desc) continue;

				pads.map(pad => {
					if (desc.button && desc.id < pad.buttons.length && pad.buttons[desc.id].value != 0) {
						out.pressed = pad.buttons[desc.id].pressed;
						out.value = pad.buttons[desc.id].value;
					}
					else if (desc.axes && desc.id < pad.axes.length) {
						let axes = pad.axes[desc.id];
						if (desc.positive && axes < 0 || !desc.positive && axes > 0) return;
						axes = Math.abs(axes);
						out.value = axes;
						out.pressed = axes > module.exports.deadzone
					}
				});

				if (out.pressed) break;
			}

			return out;
		};

		module.exports.hook = options => {
			let keyboard = options.keyboard || "";
			let gamepad = options.gamepad || "";
			keyboard = keyboard.split(",");
			gamepad = gamepad.split(",");

			const opts = {
				keys: keyboard,
				pad: gamepad
			};

			const object = {
				keyboard: keyboard,
				gamepad: gamepad
			};

			Object.defineProperty(object, "pressed", {
				get: () => fetch(opts).pressed
			});
			Object.defineProperty(object, "value", {
				get: () => fetch(opts).value
			});

			return object;
		};

	})();

})();
