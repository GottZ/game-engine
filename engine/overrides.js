
;(function(){
	"use strict";

	window.ce = (tag, opts) => {
		const node = document.createElement(tag);

		if (!opts) return node;

		for (let key in opts) {
			if (key == "parent") continue;
			node[key] = opts[key];
		}

		if (opts.parent) {
			opts.parent.appendChild(node);
		}

		return node;
	};

	window.loadScript = (filename => {
		ce("script", {
			async: true,
			src: filename,
			parent: document.head
		});
	});

	Math.limit = function (min, max, value) {
		return Math.min(max, Math.max(min, value));
	};

	Math.velocity = function (a, b) {
		return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
	};

	Math.direction = function (a, b) {
		let gw = 0;
		if (a == 0 && b == 0) return 0;
		gw = Math.atan(a / b) * 180 / Math.PI;
		if (b < 0) gw += 180;
		else if (a < 0) gw += 360;
		return gw;
	};

	Math.coord = function (vel, dir) {
		return {
			x: Math.sin(dir / 180 * Math.PI) * vel,
			y: Math.cos(dir / 180 * Math.PI) * vel
		};
	};

	Math.maxVel = function (a, b, max) {
		const v = Math.velocity(a, b);
		const dir = Math.direction(a, b);
		return Math.coord(Math.min(v, max), dir);
	};

	CanvasRenderingContext2D.prototype.clear = function () {
		this.clearRect(0, 0, this.canvas.width, this.canvas.height);
	};

	CanvasRenderingContext2D.prototype.getAsCanvas = function (x, y, w, h) {
		const ctx = ce("canvas", {width: w, height: h}).getContext("2d");

		ctx.drawImage(this.canvas, x, y, w, h, 0, 0, w, h);
		return ctx.canvas;
	};

	HTMLCanvasElement.prototype.flip = /*HTMLImageElement.prototype.flip =*/ function () {
		const ctxi = this.getContext("2d");
		const ctx = ce("canvas", {width: this.width, height: this.height}).getContext("2d");
		ctx.save();
		ctx.translate(this.width, 0);
		ctx.scale(-1, 1);
		ctx.drawImage(this, 0, 0);
		ctx.restore();
		return ctx.canvas;
	};

	// switch portrait / landscape mode
	// this will ensure aspect ratio and that the game area is contained inside the view area

	window.addEventListener("DOMContentLoaded", () => {
		document.body.classList.add("vh");

		const resize = () => {
			const height = window.innerHeight > window.innerWidth;

			if (height && document.body.classList.contains("vh")) {
				document.body.classList.remove("vh");
				document.body.classList.add("vw");
			}

			else if (!height && document.body.classList.contains("vw")) {
				document.body.classList.remove("vw");
				document.body.classList.add("vh");
			}
		};

		window.addEventListener("resize", resize);

		resize();

		window.load = {name: "overrides"};
	});
})();

