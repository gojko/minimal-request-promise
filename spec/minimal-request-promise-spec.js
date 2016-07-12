/*global beforeEach, afterEach, describe, it, expect, require, jasmine */
var fakeRequest = require('fake-http-request'),
	underTest = require('../index'),
	https = require('https'),
	http = require('http');
describe('Minimal Request Promise', function () {
	'use strict';
	beforeEach(function () {
		fakeRequest.install();
		fakeRequest.install('http');
	});
	afterEach(function () {
		fakeRequest.uninstall();
		fakeRequest.uninstall('http');
	});
	it('sends the args to the underlying request object', function () {
		underTest({host: 'x'});
		expect(https.request.calls[0].args).toEqual([{host: 'x'}]);
	});
	it('does not resolve until the underlying request responds', function (done) {
		https.request.pipe(done);
		underTest({}).then(done.fail, done.fail);
	});
	it('resolves when the underlying request responds', function (done) {
		underTest({}).then(function (response) {
			expect(response.statusCode).toEqual('200');
			expect(response.statusMessage).toEqual('OK');
			expect(response.body).toEqual('Hi there');
		}).then(done, done.fail);
		https.request.calls[0].respond('200', 'OK', 'Hi there');
	});
	it('rejects when the underlying request responds with 400', function (done) {
		underTest({}).then(done.fail, function (response) {
			expect(response.body).toEqual('Hi there');
		}).then(done);
		https.request.calls[0].respond('400', 'OK', 'Hi there');
	});
	it('rejects in case of a network error', function (done) {
		underTest({}).then(done.fail, function (err) {
			expect(err).toEqual('X');
		}).then(done);
		https.request.calls[0].networkError('X');
	});
	it('writes the body if provided', function () {
		underTest({body: 'XYZ'});
		expect(https.request.calls[0].body).toEqual(['XYZ']);
	});
	it('uses http for port 80 requests', function () {
		underTest({port: 80, body: 'XYZ'});
		expect(http.request.calls.length).toBe(1);
		expect(https.request.calls.length).toBe(0);
	});
	['GET', 'POST'].forEach(function (method) {
		describe(method + ' helper', function () {
			var helper;
			beforeEach(function () {
				helper = underTest[method.toLowerCase()];
			});
			it('rejects in case a url is not provided', function () {
				helper().catch(function (err) {
					expect(err instanceof TypeError).toBeTruthy();
				});
			});
			it('rejects in case method is overridden', function () {
				helper('https://npmjs.org', { method: 'PUT' }).catch(function (err) {
					expect(err instanceof Error).toBeTruthy();
				});
			});
			it('decomposes the URL into params', function (done) {
				https.request.pipe(function (args) {
					expect(args).toEqual(jasmine.objectContaining({
						method: method,
						hostname: 'npmjs.org',
						path: '/'
					}));
					done();
				});
				helper('https://npmjs.org');
			});
			it('resolves when the underlying request responds', function (done) {
				https.request.pipe(function () {
					this.respond('200', 'OK', 'Never Program Mad');
				});
				helper('https://npmjs.org').then(function (response) {
					expect(response.statusCode).toEqual('200');
					expect(response.statusMessage).toEqual('OK');
					expect(response.body).toEqual('Never Program Mad');
				}).then(done, done.fail);
			});
			it('allows options to override URL components', function (done) {
				https.request.pipe(function (args) {
					expect(args).toEqual(jasmine.objectContaining({
						method: method,
						hostname: 'npmjs.org',
						path: '/bing'
					}));
					done();
				});
				helper('https://npmjs.org', {path: '/bing'});
			});
			it('uses http for http protocol requests', function () {
				helper('http://npmjs.org').then(function () {
					expect(http.request.calls.length).toBe(1);
					expect(https.request.calls.length).toBe(0);
				});
			});
			it('passes the promise implementation to the request generator', function () {
				var FakeImplementation = function () {
						var self = this;
						self.resolve = function () {
							return this;
						};
						self.then = function () {
							return this;
						};
						self.catch = function () {
							return this;
						};
					},
					result;
				FakeImplementation.resolve = function () {
					return new FakeImplementation();
				};
				result = helper('https://npmjs.org', {}, FakeImplementation);
				expect(FakeImplementation.prototype.isPrototypeOf(result)).toBeTruthy();
			});
		});
	});
});
