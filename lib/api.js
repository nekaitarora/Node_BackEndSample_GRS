
/**
 * api.js
 *
 *  @desc api's task  defined here.
 *  @module Lib:Api
 *  @requires request
 *  @requires q
 *  @ requires config
 *
*/
var request = require('request'),
Q = require('q'),
config = require('../config');
get = Q.nbind(request.get, request),
put = Q.nbind(request.put, request),
post = Q.nbind(request.post, request) ;
del = Q.nbind(request.del, request) ;

module.exports = {
    /**
     *  @function
     *  @name Lib:Api.get
     *  @param {object} endpoint
     *  @param {string} token
     *  @param { object} qs
     *  @param {object} currentUser
     *  @return { object} data
     *  @desc -<p> Http method-get, It check the user type. if not admin checks and assign country value
     *  <br> and return the data value by parsing into JSON object</p>
     *
    */
    get: function (endpoint, token, qs, currentUser) {
        //console.log(config.api + endpoint);
        var options = {};

        if (!endpoint) {
            throw new Error('endpoint is required!');
        }

        if (endpoint) {
            options.url = config.api + endpoint;
        }
        if (token) {
            options.headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        };
        }

        if (qs) {
            options.qs = qs ;
        }


        console.log(currentUser);
        if (currentUser && currentUser.category != 'admin' && currentUser.countries.indexOf('all') == -1) {
            options.qs = options.qs || {} ;
            var countryField = 'country' ;
            if (endpoint == '/projects') {
                countryField = '_country' ;
            }

            options.qs.search = options.qs.search || {} ;
            options.qs.search[countryField] = {
                $in: currentUser.countries
            } ;
            console.log(options.qs);
        }

        return get(options)
        .spread(function (res, data) {
            try {
                return JSON.parse(data);
            } catch (e) {
                console.error('invalid JSON string');
                throw new Error('invalid JSON string');
            }
        });
    },

    /**
     *   @function
     *   @name Lib:Api.post
     *   @param {object} endpoint
     *   @param {string} token
     *   @param { object} form
     *   @return { object} data
     *   @desc -<p> It checks that endpoint is available or not, if not available show error otherwise token values set
     *   <br> and return the data value by parsing into JSON object, after setting the status code</p>
     *
    */
    post: function (endpoint, form, token) {
        var options = {} ;
        if (!endpoint) {
            throw new Error('endpoint is required!');
        }

        if (endpoint) {
            options.url = config.api + endpoint;
        }
        if (token) {
            options.headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        };
        }

        options.form = form ;

        return post(options)
        .spread(function (res, data) {
            try {
                data = JSON.parse(data) ;
                data.statusCode = res.statusCode ;
                return data ;
            } catch (e) {
                console.error('invalid JSON string');
                throw new Error('invalid JSON string');
            }
        });
    },

    /**
     *  @function
     *  @name Lib:Api.del
     *  @param {object} endpoint
     *  @param {string} token
     *  @param { object} form
     *  @return { object} data
     *  @desc -It checks that endpoint is available or not, if not available show error otherwise token values are
     *  <br> set. After that method and form values are set and return the data object</p>
     *
    */

    del: function (endpoint, form, token) {

        var options = {} ;
        if (!endpoint) {
            throw new Error('endpoint is required!');
        }

        if (endpoint) {
            options.url = config.api + endpoint;
        }
        if (token) {
            options.headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        };
        }

        options.method = 'DELETE' ;

        options.form = form ;

        return del(options)
        .spread(function (res, data) {
            return data ;
        });
    },

    /**
     *  @function
     *  @name Lib:Api.put
     *  @param {object} endpoint
     *  @param {string} token
     *  @param { object} form
     *  @return { object} data
     *  @desc -It checks that endpoint is available or not, if not available show error otherwise token values are
     *  <br> set. After that form values are set and return the data object. Error handilg also performed</p>
     *
    */

    put: function (endpoint, form, token) {
        var options = { headers: {} } ;
        if (!endpoint) {
            throw new Error('endpoint is required!');
        }

        if (endpoint) {
            options.url = config.api + endpoint;
        }
        if (token) {
            options.headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        };
        }

        options.headers['globalrockstar-backend'] = "1" ;

        options.form = form ;

        return put(options)
        .spread(function (res, data) {
            try {
                data = JSON.parse(data) ;
                data.statusCode = res.statusCode ;
                return data ;
            } catch (e) {
                console.error('invalid JSON string');
                throw new Error('invalid JSON string');
            }
        });
    }
};
