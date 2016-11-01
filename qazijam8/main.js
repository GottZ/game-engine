
;(function(){
	"use strict";

	window.load = {
		name: "ressourceTree",
		exports: ["./sprites.png"],
		init: function () {
			"Player,stars,sprites"
			.split(",").map(file => this.exports.push("./" + file + ".js"));

			"Entity,Sprite,input,sounds"
			.split(",").map(file => this.exports.push("./engine/" + file + ".js"));

			[...Array(21)].map((x,i) => this.exports.push("./sounds/shot" + i + ".wav"));
		}
	};

	const module = window.load = {
		name: "main"
	};

	module.init = (stars, input, overrides, Player, ents, sprites, console, ressources) => {
		console.info("main loaded :D");

		const player = new Player();

		const up = input.hook({
			keyboard: "w,up,KP_5",
			gamepad: "b12,a-1"
		});

		const down = input.hook({
			gamepad: "b13,a+1",
			keyboard: "s,down,KP_2"
		});

		const left = input.hook({
			gamepad: "b14,a-0",
			keyboard: "a,left,KP_1"
		});

		const right = input.hook({
			gamepad: "b15,a+0",
			keyboard: "d,right,KP_3"
		});

		const fire = input.hook({
			gamepad: "b0,b6,b7",
			keyboard: "space,KP_0,return"
		});

		const ctx = ce("canvas", {
			id: "game",
			width: 450,
			height: 450,
			parent: document.body
		}).getContext("2d");

		document.body.classList.add("game");

		const reset = () => {
			player.x = ctx.canvas.width / 2 | 0;
			player.y = ctx.canvas.height - 20;
		};

		reset();

		const menu = {};

		menu.main = {
			text: "main menu",
			items: [{
				name: "setup",
				text: "game settings (go here.. srsly...)"
			}, {
				name: "game",
				text: "start game"
			}],
			action: () => {ingame = false, running = false}
		};

		menu.setup = {
			text: "game settings",
			items: [{}]
		}

		let state = "main";

		let running = false;
		let ingame = true;

		let lastTime = 0;
		const runner = (currentTime) => {
			requestAnimationFrame(runner);

			const time = currentTime - lastTime;
			lastTime = currentTime;

			ctx.clear();


			let x = right.pressed || left.pressed ? right.value - left.value : 0;
			let y = down.pressed || up.pressed ? down.value - up.value : 0;
			let velocity = Math.min(1, Math.velocity(x, y)) * time;
			let direction = Math.direction(x, y);
			const coord = Math.coord(velocity, direction);

			if (ingame) player.move(coord.x, coord.y, velocity, direction);

			stars(ctx, player.x, player.y, ctx.canvas.width * ctx.canvas.height * 0.006);

			//ctx.drawText("i hope this actually gets somewhere D: so much stuff to do D:", 14, 6);
			//ctx.drawText("  sadly i did not get this done during qazijam7 :/ so sad :(", 14, 6);
			ctx.drawText(`  frameTime: ${time.toFixed(4)}\ncurrentTime: ${currentTime.toFixed(4)}\n       ents: ${ents.length}`, 20, 20);


			if (!ingame) {
				// TODO: display menu stuff
			}



			if (ingame) {

				/*let odd = currentTime / 500 % 2 | 0;
				sprites.kappa.get(["closedright", "openright"][odd]).draw(ctx, 100, 200);
				if (odd) {
					ctx.drawText("haha", 140, 200);
				}*/

				player.draw(ctx);

				if (fire.pressed) player.fire(ctx);

				ents.tick({
					ctx: ctx,
					time: time,
					x: player.x,
					y: player.y,
					vx: player.vx,
					vy: player.vy,
					v: player.v,
					o: player.o
				});
			}
		};

		runner(0);
	};

})();

