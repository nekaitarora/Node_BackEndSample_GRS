/**
 *  mauthentication.js
 *  @description Provides the service for login/logout the users
 *  @desc Authentication process defined here.
 *  @module Controllers:Authentication
 *  @requires config.
 *
*/

var config = require('../config');

var authentication = {};
/**
 *  @function
 *  @name Controllers:Authentication.login
 *  @param {object} request - request object.
 *  @param {interface} reply - hapi reply interface.
 *  @desc it will authenticate using passport and on failure it will again redirect to the "login page" otherwise the "/" will redirected.
*/
authentication.login = function (request, reply) {

    var Passport = request.server.plugins.travelogue.passport;
    Passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    })(request, reply) ;

    //
    //
    // if (request.auth.isAuthenticated) {
    //     return reply().redirect('/');
    // }
    //
    // var message = '';
    // var account = null;
    //
    // if (request.method === 'post') {
    //
    //     if (!request.payload.username || !request.payload.password) {
    //         message = 'Missing username or password';
    //     } else {
    //         account = config.auth.users[request.payload.username];
    //         if (!account || account.password !== request.payload.password) {
    //
    //             message = 'Invalid username or password';
    //         }
    //     }
    // }
    //
    // request.auth.session.set(account);
    // return reply().redirect('/')
};

/**
 *  @function
 *  @name Controllers:Authentication.logout
 *  @param {object} request - http request
 *  @reply {interface} reply -hapi reply interface
 *  @desc after logout destroy the session and redirect to home page.
*/
authentication.logout = function (request, reply) {

    request.session._logout() ;
    return reply().redirect('/');
};
//just a sample
authentication.detailStats = function (req, reply) {
        var selectedSong = null;
        var artist = req.pre.artist;
        var contest = null;

        Q.all([
            getSelectedSong(req),
            currentContest()
        ])
            .spread(function (_selectedSong, _contest) {
                selectedSong = _selectedSong;
                contest = _contest;

                var e = [artistContestMeta(artist._id)];
                e.push(artistTotalPlays(artist._id));
                e.push(artistProjectMeta(artist._id));
                if (selectedSong) {
                    e.push(selectedSong.songMeta());
                    e.push(selectedSong.contestMeta());
                }

                return Q.all(e);

            }).spread(function (_artistContestMeta, _totalPlays, _projectMeta, _songContestMeta) {
                //console.log(_projectMeta);
                var result = {
                    _id: req.params.id,
                    totalPlays: _totalPlays,
                    contestMeta: _artistContestMeta,
                    projectMeta: _projectMeta
                };

                if (selectedSong) {
                    result.selectedSong = {_id: selectedSong._id, songMeta: _songContestMeta};
                }

                //console.log('DETAIL STATS =>');
                //console.log(JSON.stringify(result, null, 2));

                reply(result);

            }).fail(function (err) {
                reply(err);
                console.log(err.stack);
            });
    };
/**
 * A module for authenticating.
 * @exports authentication.
*/
module.exports = authentication;
