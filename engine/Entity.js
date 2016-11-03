
;(function () {
	"use strict";

	// TODO: make this entitymanager an entitymanager
	const module = window.load = {
		name: "Entity"
	};

	module.init = (extend, EventManager, ents) => {

		const Entity = module.exports = function Entity (opts) {
			EventManager.call(this);
			ents.push(this);
			this.name = opts.name;
			this.x = opts.x || 0;
			this.y = opts.y || 0;
			this.direction = opts.direction || 0;
			this.velocity = opts.velocity || 0;
			this.sprite = opts.sprite;
			this.data = opts.data || {};
			this.hits = opts.hits || 0;
			this.alive = (opts.alive != false);
			this.children = [];
			// TODO: Collision
			// TODO: if texture box hits, check pixel based
			Object.defineProperty(this, "hl", {
				get: () => this.x - this.sprite.x
			});
			Object.defineProperty(this, "hr", {
				get: () => this.x - this.sprite.x + this.sprite.width
			});
			Object.defineProperty(this, "ht", {
				get: () => this.y - this.sprite.y
			});
			Object.defineProperty(this, "hb", {
				get: () => this.y - this.sprite.y + this.sprite.height
			});
		};

		const p = extend(Entity, EventManager);

		p.kill = function EntityKill () {
			this.alive = false;
			ents.remove(this);
			// TODO: entity IO system
		};

		p.move = function EntityMove (mx, my, vel, dir) {
			// TODO: stats like weight, agility, …
			this.x += mx;
			this.y += my;
			this.velocity = vel;
			this.direction = dir;
		};

		p.draw = function EntityDraw (ctx, x, y) {
			if (typeof x != "undefined") this.x = x;
			if (typeof y != "undefined") this.y = y;

			x = Math.floor(this.x);
			y = Math.floor(this.y);

			this.emit("draw", ctx, x, y);

			this.children.map(child => {
				const ent = child.ent;
				const att = this.sprite.getAttachment(child.attachment);
				ent.x = Math.round(x - att.x);
				ent.y = Math.round(y + att.y);
				ent.draw(ctx);
			});
		}

		p.attach = function EntityAttach (attachment, ent) {
			this.children.push({attachment: attachment, ent: ent});
			return ent;
		}

		p.tick = () => true;

	};

	(function () {
		const module = window.load = {
			name: "ents",
			exports: []
		};

		let ents = module.exports;

		module.exports.tick = (opts) => {
			for (let i = 0; i < ents.length; i++) {
				const ent = ents[i];
				if (!ent.tick(opts)) ents.splice(i--, 1);
				//else (ent.draw());
			}
		};
		module.exports.remove = ent => {
			const index = ents.indexOf(ent);
			// TODO: create some debugging tools for throwing debugger; when the console is open etc.
			if (index == -1) throw new Error("fuck the whut?");
			ents.splice(index, 1);
		};
		module.exports.draw = ctx => {
			ents.map(ent => ent.draw(ctx));
		};
	})();
})();

