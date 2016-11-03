
(function () {
	"use strict";

	(function () {
		const module = window.load = {
			name: "Enemy"
		};

		module.init = (Entity, extend, sprites, ents) => {

			// simple try to create a destructable object..
			// names are not final up to this point
			const Enemy = module.exports = function EnemyEntity (opts) {
				if (!opts) opts = {};
				opts.name = "Enemy";
				opts.hits = 20;
				if (!opts.sprite) opts.sprite = sprites["ufo"];
				Entity.call(this, opts);

				this.on("draw", (ctx, x, y) => {
					this.sprite.draw(ctx, x, y);
				});
			};

			const p = extend(Enemy, Entity);

			p.tick = function EnemyTick (obj) {
				// TODO: put this somewhere usefull
				// TODO: seriously.. i should stop crafting such spaghetti code
				const hits = ents.filter(ent => {
					if (ent.name != "Bullet" || !ent.sprite) return false;
					if (ent.hl < this.hr && this.hl < ent.hr
							&& ent.ht < this.hb && this.ht < ent.hb) {
						return true;
					}
					return false;
				});

				if (hits.length > 0) {
					this.hits -= hits.length;
					if (this.hits <= 0) ents.remove(this);
				}

				hits.map(ent => {
					ents.remove(ent);
				});

				return true;
			}
		};
	})();

})();

