angular.module('config', [])

.constant('forcengOptions', {
    /*The Salesforce Connected App Id.For convenience, ForceNG uses a default connected app if the appId is not provided.
    The default connected app supports http: //localhost:8200/oauthcallback.html as the OAuth callback URL to provide 
    an out-of-the-box development experience using force-server. 
    You need to create your own connected app with your own OAuth callback URL 
    to run your application on a different server and port.*/
    appId: '3MVG98_Psg5cppybihE9t2iynHTIq7MJFTcByyjZiDucSit7KvUBJduwlMkWHZ7eqMEU4nYinoMyjdVCwMx0i',
    //    The URL Salesforce calls back with an authenticated access token (or an error) at the end of the OAuth authentication workflow.
    //
    //Default: The base URL the application was loaded from. For example, if you load the app from http://localhost:8200, the default OAuth callback URL is http://localhost:8200/oauthcallback.html. If you load the app from https://myserver.com/myapp, the default OAuth callback URL is https://myserver.com/myapp/oauthcallback.html
    oauthCallbackURL: 'healthtracker:///mobilesdk/detect/oauth/done',
    loginURL: 'https://login.salesforce.com',

    apiVersion: 'v35.0'
})

// baseURL should be left to empty string. This value is only used when you want to use the same app in a Visualforce
// page where you have to account for the path to the static resource. In that case the config module is created from
// within index.vf where the path to the static resource can be obtained.
.constant('baseURL', '');
