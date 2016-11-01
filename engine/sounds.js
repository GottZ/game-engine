
;(function () {
	"use strict";

	const module = window.load = {
		name: "sounds",
		exports: {}
	};

	const ctx = new AudioContext();

	const sampleRate = ctx.sampleRate;
	const playbackBuffer = ctx.createBuffer(2, sampleRate * 4.5, sampleRate);
	const source = ctx.createBufferSource();
	source.buffer = playbackBuffer;
	source.connect(ctx.destination);
	source.loop = true;
	source.start();

	const left = playbackBuffer.getChannelData(0);
	const right = playbackBuffer.getChannelData(1);

	const channels = [left, right];

	let lastPosition = 0;

	setInterval(() => {
		const cur = Math.floor((ctx.currentTime - 0.1) * ctx.sampleRate);
		for (let i = lastPosition; i < cur; i++) {
			left[i % left.length] = right[i % right.length] = 0;
		}
		lastPosition = cur;
	}, 500);

	const sounds = module.exports.sounds = {};

	module.init = ressources => {
		Object.keys(ressources.Sounds).map(path => {
			const buff = ressources[path];
			sounds[path.replace(/^.*?\/?([^\/]+)\.\w*$/, "$1")] = [buff.getChannelData(0), buff.getChannelData(1)];
		});
	};

	const play = module.exports.play = (name, volumeLeft, volumeRight, delay) => {
		delay = delay || 0;
		if (!(name in sounds)) return;
		const timer = Math.floor((ctx.currentTime + 0.05 + delay) * ctx.sampleRate);
		const sl = sounds[name][0];
		const sr = sounds[name][1];
		for (var i = 0; i < sounds[name][0].length; i++) {
			const chpos = (i + timer) % left.length;
			left[chpos] += sl[i] * volumeLeft;
			right[chpos] += sr[i] * volumeRight;
			left[chpos] *= 0.5;
			right[chpos] *= 0.5;
		}
	};

})();

/* TODO:
 *
 * check out web midi api and if there is a better way
 * to get around context count limits except for
 * managing raw audio
 *
 * */
