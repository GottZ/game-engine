
;(function () {
	"use strict";

	(function () {
		const module = window.load = {
			name: "Bullet"
		};

		module.init = (sprites, ents, Entity, extend) => {
			const Bullet = module.exports = function Bullet (x, y, vx, vy) {
				Entity.call(this, {
					name: "Bullet"
				});
				this.x = x;
				this.vx = vx * 0.1;
				this.vy = vy * 0.2 -5;
				this.y = y;
				this.ticks = 0;
				this.variation = Math.random();
				this.on("draw", (ctx, x, y) => {
					this.sprite = sprites.bullets[this.type].getRandom().draw(ctx, this.x | 0, this.y | 0);
				});
			};

			const p = extend(Bullet, Entity);
			p.tick = function BulletTick (opts) {
				this.ticks++;
				this.type = Math.limit(0, 5, this.ticks / (2 * this.variation +2) / 2 | 0);
				this.y += this.vy;
				this.x += this.vx;
				return this.y >= -100;
			};
		};
	})();

	(function () {
		const module = window.load = {
			name: "Flame"
		};

		module.init = (Entity, extend, sprites) => {

			const Flame = module.exports = function FlameEntity (opts) {
				if (!opts) opts = {};
				opts.name = "Flame";
				Entity.call(this, opts);
				this.power = 0;

				this.on("draw", (ctx, x, y) => {
					const max = sprites.flames.length - 1;
					const power = Math.limit(0, max, max-this.power);
					this.sprite = sprites.flames[power].getRandom().draw(ctx, x, y);
				});
			};

			const p = extend(Flame, Entity);
		};
	})();

	const module = window.load = {
		name: "Player"
	};

	module.init = (Entity, Flame, extend, sprites, sounds, Bullet) => {

		const Player = module.exports = function PlayerEntity (opts) {
			if (!opts) opts = {};
			opts.name = "Player";
			Entity.call(this, opts);
			this.health = opts.health || 100;

			window.player = this;

			this.v = 0;
			this.o = 0;

			const flames = ["engine1", "engine2"].map(name => this.attach(name, new Flame()));

			this.on("draw", (ctx, x, y) => {
				let sprite = "center";

				if (Math.abs(this.vx) > 4.5) {
					sprite = this.vx > 0 ? "rightfast" : "leftfast";
				}
				else if (Math.abs(this.vx) > 0.4) {
					sprite = this.vx > 0 ? "right" : "left";
				}

				const ship = this.sprite = sprites.ship.get(sprite);
				// TODO: this.vy should not be -5 - 5
				flames.map(flame => flame.power = -(this.vy / 5 * 6) | 0);
				ship.draw(ctx, x, y);
			});
		}

		const p = extend(Player, Entity);

		p.move = function PlayerMove (mx, my, vel, orig) {
			if (vel == 0) orig = this.o;
			else this.o = orig;
			this.v = Math.limit(-5, 5, this.v * 0.9 + vel * 0.2);
			let coord = Math.coord(this.v, orig);
			this.vx = coord.x;
			this.vy = coord.y;
			this.x += coord.x;
			this.y += coord.y;
		};

		p.fire = function PlayerFire (ctx, cooldown) {
			const sprite = sprites.ship.get("center");
			const att = sprite.getAttachment("bezel");

			let sx = Math.limit(0, 1, this.x / ctx.canvas.width);

			sounds.play("shot" + (sounds.sounds.length * Math.random() | 0), (1 - sx) * 0.7 + 0.3, sx * 0.7 + 0.3);

			let x = this.x + att.x;
			let y = this.y + att.y;

			new Bullet(x, y, this.vx, this.vy);
		};

		window.Player = Player;
	};


})();

