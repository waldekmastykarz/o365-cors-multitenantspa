/* global process */
var config = {
    clientId: '00000000-0000-0000-0000-000000000000',  
    clientSecret: 'secret',
    port: process.env.PORT || 8080,
    appRootUrl: null
};    
    
if (process.env.WEBSITE_SITE_NAME) {
    config.appRootUrl = 'https://' + process.env.WEBSITE_SITE_NAME + '.azurewebsites.net';
}
else {
    config.appRootUrl = 'http://localhost:' + config.port;
}

module.exports = config;