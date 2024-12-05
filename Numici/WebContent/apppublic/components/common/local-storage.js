; (function() {
	'use strict';

	/**
 * Fallback in-memory store if `localStorage` is not read/writable.
 */
	class InMemoryStorage {
		constructor() {
			this._store = {};
		}

		getItem(key) {
			return (key in this._store) ? this._store[key] : null;
		}

		setItem(key, value) {
			this._store[key] = value;
		}

		removeItem(key) {
			delete this._store[key];
		}
	}


	angular.module("vdvcPublicApp").factory("localStorage", localStorage);
	localStorage.$inject = ['$window'];


	angular.module("vdvcPublicApp").factory("sessionStorage", sessionStorage);
	localStorage.$inject = ['$window'];

	function localStorage($window) {
		let storage;
		let testKey = 'numici.testKey';

		try {
			// Test whether we can read/write localStorage.
			storage = $window.localStorage;
			$window.localStorage.setItem(testKey, testKey);
			$window.localStorage.getItem(testKey);
			$window.localStorage.removeItem(testKey);
		} catch (e) {
			storage = new InMemoryStorage();
		}

		return {
			getItem(key) {
				return storage.getItem(key);
			},

			getObject(key) {
				var item = storage.getItem(key);
				return item ? JSON.parse(item) : null;
			},

			setItem(key, value) {
				storage.setItem(key, value);
			},

			setObject(key, value) {
				var repr = JSON.stringify(value);
				storage.setItem(key, repr);
			},

			removeItem(key) {
				storage.removeItem(key);
			},
		};
	}


	function sessionStorage($window) {
		let storage;
		let testKey = 'numici.testKey';

		try {
			// Test whether we can read/write localStorage.
			storage = $window.sessionStorage;
			$window.sessionStorage.setItem(testKey, testKey);
			$window.sessionStorage.getItem(testKey);
			$window.sessionStorage.removeItem(testKey);
		} catch (e) {
			storage = new InMemoryStorage();
		}

		return {
			getItem(key) {
				return storage.getItem(key);
			},

			getObject(key) {
				var item = storage.getItem(key);
				return item ? JSON.parse(item) : null;
			},

			setItem(key, value) {
				storage.setItem(key, value);
			},

			setObject(key, value) {
				var repr = JSON.stringify(value);
				storage.setItem(key, repr);
			},

			removeItem(key) {
				storage.removeItem(key);
			},
		};
	}
})();