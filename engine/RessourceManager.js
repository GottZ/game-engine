
(function () {
	"use strict";

	const module = window.load = {
		name: "RessourceManager",
		async: true
	};

	// ressourceTree ← ["./sounds/shot1.wav", "./sprites.png"]
	module.init = (xhr, ressourceTree, EventManager) => {

		const ressources = {Sounds:{},Raw:{},Images:{},JSON:{},Scripts:{}};

		const ev = module.exports = new EventManager();
		const ctx = new AudioContext();

		module.exports.loaded = 0;
		const count = module.exports.count = ressourceTree.length;

		module.cb();

		ev.on("loaded", (path, loaded, count) => {
			module.exports.loaded = loaded;
			module.exports.count = count;

			if (loaded == count) {
				window.load = {
					name: "ressources",
					exports: ressources
				};

				// destroy AudioContext
				ctx.close();
			}
		});

		let loaded = 0;

		const triggerLoaded = path => {
			ev.emit("loaded", path, ++loaded, count);
		};

		const reqXhr = path => xhr.get(path, res => {
			if (/\.(wav|mp3)/i.test(path)) {
				ctx.decodeAudioData(res.response, buff => {
					ressources.Sounds[path] = ressources[path] = buff;
					triggerLoaded(path);
				});
			}
			else {
				ressources.Raw[path] = ressources[path] = res.response;
				triggerLoaded(path);
			}
		}, {responseType: "arraybuffer"});

		const reqImage = path => ce("img", {
			src: path,
			onload: function () {
				ressources.Images[path] = ressources[path] = this;
				triggerLoaded(path);
			}
		});

		setTimeout(() => {
			ressourceTree.map(path => {
				if (/\.(png|jpg|jpeg|bmp)$/i.test(path)) {
					reqImage(path);
				}
				else if (/\.json/i.test(path)) {
					xhr.getJSON(path, res => {
						ressources.JSON[path] = ressources[path] = res;
						triggerLoaded(path);
					});
				}
				else if (/\.js/i.test(path)) {
					ce("script", {
						async: true,
						src: path,
						parent: document.head,
						onload: function () {
							ressources.Scripts[path] = ressources[path] = this;
							triggerLoaded(path)
						}
					});
				}
				else {
					reqXhr(path);
				}
			});
		}, 0);
	};
})();

