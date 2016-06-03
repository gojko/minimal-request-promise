/*global module, require, global */
var https = require('https');
module.exports = function (callOptions, PromiseImplementation) {
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
