
// TODO: make it pretty.. in this state its usable but slow
;(function () {
	"use strict";

	const module = window.load = {
		name: "EventManager"
	};

	const EventManager = module.exports = function EventManager () {
		this.events = {_counter: 0};
	};

	const p = EventManager.prototype = {};

	p.on = function EventManagerOn (name, callback) {
		if (!(name in this.events)) this.events[name] = {};
		this.events[name][this.events._counter] = callback;
		return this.events._counter++;
	};

	p.removeListener = function EventManagerRemoveListener (id) {
		// TODO: improve performance after qazijam8
		Object.keys(this.events)
		.filter(x => typeof this.events[x] == typeof {})
		.map(eventName => Object.keys(this.events[eventName])
			.map(eventId => {
				if (eventId == id) {
					delete this.events[eventName][eventId];
				}
			})
		);
	};

	p.emit = function EventManagerEmit (name) {
		if (!(name in this.events)) return;
		let args = Array.prototype.filter
		.call(arguments, (arg, i) => i > 0);

		Object.keys(this.events[name])
		.map(event => this.events[name][event]
		.apply(this, args));
	}

})();

