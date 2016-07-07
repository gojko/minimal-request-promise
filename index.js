/*global module, require, global */
var https = require('https');
function minimalRequestPromise(callOptions, PromiseImplementation) {
	'use strict';
	var Promise = PromiseImplementation || global.Promise;
	return new Promise(function (resolve, reject) {
		var req = https.request(callOptions);

		req.on('response', function (res) {
			var dataChunks = [];
			res.setEncoding('utf8');
			res.on('data', function (chunk) {
				dataChunks.push(chunk);
			});
			res.on('end', function () {
				var response = {
					headers: res.headers,
					body: dataChunks.join(''),
					statusCode: res.statusCode,
					statusMessage: res.statusMessage
				};
				if (callOptions.resolveErrors || (response.statusCode > 199 && response.statusCode < 400)) {
					resolve(response);
				} else {
					reject(response);
				}
			});
		}).on('error', function (e) {
			reject(e);
		});
		if (callOptions.body) {
			req.write(callOptions.body);
		}
		req.end();
	});
};

module.exports = minimalRequestPromise;

module.exports.get = function (url, options, PromiseImplementation) {
	'use strict';
	var Promise = PromiseImplementation || global.Promise;
	return Promise.resolve(url)
		.then(function(url) { return require('url').parse(url); })
	  .then(function(parsedUrl) {
			options = options || {};
			options.method = 'GET';
			var keys = Object.keys(parsedUrl);
			keys.forEach(function(key) { options[key] = parsedUrl[key] });

			return minimalRequestPromise(options, Promise);
		});
};

module.exports.post = function (url, options, PromiseImplementation) {
	'use strict';
	var Promise = PromiseImplementation || global.Promise;
	return Promise.resolve(url)
		.then(function(url) { return require('url').parse(url); })
	  .then(function(parsedUrl) {
			options = options || {};
			options.method = 'POST';
			var keys = Object.keys(parsedUrl);
			keys.forEach(function(key) { options[key] = parsedUrl[key] });

			return minimalRequestPromise(options, Promise);
		});
};
