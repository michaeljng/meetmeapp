angular.module('meetme.services', [])
	
	.factory('ParseService', function ($http) {

		var headers = {	"X-Parse-Application-Id": "EvhQWhNkOQrt9FOkJaEAe3tX5qJDfq7K8NMMnpd8",
       					"X-Parse-REST-API-Key": "GPHw7mJbToX9Tyw7suXilsbkoUoSKN7wpXuTUqJK"}

		return {

			get: function(className, params, completion) {
				$http({
					method: 'GET',
					url: 'https://api.parse.com/1/classes/' + className,
					params: {"where" : params},
					headers: headers
				}).then( function successCallback(response) {
			        // console.log(JSON.stringify(response));
			    	completion(response.data.results);
			    }, function errorCallback(response) {
			    // called asynchronously if an error occurs
			    // or server returns response with an error status.
			    });
			},

			create: function(className, object) {
				$http({
					method: 'POST',
					url: 'https://api.parse.com/1/classes/' + className,
					data: object,
					headers: headers
				});
			},

			update: function(className, id, params) {
				$http({
					method: 'PUT',
					url: 'https://api.parse.com/1/classes/' + className + '/' + id,
					data: params,
					headers: headers
				});
			}


		}

	});