/// <reference path="../../typings/jquery/jquery.d.ts"/>
/* global AuthenticationContext */
/// <reference path="../../typings/knockout/knockout.d.ts"/>
(function () {
    "use strict";

    var vm,
        config = {
            instance: 'https://login.microsoftonline.com/',
            tenant: 'common',
            clientId: '00000000-0000-0000-0000-000000000000',
            postLogoutRedirectUri: window.location.origin,
            // cacheLocation: 'localStorage', // enable this for IE, as sessionStorage does not work for localhost.
        },
        authContext;

    function ViewModel() {
        this.documents = ko.observableArray();
        this.isAuthenticated = ko.observable(false);
        this.user = ko.observable();
        this.siteTitle = ko.observable('');
        this.error = ko.observable('');
        this.loading = ko.observable(false);
        this.finishedLoading = ko.observable(false);
        this.login = function () {
            authContext.login();
        };
        this.getSiteTitle = function () {
            this.loading(true);
            this.finishedLoading(false);
            this.error('');

            var vm = this;

            _getSiteTitle().then(function(siteTitle) {
                vm.siteTitle(siteTitle);
            }, function(err) {
                vm.error(err);
            }).always(function() {
                vm.loading(false);
                vm.finishedLoading(true);
            });
        };
    }

    function getTenantUrl(accessToken) {
        var deferred = $.Deferred();
        
        $.ajax({
            url: '/api/discovery',
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        }).then(function(data) {
            if (data.tenantUrl) {
                deferred.resolve(data.tenantUrl);
            }
            else {
                deferred.reject('Could not get tenant URL');
            }
        }, function(err) {
           deferred.reject(err); 
        });

        return deferred;
    }

    function _getSiteTitle() {
        var deferred = $.Deferred();

        getTenantUrl(authContext.getCachedToken(vm.user().profile.aud)).then(function (tenantUrl) {
            authContext.acquireToken(tenantUrl, function (error, token) {
                // Handle ADAL Error
                if (error || !token) {
                    deferred.reject('ADAL Error Occurred: ' + error);
                    return;
                }

                $.ajax({
                    url: tenantUrl + '_api/web/title',
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json;odata=nometadata',
                        'Authorization': 'Bearer ' + token,
                    }
                }).success(function (data) {
                    deferred.resolve(data.value);
                }).error(function (err) {
                    deferred.reject(err);
                });
            });
        }, function (err) {
            deferred.reject(err);
        }, function(err) {
            deferred.reject(err);
        });

        return deferred.promise();
    }

    function init() {
        authContext = new AuthenticationContext(config);
        vm = new ViewModel();

        var isCallback = authContext.isCallback(window.location.hash);
        authContext.handleWindowCallback();
        var errorMessage = authContext.getLoginError();
        if (errorMessage) {
            vm.error(errorMessage);
        }

        if (isCallback && !authContext.getLoginError()) {
            window.location = authContext._getItem(authContext.CONSTANTS.STORAGE.LOGIN_REQUEST);
        }
        
        vm.user(authContext.getCachedUser());
        vm.isAuthenticated(vm.user() !== null && typeof (vm.user()) !== 'undefined');
        ko.applyBindings(vm);
    }

    init();
})();