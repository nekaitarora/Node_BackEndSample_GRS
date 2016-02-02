/**
 * index.js
 *
 *  @desc Index work defined here. This is the home page which provide link to all the module.
 *  @module Index
 *  @requires hapi.
 *  @requires config
 *  @requires seaport
 *  @requires node-redis-pubsub
 *  @requires lodash
 *  @requires auth
*/
var hapi = require('hapi'),
    config = require('./config');

var seaport = require('seaport') ;
var ports = seaport.connect('localhost', process.env.SEAPORT) ;
var nrp = require('node-redis-pubsub') ;
var events = new nrp(config.redis) ;
var _ = require('lodash');

var auth = require('./config/auth') ;

// init template engine
/**
 *  @namespace
 *  @property {string}   path
 *  @property {object} engine
 *  @property {object} compileOptions
*/
var options = {
    views: {
        path: __dirname + '/views',
        engines: {
            jade: 'jade'
        },
        compileOptions: {
            pretty: true
        },
        isCached: false
    },
    debug: { 'request': ['error', 'uncaught'] }
};

/**
 *  @function
 *  @name Index.hapi.createServer
 *  @param {string} config.address
 *  @param {integer} port
*/  
var server = hapi.createServer(config.address, config.port, options);
/**
 *  @event 
 *  @name Index.getPath
 *  @desc handler - Handler object that is processing the get request .
 *  @desc -<p> Http method- Get, It responses a home page view</p>
 *   
*/
server.route({
    method: 'GET',
    path: '/{path*}',
    handler: {
        directory: { path: './public', listing: false, index: true }
    }
});
/**
 *  @function
 *  @name Index.uncaughtException
 *  @param {object} err for logging error onto console
*/
process.on('uncaughtException', function (err) {
    console.log("UNCAUGHT EXCEPTION ");
    console.log("[Inside 'uncaughtException' event] " + err.stack || err.message);
});

/**
 *  @function
 *  @name Index.sigint
 *  @desc exiting the process
*/
process.on('SIGINT', function () {
    console.log("\nGracefully shutting down from SIGINT (Ctrl-C)");
    // some other closing procedures go here
    process.exit();
});
/**
 *  @namespace
 *  @property {string} yar
 *  @property {object} travelogue
*/
var plugins = {
    yar: {
        name: 'gr-backend',
        cookieOptions: {
            password: 'buhuhuhuhuhuhuhuhuhuwsdla348edjfksdjv948fksjef', // cookie secret
            isSecure: false // required for non-https applications
        }
    },
    travelogue: {
        server: {
            hostname: 'localhost',
            port: config.port
        }
    }
};
/**
 *  @function
 *  @name Index.serverPack
 *  @param {object} err the error object is passed to show the error message
*/   
server.pack.require(plugins, function (err) {

    server.auth.strategy('passport', 'passport');

    var Passport = server.plugins.travelogue.passport;
    var Admin = require('./models/admin') ;

    Passport.use(Admin.createStrategy());
    /**
     *  @function
     *  @name Index.passportSerialize
     *  @param {object} user contains user data 
     *  @callback done responses after functioning 
    */
    Passport.serializeUser(function (user, done) {
        done(null, { countries: user.country, email: user.email, category: user.category, id: user._id }) ;
    });
    /**
     *  @function
     *  @name Index.passportdeSerialize
     *  @param {object} obj contains user data 
     *  @callback done responses after functioning 
    */
    Passport.deserializeUser(function (obj, done) {
        Admin.findOne({_id: obj.id}, function (err, res) {
            done(err, res) ;
        }) ;
    });

    require('./routes')(server);
    /**
     *  @function
     *  @name Index.reformatErrors
     *  @param {object} errObj
     *  @callback next redirecting the path
    */     
     
    server.method('reformatErrors', function (errorObj, next) {
        next(null, _.reduce(errorObj, function (ret, val) {
            ret[val.path] = ret[val.path] || [] ;
            ret[val.path].push(val) ;
            return ret ;
        }, {})) ;
    });
    /**
     *  @function
     *  @name Index.onPreResponse
     *  @param {object} req request object
     *  @param {interface} reply Response
    */     
    server.ext('onPreResponse', function (req, reply) {
        if (req.response.source && req.response.source.context) {
            req.response.source.context.config = config;
            req.response.source.context.currentUser = req.session.user ;
            req.response.source.context.allowedRoutes =  auth.routes ;
        }

        console.log(req.url.path);
        console.log(req.url.path.split("/")[1]);
        /** checking that the the user accessing a vlid url or not, if not then reply an error page using "reply" interface*/        
        if (req.url.path != '/' &&
            req.url.query.knockknock == null &&
            req.url.path.indexOf('/scripts/') == -1 &&
            req.url.path.indexOf('/styles/') == -1 &&
            req.url.path.indexOf('/login') == -1 &&
            req.url.path.indexOf('/logout') == -1 &&
            req.session.user &&
            req.session.user.category != 'admin' &&
            auth.routes[req.session.user.category].indexOf("/" + req.url.path.split("/")[1].split("?")[0]) == -1) {
            return reply(hapi.error.unauthorized("you don't have permissions to view this site")) ;
        }


        return reply();
    }) ;

    /**
     *  @function
     *  @name Index.serverStart
     *  @desc loging a message about starting the server
    */
    server.start(function () {

        console.log('server started on: ' + config.address + '::' + config.port);
    });
});
