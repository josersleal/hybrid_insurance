/**
 * ForceNG - REST toolkit for Salesforce.com
 * Author: Christophe Coenraets @ccoenraets
 * Version: 0.6.1
 */
angular.module('forceng', [])

.factory('force', function ($rootScope, $q, $window, $http) {

    // The login URL for the OAuth process
    // To override default, pass loginURL in init(props)
    var loginURL = 'https://login.salesforce.com',

        // The Connected App client Id. Default app id provided - Not for production use.
        // This application supports http://localhost:8200/oauthcallback.html as a valid callback URL
        // To override default, pass appId in init(props)
        appId = '3MVG9fMtCkV6eLheIEZplMqWfnGlf3Y.BcWdOf1qytXo9zxgbsrUbS.ExHTgUPJeb3jZeT8NYhc.hMyznKU92',

        // The force.com API version to use.
        // To override default, pass apiVersion in init(props)
        apiVersion = 'v33.0',

        // Keep track of OAuth data (access_token, refresh_token, and instance_url)
        oauth,

        // By default we store fbtoken in sessionStorage. This can be overridden in init()
        tokenStore = {},

        // if page URL is http://localhost:3000/myapp/index.html, context is /myapp
        context = window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/")),

        // if page URL is http://localhost:3000/myapp/index.html, serverURL is http://localhost:3000
        serverURL = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : ''),

        // if page URL is http://localhost:3000/myapp/index.html, baseURL is http://localhost:3000/myapp
        baseURL = serverURL + context,

        // Only required when using REST APIs in an app hosted on your own server to avoid cross domain policy issues
        // To override default, pass proxyURL in init(props)
        proxyURL = baseURL,

        // if page URL is http://localhost:3000/myapp/index.html, oauthCallbackURL is http://localhost:3000/myapp/oauthcallback.html
        // To override default, pass oauthCallbackURL in init(props)
        oauthCallbackURL = baseURL + '/oauthcallback.html',

        // Because the OAuth login spans multiple processes, we need to keep the login success and error handlers as a variables
        // inside the module instead of keeping them local within the login function.
        deferredLogin,

        // Reference to the Salesforce OAuth plugin
        oauthPlugin,

        // Whether or not to use a CORS proxy. Defaults to false if app running in Cordova or in a VF page
        // Can be overriden in init()
        useProxy = (window.cordova || window.SfdcApp) ? false : true;

    /*
     * Determines the request base URL.
     */
    function getRequestBaseURL() {

        var url;

        if (useProxy) {
            url = proxyURL;
        } else if (oauth.instance_url) {
            url = oauth.instance_url;
        } else {
            url = serverURL;
        }

        // dev friendly API: Remove trailing '/' if any so url + path concat always works
        if (url.slice(-1) === '/') {
            url = url.slice(0, -1);
        }

        return url;
    }

    function parseQueryString(queryString) {
        var qs = decodeURIComponent(queryString),
            obj = {},
            params = qs.split('&');
        params.forEach(function (param) {
            var splitter = param.split('=');
            obj[splitter[0]] = splitter[1];
        });
        return obj;
    }

    function toQueryString(obj) {
        var parts = [],
            i;
        for (i in obj) {
            if (obj.hasOwnProperty(i)) {
                parts.push(encodeURIComponent(i) + "=" + encodeURIComponent(obj[i]));
            }
        }
        return parts.join("&");
    }

    function refreshTokenWithPlugin(deferred) {
        oauthPlugin.authenticate(
            function (response) {
                oauth.access_token = response.accessToken;
                tokenStore.forceOAuth = JSON.stringify(oauth);
                deferred.resolve();
            },
            function () {
                console.log('Error refreshing oauth access token using the oauth plugin');
                deferred.reject();
            });
    }

    function refreshTokenWithHTTPRequest(deferred) {
        var params = {
                'grant_type': 'refresh_token',
                'refresh_token': oauth.refresh_token,
                'client_id': appId
            },

            headers = {},

            url = useProxy ? proxyURL : loginURL;

        // dev friendly API: Remove trailing '/' if any so url + path concat always works
        if (url.slice(-1) === '/') {
            url = url.slice(0, -1);
        }

        url = url + '/services/oauth2/token?' + toQueryString(params);

        if (!useProxy) {
            headers["Target-URL"] = loginURL;
        }

        $http({
                headers: headers,
                method: 'POST',
                url: url,
                params: params
            })
            .success(function (data, status, headers, config) {
                console.log('Token refreshed');
                oauth.access_token = data.access_token;
                tokenStore.forceOAuth = JSON.stringify(oauth);
                deferred.resolve();
            })
            .error(function (data, status, headers, config) {
                console.log('Error while trying to refresh token');
                deferred.reject();
            });
    }

    function refreshToken() {
        var deferred = $q.defer();
        if (oauthPlugin) {
            refreshTokenWithPlugin(deferred);
        } else {
            refreshTokenWithHTTPRequest(deferred);
        }
        return deferred.promise;
    }

    /**
     * Initialize ForceNG
     * @param params
     *  appId (optional)
     *  loginURL (optional)
     *  proxyURL (optional)
     *  oauthCallbackURL (optional)
     *  apiVersion (optional)
     *  accessToken (optional)
     *  instanceURL (optional)
     *  refreshToken (optional)
     */
    function init(params) {

        if (params) {
            appId = params.appId || appId;
            apiVersion = params.apiVersion || apiVersion;
            loginURL = params.loginURL || loginURL;
            oauthCallbackURL = params.oauthCallbackURL || oauthCallbackURL;
            proxyURL = params.proxyURL || proxyURL;
            useProxy = params.useProxy === undefined ? useProxy : params.useProxy;

            if (params.accessToken) {
                if (!oauth) oauth = {};
                oauth.access_token = params.accessToken;
            }

            if (params.instanceURL) {
                if (!oauth) oauth = {};
                oauth.instance_url = params.instanceURL;
            }

            if (params.refreshToken) {
                if (!oauth) oauth = {};
                oauth.refresh_token = params.refreshToken;
            }
            if(params.id){
            	if (!oauth) oauth = {};
                oauth.id = params.id;
            }
            
        }

        console.log("useProxy: " + useProxy);
    }

    /**
     * Discard the OAuth access_token. Use this function to test the refresh token workflow.
     */
    function discardToken() {
        delete oauth.access_token;
        tokenStore.forceOAuth = JSON.stringify(oauth);
    }

    /**
     * Called internally either by oauthcallback.html (when the app is running the browser)
     * @param url - The oauthCallbackURL called by Salesforce at the end of the OAuth workflow. Includes the access_token in the querystring
     */
    function oauthCallback(url) {

        // Parse the OAuth data received from Facebook
        var queryString,
            obj;

        if (url.indexOf("access_token=") > 0) {
            queryString = url.substr(url.indexOf('#') + 1);
            obj = parseQueryString(queryString);
            oauth = obj;
            tokenStore['forceOAuth'] = JSON.stringify(oauth);
            if (deferredLogin) deferredLogin.resolve();
        } else if (url.indexOf("error=") > 0) {
            queryString = decodeURIComponent(url.substring(url.indexOf('?') + 1));
            obj = parseQueryString(queryString);
            if (deferredLogin) deferredLogin.reject(obj);
        } else {
            if (deferredLogin) deferredLogin.reject({
                status: 'access_denied'
            });
        }
    }

    /**
     * Login to Salesforce using OAuth. If running in a Browser, the OAuth workflow happens in a a popup window.
     */
    function login() {
        deferredLogin = $q.defer();
        if (window.cordova) {
            loginWithPlugin();
        } else {
            loginWithBrowser();
        }
        return deferredLogin.promise;
    }

    function loginWithPlugin() {
        document.addEventListener("deviceready", function () {
        	console.log("deviceready");
            oauthPlugin = cordova.require("com.salesforce.plugin.oauth");
            if (!oauthPlugin) {
                console.error('Salesforce Mobile SDK OAuth plugin not available');
                if (deferredLogin) deferredLogin.reject({
                    status: 'Salesforce Mobile SDK OAuth plugin not available'
                });
                return;
            }
//            alert("getAuthCredentials");
            oauthPlugin.getAuthCredentials(
                function (creds) {
                	var credsJson = JSON.stringify(creds);
//                	alert("creds: " +credsJson)
                	// TODO move to service and inject
                	// Register for
					// mobile
					// notifications
//					alert("requiring: com.salesforce.util.push");
					var pushNotification = cordova.require("com.salesforce.util.push");
//					alert("required: com.salesforce.util.push");
					if (!pushNotification) {
						alert("com.salesforce.util.push not present!");
						console.log("com.salesforce.util.push not present!");
					}
//					alert("going: registerPushNotificationHandler")
					pushNotification.registerPushNotificationHandler (	
						// sucess
						function(message) {
//							alert("in: registerPushNotificationHandler");
							var messageStringed = JSON.stringify(message);
//							alert('messageStringed: ' + messageStringed);
							var messages = "";
							try{
								var payload = message["payload"];
//								alert('payload.message: ' + payload.message);
								console.log('payload.message:' + payload.message);
							
								messages = payload.message.split(';');
								console.log('messages splited: ' + messages);
//								
//								for(var index=0; index<messages.length; index++) {
//									alert('item in messages: ' + messages[index]);
//								}
							}catch(error){
								alert('error-forceng.registerPushNotificationHandler payload: ' + error);
								console.log("error-forceng.registerPushNotificationHandler payload: " + error);
							}
							
							if(messages[0] === "campaign"){
								console.log("process campaign");
//								var campaign = "";
//								for(var index=1; index<messages.length; index++) {
//									campaign = campaign + messages[index] + "\n";
//									// TODO alert properly??
//									alert('campaign: ' + campaign);
//								}
//								alert(campaign);

								alert("Offer: " + messages[1] + '-' + messages[2]);
							}
							
							if(messages[0] === "tip"){
								console.log("process tip");
//								var tip = "";
//								for(var index=1; index<messages.length; index++) {
//									tip = tip + messages[index] + "\n";
//									alert('tip: ' + tip);
//								}
//								alert(tip);
								alert("tip: " + messages[1] );
							}
							
							if(messages[0] === "calendar"){
								console.log("process calendar");
								var title = trim(messages[1].slice(indexOf("|" + 1)));
								var startDate = trim(messages[2].slice(indexOf("|" + 1)));
//								alert('startDate: ' + startDate);
								var sd = Date.parse(startDate);
//								alert('Date.parse(startDate: ' + sd);
								var endDate = trim(messages[3].slice(indexOf("|" + 1)));
//								alert('endDate: ' + endDate);
								var ed = Date.parse(endDate);
//								alert('Date.parse(endDate: ' + ed);
								var reminderDateTime = trim(messages[4].slice(indexOf("|" + 1)));
								var notes = trim(messages[5].slice(indexOf("|" + 1)));
								var location = trim(messages[6].slice(indexOf("|" + 1)));
								var success = function(message) { alert("Success htCordova.createEvent: " + JSON.stringify(message)); };
								var error = function(message) { alert("Error htCordova.createEvent: " + message); };

								alert("Calendar event: " + 
									title + " - " + 
									'Start Date: ' + startDate  + " - " + 
									'End Date: ' + endDate  + " - " +
									'Notes: ' + notes   + " - " +
									'Location: ' + location);
								/*
								alert("title: " + title);
								htCordova.createEvent({
								    title: title,
								    location: location,
								    notes: notes,
								    startDate: new Date(2015, 0, 6, 18, 30, 0, 0, 0),
								    endDate: new Date(2015, 1, 6, 12, 0, 0, 0, 0)
								  }).then(success, error);
								*/
//								var calendar = "";
//								for(var index=1; index<messages.length; index++) {
//									calendar += messages[index] + "\n";
//									alert('calendar: ' + calendar);
//								}
//								alert(calendar);
							}
//							// foreground
//							if (message["foreground"]) {
//								alert("foreground notification: " + payload);
//								console.log("foreground notification: " + payload);
//							}
//							// background
//							if (!message["foreground"]) {
//								console.log("background notification: " + payload);
//								alert("background notification: " + payload);
//							}
						},
						// Error
						function(error) {
							alert("error push notification: " + error);
							console.log("error push notification: " + error);
						}
					);
                    // Initialize ForceJS
					// modified because getuserid is not working with plugin
                    init({
                        accessToken: creds.accessToken,
                        instanceURL: creds.instanceUrl,
                        refreshToken: creds.refreshToken,
                        id: creds.userId
                    });
                    if (deferredLogin) deferredLogin.resolve();
                },
                function (error) {
                    console.log(error);
                    if (deferredLogin) deferredLogin.reject(error);
                }
            );
        }, false);
    }

    function loginWithBrowser() {
        console.log('loginURL: ' + loginURL);
        console.log('oauthCallbackURL: ' + oauthCallbackURL);
        var loginWindowURL = loginURL + '/services/oauth2/authorize?client_id=' + appId + '&redirect_uri=' +
            oauthCallbackURL + '&response_type=token';
        window.open(loginWindowURL, '_blank', 'location=no');
    }

    /**
     * Gets the user's ID (if logged in)
     * @returns {string} | undefined
     */
    function getUserId() {
//    	alert("getUserId");
//    	var oj = JSON.stringify(oauth);
//    	alert(oj);
//    	alert("oauth.id: " + oauth.id );
        return (typeof (oauth) !== 'undefined') ? oauth.id.split('/').pop() : undefined;
    }

    /**
     * Check the login status
     * @returns {boolean}	
     */
    function isAuthenticated() {
//    	alert("isAuthenticated");
//    	var oj = JSON.stringify(oauth);
//    	alert(oj);
        return (oauth && oauth.access_token) ? true : false;
    }

    /**
     * Lets you make any Salesforce REST API request.
     * @param obj - Request configuration object. Can include:
     *  method:  HTTP method: GET, POST, etc. Optional - Default is 'GET'
     *  path:    path in to the Salesforce endpoint - Required
     *  params:  queryString parameters as a map - Optional
     *  data:  JSON object to send in the request body - Optional
     */
    function request(obj) {

        var method = obj.method || 'GET',
            headers = {},
            url = getRequestBaseURL(),
            deferred = $q.defer();

        if (!oauth || (!oauth.access_token && !oauth.refresh_token)) {
            deferred.reject('No access token. Login and try again.');
            return deferred.promise;
        }

        // dev friendly API: Add leading '/' if missing so url + path concat always works
        if (obj.path.charAt(0) !== '/') {
            obj.path = '/' + obj.path;
        }

        url = url + obj.path;

        headers["Authorization"] = "Bearer " + oauth.access_token;
        if (obj.contentType) {
            headers["Content-Type"] = obj.contentType;
        }
        if (useProxy) {
            headers["Target-URL"] = oauth.instance_url;
        }

        $http({
                headers: headers,
                method: method,
                url: url,
                params: obj.params,
                data: obj.data
            })
            .success(function (data, status, headers, config) {
                deferred.resolve(data);
            })
            .error(function (data, status, headers, config) {
                if (status === 401 && oauth.refresh_token) {
                    refreshToken()
                        .success(function () {
                            // Try again with the new token
                            request(obj);
                        })
                        .error(function () {
                            console.error(data);
                            deferred.reject(data);
                        });
                } else {
                    console.error(data);
                    deferred.reject(data);
                }

            });

        return deferred.promise;
    }

    /**
     * Execute SOQL query
     * @param soql
     * @returns {*}
     */
    function query(soql) {

        return request({
            path: '/services/data/' + apiVersion + '/query',
            params: {
                q: soql
            }
        });

    }

    /**
     * Retrieve a record based on its Id
     * @param objectName
     * @param id
     * @param fields
     * @returns {*}
     */
    function retrieve(objectName, id, fields) {

        return request({
            path: '/services/data/' + apiVersion + '/sobjects/' + objectName + '/' + id,
            params: fields ? {
                fields: fields
            } : undefined
        });

    }

    /**
     * Create a record
     * @param objectName
     * @param data
     * @returns {*}
     */
    function create(objectName, data) {

        return request({
            method: 'POST',
            contentType: 'application/json',
            path: '/services/data/' + apiVersion + '/sobjects/' + objectName + '/',
            data: data
        });

    }

    /**
     * Update a record
     * @param objectName
     * @param data
     * @returns {*}
     */
    function update(objectName, data) {

        var id = data.Id,
            fields = angular.copy(data);

        delete fields.attributes;
        delete fields.Id;

        return request({
            method: 'POST',
            contentType: 'application/json',
            path: '/services/data/' + apiVersion + '/sobjects/' + objectName + '/' + id,
            params: {
                '_HttpMethod': 'PATCH'
            },
            data: fields
        });

    }

    /**
     * Delete a record
     * @param objectName
     * @param id
     * @returns {*}
     */
    function del(objectName, id) {

        return request({
            method: 'DELETE',
            path: '/services/data/' + apiVersion + '/sobjects/' + objectName + '/' + id
        });

    }

    /**
     * Upsert a record
     * @param objectName
     * @param externalIdField
     * @param externalId
     * @param data
     * @returns {*}
     */
    function upsert(objectName, externalIdField, externalId, data) {

        return request({
            method: 'PATCH',
            contentType: 'application/json',
            path: '/services/data/' + apiVersion + '/sobjects/' + objectName + '/' + externalIdField + '/' + externalId,
            data: data
        });

    }

    /**
     * Convenience function to invoke APEX REST endpoints
     * @param pathOrParams
     * @param successHandler
     * @param errorHandler
     */
    function apexrest(pathOrParams) {

        var params;

        if (pathOrParams.substring) {
            params = {
                path: pathOrParams
            };
        } else {
            params = pathOrParams;

            if (params.path.charAt(0) !== "/") {
                params.path = "/" + params.path;
            }

            if (params.path.substr(0, 18) !== "/services/apexrest") {
                params.path = "/services/apexrest" + params.path;
            }
        }

        return request(params);
    }

    /**
     * Convenience function to invoke the Chatter API
     * @param params
     * @param successHandler
     * @param errorHandler
     */
    function chatter(params) {

        var base = "/services/data/" + apiVersion + "/chatter";

        if (!params || !params.path) {
            errorHandler("You must specify a path for the request");
            return;
        }

        if (params.path.charAt(0) !== "/") {
            params.path = "/" + params.path;
        }

        params.path = base + params.path;

        return request(params);

    }

    // The public API
    return {
        init: init,
        login: login,
        getUserId: getUserId,
        isAuthenticated: isAuthenticated,
        request: request,
        query: query,
        create: create,
        update: update,
        del: del,
        upsert: upsert,
        retrieve: retrieve,
        apexrest: apexrest,
        chatter: chatter,
        discardToken: discardToken,
        oauthCallback: oauthCallback
    };

});

// Global function called back by the OAuth login dialog
function oauthCallback(url) {
    var injector = angular.element(document.body).injector();
    injector.invoke(function (force) {
        force.oauthCallback(url);
    });
}
