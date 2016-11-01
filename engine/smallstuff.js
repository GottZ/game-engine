
;(function(){
	"use strict";

	window.load = {
		name: "seeder",
		exports: seed => {
			return () => {
				seed *= 1103515245 + 12345;
				seed--;
				return (seed %= Number.MAX_SAFE_INTEGER) / Number.MAX_SAFE_INTEGER;
			};
		}
	};

	window.load = {
		name: "extend",
		exports: function (child, parent) {
			return child.prototype = Object.create(parent.prototype);
		}
	};

})();

