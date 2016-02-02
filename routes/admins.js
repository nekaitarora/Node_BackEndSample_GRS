/**
 *  admins.js
 *
 *  @desc Admin work defined here.
 *  @module Routes:Admins
 *  @requires hapi.
 *  @requires q
 *  @requires lodash
 *  @requires admin
 *  @requires api
 *  @requires moment
*/

var Hapi = require('hapi'),
Q = require('q'),
_ = require('lodash'),
Admin = require('../models/admin') ;
api = require('../lib/api') ;
moment = require('moment');

var findAdmin = Q.nbind(Admin.findOne, Admin);

/**
 *  The module provides routes for admin.
 *  @exports Admins-Route
*/
module.exports = function (server) {

    server.route([
        {

            /**
             *  @event
             *  @name Routes:Admins.get
             *  @description <p>path: /admins</p>
             *  <p><b>operations: Sort by the request parameter or by creation date</b></p>
             *  @desc handler - Handler object that is processing the request.
             *  @param{object} request Request Object
             *  @param{object} res response object
             *  @desc A query is executed on model Admin using find and sort method.
             *  A view is being rendered after the query.
             *  <p><b>Path for view</b></p>
             *`<p>admin/index</p>
             *
            */

            method: 'GET',
            path: '/admins',
            config: { auth: true },
            handler: function (request, res) {
                var sortBy = request.query.sort || 'createdAt' ;
                Admin.find({}).sort(sortBy).exec(function (err, admins) {
                    res.view('admins/index', {
                        title: 'Administrators',
                        admins: admins,

                        moment: moment,
                        sort: sortBy
                    }) ;
                }) ;
            }
        },
        {
            /**
             *  @event
             *  @name Routes:Admins.new
             *  @description <p>path: /admins/new</p>
             *  @desc handler - Handler object that is processing the request.
             *  @param{object} request Request Object
             *  @param{object} res response object
             *  <p> summary: It will render a view having path "admins/new" if everything right<br>
             *  ,otherwise it will log an error.
             *  </p>
             *
            */

            method: 'GET',
            path: '/admins/new',
            config: { auth: true },
            handler: function (request, res) {
                api.get('/config/countries')
                .then(function (countries) {
                    res.view('admins/new', {
                        admin: {},
                        countries: countries,
                        title: 'New Admin'
                    }) ;
                })
                .fail(console.error.bind(console));
            }
        },
        {

            /**
             *  @event
             *  @name Routes:Admins.post
             *  @description <p>path: /admins</p>
             *  <p><b>operations: Registration into admin model</b></p>
             *  @desc handler - Handler object that is processing the request.
             *  @param{object} request Request Object
             *  @param{object} res response object
             *  A view is being rendered after the query.
             *  <p><b>Path for view</b></p>
             *  <p>admins/new</p>
             *
            */

            method: 'POST',
            path: '/admins',
            config: { auth: true },

            handler: function (request, res) {
                var admin = new Admin(request.payload) ;
                Admin.register(admin, request.payload.password, function (err, user) {
                    if (err) {
                        return api.get('/config/countries')
                      .then(function (countries) {
                          res.view('admins/new', { admin: admin, countries: countries, title: "New Admin", errors: err }) ;
                      }) ;
                    }

                    res().redirect('/admins') ;
                }) ;
            }
        },

        {

            /**
             *  @event
             *  @name Routes:Admins.save
             *  @description <p>path: /admins/{id}</p>
             *  @desc id-object id
             *  <p><b>operations:fetching a single data</b></p>
             *  @desc handler - Handler object that is processing the request.
             *  @param{object} request Request Object
             *  @param{object} res response object
             *  @function
             *  @name admin.save
             *  @desc Save the data in admin model and render to a new page
             *  <p><b>Path for new page</b></p>
             *  <p>/admins</p>
             *
            */

            method: 'POST',
            path: '/admins/{id}',
            config: { auth: true },

            handler: function (request, reply) {
                console.log(request.payload.country) ;
                Admin.findOne({_id: request.params.id}, function (err, admin) {
                    if (err) {
                        return reply(err) ;
                    }
                    ['firstname', 'lastname', 'email', 'category', 'country'].forEach(function (el) {
                        admin[el] = request.payload[el] || admin[el];
                    }) ;
                    admin.save(function (err, res) {
                        reply().redirect('/admins') ;
                    }) ;
                }) ;
            }
        },
        {

            /**
             *  @event
             *  @name Routes:Admins.edit
             *  @description <p>path: /admins/{id}/edit</p>
             *  @desc id-object id
             *  <p><b>operations:Edit the data in Admin model</b></p>
             *  @desc handler - Handler object that is processing the request.
             *  @param{object} request Request Object
             *  @param{object} res response object
             *  <p><b>Shows the edit page </b</p>
             *  <p>Path for the page</p>
             *  <p>admins/edit</p>
             *  <p>It will log error if the get method goes fail</p>
             *
            */

            method: 'GET',
            path: '/admins/{id}/edit',
            config: { auth: true },

            handler: function (request, res) {
                Q.allSettled([
                    findAdmin({_id: request.params.id}),
                    api.get('/config/countries')
                ])
                .then(function (data) {
                    res.view('admins/edit', {
                        admin: data[0].value,
                        countries: data[1].value
                    }) ;
                })
                .fail(console.error.bind(console));
            }
        },
        {

            /**
             *  @event
             *  @name Routes:Admins.delete
             *  @description <p>path: /admins/{id}/delete</p>
             *  @desc id-object id
             *  <p><b>operations:Delete the data in Admin model</b></p>
             *  <p> http-method:Post</p>
             *  <p> path:"/admins/{id}/delete"</p>
             *  @desc handler - Handler object that is processing the request.
             *  @param{object} request Request Object
             *  @param{object} res response object
             *  <p><b>After deleting redirect to a new page</b</p>
             *  <p>Path for the page</p>
             *  <p>"/admins"</p>
             *
             */
            method: 'POST',
            path: '/admins/{id}/delete',
            config: { auth: true },
            handler: function (req, res) {
                Admin.remove({_id: req.params.id}, function (err, admin) {
                    if (err) {
                        return reply(err) ;
                    }
                    res().redirect('/admins') ;
                }) ;
            }
        },
        {


            /**
             *  @event
             *  @name Routes:Admins.get_by_id
             *  @description <p>path: /admins/{id}</p>
             *  @desc id-object id
             *  <p><b>operations:Delete the data in Admin model</b></p>
             *  <p> method:get</p>
             *  <p> path:"/admins/{id}"</p>
             *  @desc handler - Handler object that is processing the request.
             *  @param{object} request Request Object
             *  @param{object} res response object
             *  <p><b>After fetching data, redirect to a new page</b</p>
             *  <p>Path for the page</p>
             *  <p>"/admins/show"</p>
             *
            */

            method: 'GET',
            path: '/admins/{id}',
            config: { auth: true },

            handler: function (request, res) {
                Admin.findOne({_id: request.params.id}, function (err, admin) {
                    if (err) {
                        return reply(err) ;
                    }
                    res.view('admins/show', {
                        admin: admin,
                        moment: moment
                    }) ;
                }) ;
            }
        }
    ]);
};
