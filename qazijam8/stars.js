
;(function(){
	"use strict";

	let seeder;

	const module = window.load = {
		name: "stars",
		exports: {},
		init: _seeder => {
			seeder = _seeder;
		}
	};

	module.exports = (ctx, offsetX, offsetY, count) => {
		const r = seeder(178615398);
		const now = Date.now() / 12;
		const w = ctx.canvas.width;
		const h = ctx.canvas.height;

		[...Array(count || 512)].map(x => {
			const speed = Math.limit(0.05, 1, r());

			//ctx.fillStyle = "#" + (speed * 256 | 0).toString(16).repeat(3);
			const color = speed * 128 * r() | 0;
			ctx.fillStyle = `rgb(${color},${color},${color})`;

			ctx.fillRect(
				(r() * w - offsetX * speed * 0.4 + 99999) % w | 0,
				(r() * h - offsetY * speed / 3 + now * 3 * speed) % h | 0,
			 	1, speed * 5 + 1 | 0
			);
		});
	};



})();

