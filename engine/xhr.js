
;(function(){
  "use strict";

	const module = window.load = {
		name: "xhr"
	};

	const xhr = module.exports = (type, url, cb, opts) => {
		const xhr = new XMLHttpRequest();
		if (opts) Object.keys(opts).map(key => xhr[key] = opts[key]);
		xhr.open(type, url);

		xhr.onreadystatechange = () => {
			if (xhr.readyState == 4) {
				cb(xhr);
			}
		}

		xhr.send();

		return xhr;
	};

	xhr.get = (url, cb, opts) => xhr("GET", url, cb, opts);
	xhr.post = (url, cb, opts) => xhr("POST", url, cb, opts);
	xhr.json = (url, cb, opts) => xhr("GET", url, res => cb(JSON.parse(res.responseText)), opts);

})();

