
;(function () {
	"use strict";

	"EventManager,smallstuff,xhr,RessourceManager".split(",").map(file => {
		loadScript("./engine/" + file + ".js");
	});

	// prevent pre hooking into setTimeout for anti cheat reasons
	const setTimeout = window.setTimeout;

	const console = (() => {
		const module = {
			name: "console",
			exports: {}
		};

		// this reimplements the console in a cross browser safe way
		// for ref: https://developer.mozilla.org/en-US/docs/Web/API/console

		setTimeout(() => {
			window.load = module;
		}, 0);

		const c = module.exports;

		const hasConsole = "console" in window;
		const con = hasConsole ? window.console : {};

		const check = (key, replace) => {
			c[key] = key in con ? con[key].bind(con) : replace ? c[replace] : ()=>{};
		};

		"assert,clear,count,group,groupEnd,log,profile,profileEnd,table,time,timeEnd,timestamp,trace".split(",").map(x => check(x));
		"dir,dirxml,error,info,warn".split(",").map(x => check(x, "log"));
		check("groupCollapsed", "group");

		c.debug = c.log;
		c.exception = c.error;

		// TODO: console.hook (redirecting console output)

		return c;
	})();

	setTimeout(function () {
		"use strict";

		document.body.classList.add("loading");

		const loaderOutline = ce("div", {
			className: "engineLoader",
			parent: document.body
		});

		const loader = ce("div", {
			parent: loaderOutline
		});

		const setPerc = perc => {
			loader.style.width = `${Math.limit(10, 100, perc)}%`;
		};

		setPerc(0);

		window.load = {
			name: "ressourceLoadingIndicator",
			init: RessourceManager => {
				//RessourceManager.on("loading", f => console.log("Loading Ressource: %s", f));
				RessourceManager.on("loaded", (f, l, c) => {
					setPerc((l+1) / c * 90 + 10);
					console.log("%cLoaded Ressources: %c%d of %d done (%s)", "color: #880", "color: #aaa", l, c, f);
				});
			}
		};
	}, 0);

	const modules = {};
	console.warn("remove window.modules");
	window.modules = modules;
	const loaded = [];
	const pending = [];

	// prevent injecting custom code between my loader and the modules
	Object.defineProperty(window, "load", {
		set: function (module) {
			setTimeout(() => {
				if (!module.name || module.name in modules) {
					return;
				}

				modules[module.name] = module;
				pending.push(module.name);

				// do some magic
				if (module.init) {
					module.depends = module.init.toString()
						.match(/^.*?\(?([^\(]*?)(?:\)|=>)/)[1].split(",")
						.map(x=>x.trim().replace(/^[\$_]/, ""))
						.filter(x => x.length > 0)
					// https://regex101.com/r/kz3uxd/1/tests
					console.info("%cloading module %c%s %cwith dependencies: %s",
						"color: #080", "color: #000", module.name, "color: #aaa", module.depends.join(" "));

				}
				else console.info("%cloading module %c%s %cwithout dependencies",
					"color: #080", "color: #000", module.name, "color: #ddd");

				runner();
			}, 0);
		},
		get: function () {
			return "stop trying :D";
		}
	});


	const runner = () => {

		for (let i = 0; i < pending.length; i++) {
			const module = modules[pending[i]];
			if (!module.depends) {
				pending.splice(i, 1);
				loaded.push(module.name);
				i = -1;
				continue;
			}

			if (!module.init) return;

			// checking dependencies

			const pendingDeps = module.depends.filter(dep => !loaded.includes(dep));

			if (pendingDeps.length == 0) {
				const args = module.depends
					.map(name => modules[name].exports);
					// TODO: prevent hooking
					//.map(exports => (typeof exports == "function" ? exports : Object.create(exports)));

				if (!module.async) {
					pending.splice(pending.indexOf(module.name), 1);
					loaded.push(module.name);
					console.info("%crunning sync %c%s",
						"color: #008", "color: initial", module.name);
					if (module.name == "main") {
						console.info("%cloading main :D", "color: #a00");
						console.groupEnd();
						document.body.classList.remove("loading");
					}
					module.init.apply(module, args);
					i = -1;
					continue;
				}

				if (!module.cb) {
					module.cb = () => {
						delete module.cb;
						pending.splice(pending.indexOf(module.name), 1);
						loaded.push(module.name);
						console.info("%crunning async %c%s done",
							"color: #a08", "color: initial", module.name);
						runner();
					};

					console.info("%crunning async %c%s",
						"color: #a08", "color: initial", module.name);
					module.init.apply(module, args);
				}
			}
		}
	};

	console.groupCollapsed("%cloader loaded :D", "color: #a00");

})();

