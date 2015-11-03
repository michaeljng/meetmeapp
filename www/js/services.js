angular.module('meetme.services', [])

	.factory('LoginService', function ($http) {

		return {

			login: function(username, password) {
				return 18; // dummy login
			}

		}
	})