/*global beforeEach, afterEach, describe, it, expect, require */
var fakeRequest = require('fake-http-request'),
	underTest = require('../index'),
	https = require('https');
describe('Minimal Request Promise', function () {
	'use strict';
	beforeEach(function () {
		fakeRequest.install();
	});
	afterEach(function () {
		fakeRequest.uninstall();
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
});
describe('Minimal Request Promise Get method', function () {
	'use strict';
	beforeEach(function () {
		fakeRequest.install();
	});
	afterEach(function () {
		fakeRequest.uninstall();
	});
	it('rejects in case url is not provided', function() {
		underTest.get().catch(function(err) {
			expect(err instanceof TypeError).toBeTruthy();
		});
	});
	it('resolves when the underlying request responds', function (done) {
		underTest.get('https://npmjs.org').then(function (response) {
			expect(response.statusCode).toEqual('200');
			expect(response.statusMessage).toEqual('OK');
			expect(response.body).toEqual('Never Program Mad');
		}).then(done);
		setTimeout(function () {
			https.request.calls[0].respond('200', 'OK', 'Never Program Mad');
		}, 100);
	});
});
describe('Minimal Request Promise POST method', function () {
	'use strict';
	beforeEach(function () {
		fakeRequest.install();
	});
	afterEach(function () {
		fakeRequest.uninstall();
	});
	it('rejects in case url is not provided', function() {
		underTest.post().catch(function(err) {
			expect(err instanceof TypeError).toBeTruthy();
		});
	});
	it('resolves when the underlying request responds', function (done) {
		underTest.post('https://npmjs.org', { body: 'test' }).then(function (response) {
			expect(response.statusCode).toEqual('200');
			expect(response.statusMessage).toEqual('OK');
			expect(response.body).toEqual('Never Program Mad');
		}).then(done);
		setTimeout(function () {
			https.request.calls[0].respond('200', 'OK', 'Never Program Mad');
		}, 100);
	});
});
