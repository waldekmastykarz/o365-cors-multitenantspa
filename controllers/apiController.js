var express = require('express'),
    router = express.Router(),
    config = require('../config'),
    https = require('https'),
    Q = require('q'),
    querystring = require('querystring');

router.get('/discovery',
    function (req, res) {
        var accessToken = req.get('Authorization');
        if (accessToken.indexOf('Bearer ') === 0) {
            accessToken = accessToken.substr(7);
            
            getDiscoveryServiceAccessToken(accessToken).then(function(discoveryServiceAccessToken) {
                getTenantUrl(discoveryServiceAccessToken).then(function(_tenantUrl) {
                    res.set('Content-Type', 'application/json');
                    res.send({ tenantUrl: _tenantUrl });
                }, function(err) {
                    console.error(err);
                    res.status(400).send('Discovery failed');
                }).done();
            }, function(err) {
                console.error(err);
                res.status(400).send('Discovery failed');
            }).done();
        }
        else {
            res.status(400).send('Invalid token');
        }
    });

function getDiscoveryServiceAccessToken(loginAccessToken) {
    var deferred = Q.defer();
    
    var payload = querystring.stringify({
        'resource': 'https://api.office.com/discovery/',
        'client_id': config.clientId,
        'client_secret': config.clientSecret,
        'grant_type': 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        'assertion': loginAccessToken,
        'requested_token_use': 'on_behalf_of',
        'scope': 'openid'
    });
    
    var postRequest = https.request({
        method: 'POST',
        hostname: 'login.microsoftonline.com',
        path: '/common/oauth2/token',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': payload.length
        },
        secureOptions: require('constants').SSL_OP_NO_TLSv1_2,
        ciphers: 'ECDHE-RSA-AES256-SHA:AES256-SHA:RC4-SHA:RC4:HIGH:!MD5:!aNULL:!EDH:!AESGCM',
        honorCipherOrder: true
    }, function(res) {
        var body = "";
        res.on("data", function (chunk) {
            body += chunk;
        });
        res.on("end", function () {
            try {
                var d = JSON.parse(body);

                if (d && d.access_token) {
                    deferred.resolve(d.access_token);
                }
                else {
                    deferred.reject('Unable to exchange login access token for Discovery Service access token');
                }
            }
            catch (ex) {
                deferred.reject(ex);
            }
        });
    }).on("error", function (err) {
        deferred.reject(err);
    });
    
    postRequest.write(payload);
    postRequest.end();
    
    return deferred.promise;
}

function getTenantUrl(accessToken) {
    var deferred = Q.defer();

    https.get({
        hostname: 'api.office.com',
        path: "/discovery/v1.0/me/services('RootSite@O365_SHAREPOINT')?$select=serviceResourceId",
        headers: {
            "Authorization": "Bearer " + accessToken,
            "Accept": "application/json"
        },
        secureOptions: require('constants').SSL_OP_NO_TLSv1_2,
        ciphers: 'ECDHE-RSA-AES256-SHA:AES256-SHA:RC4-SHA:RC4:HIGH:!MD5:!aNULL:!EDH:!AESGCM',
        honorCipherOrder: true
    }, function (res) {
        var body = "";
        res.on("data", function (chunk) {
            body += chunk;
        });
        res.on("end", function () {
            try {
                var serviceInfo = JSON.parse(body);

                if (serviceInfo && serviceInfo.serviceResourceId) {
                    deferred.resolve(serviceInfo.serviceResourceId);
                }
                else {
                    deferred.reject('Invalid response from Discovery Service');
                }
            }
            catch (ex) {
                deferred.reject(ex);
            }
        });
    }).on("error", function (err) {
        deferred.reject(err);
    });
    
    return deferred.promise;
}

module.exports = router;