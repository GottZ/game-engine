
;(function(){
	"use strict";

	const module = window.load = {
		name: "sprites",
		exports: {}
	};

	module.init = (SpriteGroup, Sprite, ressources) => {

		const sprites = module.exports;

		const img = ressources["./sprites.png"];
		const can = ce("canvas", {width: img.width, height: img.height});
		const ctx = can.getContext("2d");
		ctx.drawImage(img, 0, 0);

		// swap transparency color key with transparency
		const d = ctx.getImageData(0, 0, img.width, img.height);

		for (let i = 0; i < d.data.length; i+=4) {
			let r = d.data[i];
			let g = d.data[i+1];
			let b = d.data[i+2];
			if (r > 32 && g < 32 && b < 32) {
				d.data[i+3] = 0;
			}
		}

		ctx.putImageData(d, 0, 0);

		sprites.ship = new SpriteGroup()
			.add("center",    ctx.extractSprite( 1, 15, 11, 22, 5, 7)
				.addAttachment("bezel", 5, 0)
				.addAttachment("engine1", 1.5, 21)
				.addAttachment("engine2", 8.5, 21)
			)
			.add("left",      ctx.extractSprite(13, 15, 11, 22, 5, 7)
				.addAttachment("bezel", 5, 0)
				.addAttachment("engine1", 1.5, 21)
				.addAttachment("engine2", 8.5, 21)
			)
			.add("leftfast",  ctx.extractSprite(25, 15, 11, 22, 5, 7)
				.addAttachment("bezel", 5, 0)
				.addAttachment("engine1", 1.5, 21)
				.addAttachment("engine2", 8.5, 21)
			);
		sprites.ship
			.add("right",     sprites.ship.get("left").flip())
			.add("rightfast", sprites.ship.get("leftfast").flip());


		sprites.turret = new SpriteGroup()
			.add("down",         ctx.extractSprite(113,  1, 25, 34, 12, 16)
				.addAttachment("bezel", 12, 29))
			.add("left",         ctx.extractSprite( 75,  1, 37, 25, 24, 15)
				.addAttachment("bezel", 0, 13))
			.add("downleft",     ctx.extractSprite( 75, 27, 27, 32, 13, 16)
				.addAttachment("bezel", 4, 24))
			.add("downleftleft", ctx.extractSprite(103, 36, 35, 27, 22, 16)
				.addAttachment("bezel", 4, 19));

		sprites.kappa = new SpriteGroup()
			.add("closedright", ctx.extractSprite(254,  73, 96, 133, 52, 96)
				.addAttachment("eye1", 44, 69)
				.addAttachment("eye2", 74, 71)
				.addAttachment("mouth", 59, 107)
			)
			.add("openright",   ctx.extractSprite(254, 215, 96, 137, 52, 96)
				.addAttachment("eye1",  44, 69)
				.addAttachment("eye2",  74, 71)
				.addAttachment("mouth", 58, 108)
			);
		sprites.kappa
			.add("openleft",    sprites.kappa.get("openright").flip())
			.add("closedleft",  sprites.kappa.get("closedright").flip());

		sprites.twitch = new SpriteGroup()
			.add("right",  ctx.extractSprite(88, 314, 16, 18, 7, 8))
			.add("center", ctx.extractSprite(87, 334, 17, 18, 8, 7))
			.add("left",   ctx.extractSprite(87, 352, 16, 18, 8, 8));

		sprites.unbreakable = (new SpriteGroup()).add("left", ctx.extractSprite(132, 309, 56, 60, 28, 30));
		sprites.unbreakable.add("right", sprites.unbreakable.get("left").flip());

		// TODO: add all remaining walls
		sprites.walls = new SpriteGroup()
			.add("right0", ctx.extractSprite(5, 231, 54, 149, 0, 149)
				.addAttachment(16, 112)
				.addAttachment(40, 71)
			)
			.add("right1", ctx.extractSprite(140, 1, 44, 101, 0, 101)
				.addAttachment(26, 33)
				.addAttachment(18, 67)
			);

		sprites.ammo = new SpriteGroup()
			//.add(ctx.extractSprite( 46, 64, 7, 7, 3, 3))
			.add(ctx.extractSprite( 82, 64, 7, 7, 3, 3))
			.add(ctx.extractSprite( 90, 64, 7, 7, 3, 3))
			.add(ctx.extractSprite( 98, 64, 7, 7, 3, 3))
			.add(ctx.extractSprite(106, 64, 7, 7, 3, 3));

		sprites.ufo = ctx.extractSprite(154, 259, 25, 22, 12, 13);
		sprites.ufoBig = ctx.extractSprite(79, 248, 55, 55, 27, 30);
		sprites.rocket = ctx.extractSprite(202, 264, 17, 41, 8, 20);

		sprites.pickup = new SpriteGroup()
			.add("fat",     ctx.extractSprite( 2, 2, 13, 11, 6, 5))
			.add("default", ctx.extractSprite(18, 2, 11, 11, 5, 5))
			.add("tall",    ctx.extractSprite(33, 1, 11, 13, 5, 6));

		sprites.bullets = [...Array(6)].map((bleh, i) =>
			new SpriteGroup().add(ctx.extractSprite (
				[39,43,48,53,57,62][i], 24,
				[1,2,3,3,4,5][i],  [1,2,4,7,9,13][i],
				[0,1,1,1,2,2][i], 0
			))
		);
		sprites.bullets.map(group => group.add(group.sprites[0].flip()));

		sprites.bullet = ctx.extractSprite(76, 66, 3, 3, 1, 1);

		sprites.flames = [...Array(7)].map((bleh, y) =>
			new SpriteGroup([...Array(4)].map((bleh, x) =>
				ctx.extractSprite(1 + x*5, 38 + y*9, 4, 8, 1.5, 0)
			))
		);
		sprites.flames.map(group => group.sprites.map(sprite => group.add(sprite.flip())));

		// TODO: add missing stuff

		// font character coordinates
		const charmap = "ABCDEFGHIJKLMNOPQRSTUVWXYZ'0123456789,.-+!?/\\=_:;(){}\"\x00<>↑↓←→¨¶".split("");
		const charsPerLine = charmap.length / 7;
		const charsprites = charmap.map((char, i) => {
			const x = 20 + (i % charsPerLine) *6;
			const y = 37 + (i / charsPerLine |0) *9;

			//return ctx.getAsCanvas(x+1, y+1, 5, 8);
			return ctx.extractSprite(x+1, y+1, 5, 8, 2, 3);
		});

		sprites.charsprites = charsprites;

		const font = (char, color) => {
			return charsprites[charmap.indexOf(char)].texture;
		};

		CanvasRenderingContext2D.prototype.drawText = function (text, x, y) {
			const lines = text.split(/\r?\n/g);

			lines.map((line, li) => {
				const chars = line.toUpperCase().split("").map(
					char => charmap.includes(char)
						? font(char)
						: char == " " ? null : font("\x00")
				);
				chars.map((char, i) => {
					if (char) this.drawImage(char, x + i * 7, y + li * 9)
				});
			});
		};

	};

})();

