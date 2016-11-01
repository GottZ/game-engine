
;(function(){
	"use strict";

	let ressources;

	const Sprite = (window.load = {
		name: "Sprite",
		init: _ressources => ressources = _ressources
	}).exports = function Sprite (ctx, offsetX, offsetY, width, height, centerX, centerY) {
		// this is only for debugging purposes to figure out the origin of this sprite
		this.args = arguments;

		this.x = centerX || 0;
		this.y = centerY || 0;
		this.attachments = [];

		if (typeof ctx == "string") {
			if (!(ctx in ressources)) throw new Error("fail. " + ctx + " has not been loaded yet…");
			const img = ressources[ctx];

			this.texture = ce("canvas", {
				width: img.width,
				height: img.height
			});

			ctx = this.ctx = this.texture.getContext("2d");
			ctx.drawImage(img, 0, 0);
		}
		else {
			this.texture = ctx.getAsCanvas(offsetX, offsetY, width, height);
			this.ctx = this.texture.getContext("2d");
		}
	};

	HTMLCanvasElement.prototype.extractSprite = function (offsetX, offsetY, width, height, centerX, centerY) {
		return new Sprite(this.getContext("2d"), offsetX, offsetY, width, height, centerX, centerY);
	};

	CanvasRenderingContext2D.prototype.extractSprite = function (offsetX, offsetY, width, height, centerX, centerY) {
		return new Sprite(this, offsetX, offsetY, width, height, centerX, centerY);
	};

	Sprite.prototype.extractSprite = function SpriteExtract () {
		return this.ctx.extractSprite.apply(this.ctx, arguments);
	};

	Sprite.prototype.draw = function SpriteDraw (ctx, offsetX, offsetY) {
		ctx.drawImage(this.texture, offsetX - this.x, offsetY - this.y);
		return this;
	};

	Sprite.prototype.flip = function SpriteFlip () {
		if (this.flipped) throw new Error("stop flipping me around again and again! i'm just a poor little Sprite! DON'T!");

		const newSprite = this.texture.flip().extractSprite(0, 0, this.width, this.height, this.width - 1 - this.x, this.y);

		// this is only for debugging purposes to figure out the origin of this sprite.. does not matter actually if it stays.
		if (this.args) newSprite.args = this.args;
		newSprite.flipped = true;

		newSprite.attachments = this.attachments.map(att => ({x: this.width - 1 - att.x, y: att.y, name: att.name}));

		return newSprite;
	};

	Sprite.prototype.addAttachment = function SpriteAddAttachment (name, x, y) {
		if (typeof name != "string") {
			y = x;
			x = name;
			name = "undefined";
		}
		this.attachments.push({x: x, y: y, name: name});
		return this;
	};

	Sprite.prototype.getAttachment = function SpriteGetAttachment (name) {
		const att = this.attachments.filter(x=>x.name == name).shift();
		return {name: att.name, x: att.x - this.x, y: att.y - this.y};
	};

	Object.defineProperty(Sprite.prototype, "width", {
		get: function () {
			return this.texture.width;
		}
	});
	Object.defineProperty(Sprite.prototype, "height", {
		get: function () {
			return this.texture.height;
		}
	});


	// SPRITEGROUP STUFF
	const SpriteGroup = (window.load = {
		name: "SpriteGroup"
	}).exports = function SpriteGroup (sprites, names, index) {
		this.sprites = sprites || [];
		this.names = names || new Array(this.sprites.length).fill("undefined");
		this.index = index || 0;
		this.position = 0;
	};

	SpriteGroup.prototype.draw = function (ctx, x, y, index) {
		this.get(index).draw(ctx, x, y);
		return this;
	};

	SpriteGroup.prototype.add = function (name, sprite) {
		if (typeof name != "string") {
			sprite = name;
			name = "undefined";
		}
		this.sprites.push(sprite);
		this.names.push(name);
		return this;
	};

	SpriteGroup.prototype.get = function (index) {
		return this.sprites[
			typeof index == "string"
			? this.names.indexOf(index)
			: typeof index == "undefined"
				? this.index
				: index % this.sprites.length
		];
	};

	SpriteGroup.prototype.getRandom = function () {
		return this.sprites[this.sprites.length * Math.random() | 0];
	};

	SpriteGroup.prototype.getNext = function () {
		return this.sprites[this.sprites.length % this.position++];
	};
	SpriteGroup.prototype.getPrevious = function () {
		return this.sprites[this.sprites.length % this.position--];
	};

})();

