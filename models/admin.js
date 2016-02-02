/**
 *  admin.js
 *
 *  @desc Admin model defined here.
 *  @module Models:Admin js
 *  @requires mongoose
 *  @requires database
 *  @requires passport-local-mongoose
*/

var mongoose = require('mongoose') ;
var db = require('../lib/database') ;
var passportLocalMongoose = require('passport-local-mongoose');
/**
 *  @desc Admin schema is being created
 *  @constructor Admin
 *  Enum for category  values.
 *  @readonly
 *  @enum {string}
 *  @desc category is defined as enum of string having three values.
*/
var Admin = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    firstname: {
        type: String
    },
    lastname: {
        type: String
    },
    country: {
        type: [String]
    },
    category: {
        type: String,
        enum: ["content-manager", "manager", "admin"]
    },
    salt: {
        type: String
    },
    hashedPassword: {
        type: String
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    }
});

/**
 *  Plugin is being used by schema, here Admin is the schema and passportLocalMongoose is the plugin.
*/
Admin.plugin(passportLocalMongoose, { usernameField: 'email', hashField: 'hashedPassword', usernameLowerCase: true });

/**
 *  A module for model.
 *  @exports model Admin.
*/

module.exports = mongoose.model('Admin', Admin) ;
