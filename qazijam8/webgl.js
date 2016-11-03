
;(function(){
	"use strict";

	window.load = {
		name: "ressourceTree",
		exports: ["./sprites.png", "./tv_small.png", "./test.vertex", "./test.fragment"],
		init: function () {
			"Player,stars,sprites,Enemy"
			.split(",").map(file => this.exports.push("./" + file + ".js"));

			"Entity,Sprite,input,sounds"
			.split(",").map(file => this.exports.push("./engine/" + file + ".js"));

			[...Array(21)].map((x,i) => this.exports.push("./sounds/shot" + i + ".wav"));
		}
	};

	const module = window.load = {
		name: "main"
	};

	module.init = (stars, input, overrides, Enemy, Player, ents, sprites, console, ressources) => {
		console.info("main loaded :D");

		const player = new Player();
		//const enemy = new Enemy();
		const enemies = [...Array(6)].map(x=>new Enemy());

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

		const wrapper = ce("div", {
			className: "screen",
			parent: document.body
		});

		const ctx = ce("canvas", {
			width: 512,
			height: 512
		}).getContext("2d");

		// TODO: separete all the opengl stuff into a separate file.. srsly.. this will become a mess
		let gl;
		try {
			gl = ce("canvas", {
				id: "game",
				width: 512,
				height: 512,
				parent: wrapper
			}).getContext("experimental-webgl");
		}
		catch (e) {
			alert("nope. no webgl for you :(");
			throw new Error("nope. no webgl for you :(");
		}

		window.gl = gl;

		document.body.classList.add("game");

		const reset = () => {
			player.x = ctx.canvas.width / 2 | 0;
			player.y = ctx.canvas.height - 20;

			enemies.map((enemy, i) => {
				enemy.x = player.x + 40 * i;
				enemy.y = 50;
			});
		};

		reset();

		let state = "main";

		let running = false;
		let ingame = true;

		// WEBGL INIT STUFF:
		const texture = gl.createTexture();

		const createShader = (src, type) => {
			const shader = gl.createShader(type);

			gl.shaderSource(shader, src);
			gl.compileShader(shader);

			if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
				console.error(`type: ${type == gl.VERTEX_SHADER ? "vertex" : "fragment"}, ${gl.getShaderInfoLog(shader)}`);
				return null;
			}

			return shader;
		};

		const vbo = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
			+1.0, +1.0,
			+1.0, -1.0,
			-1.0, -1.0,
			-1.0, +1.0
		]), gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		const ebo = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0,1,3,1,2,3]), gl.STATIC_DRAW);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

		let prog = gl.createProgram();

		const vs = createShader(ressources.Vertex["./test.vertex"], gl.VERTEX_SHADER);
		const fs = createShader(ressources.Fragment["./test.fragment"], gl.FRAGMENT_SHADER);

		if (!vs || !fs) {
			throw new Error("nope");
		}

		gl.attachShader(prog, vs);
		gl.attachShader(prog, fs);

		gl.deleteShader(vs);
		gl.deleteShader(fs);

		gl.linkProgram(prog);

		if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
			const status = gl.getProgramParameter(prog, gl.VALIDATE_STATUS);
			const error = gl.getError();
			console.error(`${status}: ${error}`);
			throw new Error("nope nope nope");
		}

		const uniforms = {
			time: gl.getUniformLocation(prog, "time"),
			resolution: gl.getUniformLocation(prog, "resolution"),
			gameResolution: gl.getUniformLocation(prog, "gameResolution"),
			texture: gl.getUniformLocation(prog, "texture")
		};

		const position = gl.getAttribLocation(prog, "position");

		gl.clearColor(0.0, 0.0, 0.0, 0.0);

		let lastTime = 0;
		const runner = (currentTime) => {
			requestAnimationFrame(runner);

			gl.canvas.width = gl.canvas.height = gl.canvas.clientHeight;
			gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

			const time = currentTime - lastTime;
			lastTime = currentTime;

			ctx.clear();

			let x = right.pressed || left.pressed ? right.value - left.value : 0;
			let y = down.pressed || up.pressed ? down.value - up.value : 0;
			let velocity = Math.min(1, Math.velocity(x, y)) * time;
			let direction = Math.direction(x, y);
			const coord = Math.coord(velocity, direction);

			if (ingame) player.move(coord.x, coord.y, velocity, direction);

			stars(ctx, player.x, player.y, ctx.canvas.width * ctx.canvas.height * 0.006 | 0);

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

				ents.draw(ctx);
			}


			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
			// this will turn the 2d canvas into a webgl texture that then can be used inside a fragment shader :D
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, ctx.canvas);
			//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			//gl.generateMipmap(gl.TEXTURE_2D);

			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

			gl.useProgram(prog);

			gl.uniform1f(uniforms.time, currentTime / 1000);
			gl.uniform2f(uniforms.resolution, gl.drawingBufferWidth, gl.drawingBufferHeight);
			gl.uniform2f(uniforms.gameResolution, ctx.canvas.width, ctx.canvas.height);

			gl.bindTexture(gl.TEXTURE_2D, null);
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.uniform1i(uniforms.texture, 0);

			gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
			gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
			gl.enableVertexAttribArray(position);

			//gl.drawArrays(gl.TRIANGLES, 0, 6);
			gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
			gl.disableVertexAttribArray(position);
			gl.bindTexture(gl.TEXTURE_2D, null);
			gl.bindBuffer(gl.ARRAY_BUFFER, null);
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

		};

		runner(0);
	};

})();

