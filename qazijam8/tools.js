
(function () {
	"use strict";

	window.load = {
		name: "ressourceTree",
		exports: ["./sprites.png", "./sprites.js"],
		init: function () {
			const scripts = "Sprite";
			scripts.split(",").map(file => this.exports.push("./engine/" + file + ".js"));
		}
	};

	const module = window.load = {
		name: "main"
	};

	module.init = (console, Sprite, sprites, SpriteGroup, ressources) => {

		console.dir(sprites)
		window.ressources = ressources;

		window.sprites = sprites;
		const sprite = window.sprite = new Sprite("./sprites.png");

		document.body.appendChild(sprite.texture);
		document.body.classList.add("tools");
		const text = ce("div", {
			parent: document.body,
			style: {
				position: "fixed",
				left: 0,
				top: 0,
				opacity: 0.4,
				color: "#fff",
				fontSize: "800%"
			}
		}).appendChild(document.createTextNode("woop"));

		sprite.texture.addEventListener("mousemove", e => {
			const coord = `x: ${e.offsetX} y: ${e.offsetY}`;
			text.nodeValue = coord;
		});

		const ctx = window.ctx = sprite.texture.getContext("2d");
		ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
		ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);


		ctx.strokeStyle = "rgba(0, 255, 0, 0.06)";

		const processSprite = (node, key) => {
			if (node.flipped) {
				//console.log(key, "flipped:", node);
				return;
			};
			ctx.strokeRect(node.args[1] + 0.5, node.args[2] + 0.5, node.width -1, node.height -1);
			ctx.fillStyle = "rgba(0, 255, 255, 0.6)";
			ctx.fillRect(node.x + node.args[1], node.y + node.args[2], 1, 1);
			ctx.fillStyle = "rgba(255, 0, 0, 0.6)";
			node.attachments.map(attachment => {
				ctx.fillRect(attachment.x + node.args[1], attachment.y + node.args[2], 1, 1);
			});
			//console.log(key, node);
		};

		const processSpriteGroup = (spriteGroup, key) => {
			spriteGroup.sprites.map(sprite => {
				processSprite(sprite, key);
			});
		};

		Object.keys(sprites).map(key => {
			const node = sprites[key];
			switch(node.constructor.name) {
				case "Sprite":
					processSprite(node, key);
					break;
				case "SpriteGroup":
					processSpriteGroup(node, key);
					break;
				default:
					node.map(group => (group.constructor.name == "Sprite" ? processSprite : processSpriteGroup)(group, key));
			}
		});

	};

})();

