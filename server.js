/*
CSC3916 HW4
File: Server.js
Description: Web API scaffolding for Movie API
 */

var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var authController = require('./auth');
var authJwtController = require('./auth_jwt');
var jwt = require('jsonwebtoken');
var cors = require('cors');
var User = require('./Users');
var Movie = require('./Movies');
var Actor = require('./Actors');
var Review = require('./Reviews')
const {response} = require("express");

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();

function getJSONObjectForMovieRequirement(req) {
    var json = {
        headers: "No headers",
        key: process.env.UNIQUE_KEY,
        body: "No body"
    };

    if (req.body != null) {
        json.body = req.body;
    }

    if (req.headers != null) {
        json.headers = req.headers;
    }

    return json;
}

router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please include both username and password to signup.'})
    } else {
        var user = new User();
        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;

        user.save(function(err){
            if (err) {
                if (err.code == 11000)
                    return res.json({ success: false, message: 'A user with that username already exists.'});
                else
                    return res.json(err);
            }

            res.json({success: true, msg: 'Successfully created new user.'})
        });
    }
});

router.post('/signin', function (req, res) {
    var userNew = new User();
    userNew.username = req.body.username;
    userNew.password = req.body.password;

    User.findOne({ username: userNew.username }).select('name username password').exec(function(err, user) {
        if (err) {
            res.send(err);
        }

        user.comparePassword(userNew.password, function(isMatch) {
            if (isMatch) {
                var userToken = { id: user.id, username: user.username };
                var token = jwt.sign(userToken, process.env.SECRET_KEY);
                res.json ({success: true, token: 'JWT ' + token});
            }
            else {
                res.status(401).send({success: false, msg: 'Authentication failed.'});
            }
        })
    })
});

router.route('/movies')
    .delete(authJwtController.isAuthenticated, function(req, res) {
            console.log(req.body);
            res = res.status(404);
            if (req.get('Content-Type')) {
                res = res.type(req.get('Content-Type'));
            }
            res.json( {status: 404,  message: 'FAIL', headers: req.headers,  query: req.body.query, env: process.env.UNIQUE_KEY } );
        }
    )
    .put(authJwtController.isAuthenticated, function(req, res) {
            console.log(req.body);
            res = res.status(404);
            if (req.get('Content-Type')) {
                res = res.type(req.get('Content-Type'));
            }
            res.json( {status: 404,  message: 'FAIL', headers: req.headers,  query: req.body.query, env: process.env.UNIQUE_KEY } );
        }
    )
    .get(authJwtController.isAuthenticated,function(req, res) {
            Movie.find({}, function(err, movies) {
            if (err) throw err;
            res.status(200).send(movies)
            });
        }
    )
    .post(authJwtController.isAuthenticated, function(req, res) {
        var movieNew = new Movie();
        var actorNew1 = new Actor();
        var actorNew2 = new Actor();
        var actorNew3 = new Actor();
        var actorArray = [actorNew1, actorNew2, actorNew3];

        actorNew1.actorName = req.body.actor1.actorName;
        actorNew1.characterName = req.body.actor1.characterName;

        actorNew2.actorName = req.body.actor2.actorName;
        actorNew2.characterName = req.body.actor2.characterName;

        actorNew3.actorName = req.body.actor3.actorName;
        actorNew3.characterName = req.body.actor3.characterName;

        movieNew.title = req.body.title;
        movieNew.releaseDate = req.body.releaseDate;
        movieNew.genre = req.body.genre;
        movieNew.actors = actorArray;
        movieNew.imageUrl = req.body.imageUrl
        movieNew.avgRating = 0

        movieNew.save(function(err){
            if (err)
                return res.json(err);
        })

        actorNew1.save(function(err){
            if (err)
                return res.json(err);
        })

        actorNew2.save(function(err){
            if (err)
                return res.json(err);
        })

        actorNew3.save(function(err){
            if (err)
                return res.json(err);
        })

        res.json({success: true, msg: 'Successfully created new movie.'});
        });

router.route('/movies/:movieparam')
    .delete(authJwtController.isAuthenticated, function(req, res) {
        var movieParam = req.params.movieparam.replace(":", "");
        Movie.findOneAndDelete({title:movieParam}).exec(function ( err){
            if (err) {
                res.send(err);
            }
            else {
                res.status(200).send({success: true, msg: "Movie Deleted"});
            }
        })
    })
    .get(authJwtController.isAuthenticated, function(req, res) {
        var movieParam = req.params.movieparam.replace(":", "");
        Movie.findOne({title:movieParam}).exec(function ( err, movie){
            if (err || !movie){
                res.json( {status: 404,  message: 'No movie found', headers: req.headers,  query: req.body.query} );
            }
            else {

                if (req.query.reviews === "true"){
                //TODO Return movie with its review
                    var pipeline = [
                        {
                        $match:
                            {
                                movieID: movie._id
                            }
                    }]
                    Review.aggregate(pipeline, function(err, resp) {
                        resp.movie = movie;
                        res.json(resp);
                    });
                }
                else {
                    res.status(200).send(movie);
                }
            }
        })
    })
    .put(authJwtController.isAuthenticated, function(req, res) {
        var movieParam = req.params.movieparam.replace(":", "");
        Movie.updateOne({title:movieParam}, {$set: {title:"BIGMOVIE"}}).exec(function ( err){
            if (err){
                res.send(err);
            }
            else {
                res.status(200).send({success: true, msg: "Movie title updated to: BIGMOVIE"});
            }
        })
    })
    .post(authJwtController.isAuthenticated, function(req, res) {
            console.log(req.body);
            res = res.status(404);
            if (req.get('Content-Type')) {
                res = res.type(req.get('Content-Type'));
            }
            res.json( {status: 404,  message: 'FAIL', headers: req.headers,  query: req.body.query, env: process.env.UNIQUE_KEY } );
        }
    );

router.route('/reviews')
    .get(function(req, res) {
        //TODO Return all movies and their reviews
        let pipeline =[
            {
                $lookup:
                    {
                        from: "reviews",
                        localField: "_id",
                        foreignField: "movieID",
                        as: "reviews"
                    }
            }]
        Movie.aggregate(pipeline, function(err, resp) {
            res.json(resp);
        });
    })
    .post(authJwtController.isAuthenticated, function(req, res) {
        Movie.findOne({title:req.body.movieTitle}).exec(function ( err, movie){
            if (err || !movie) {
                res.json( {status: 404,  message: 'No movie found', headers: req.headers,  query: req.body.query} );
            }
            else {
                var newReview = new Review();
                newReview.reviewerUsername = req.body.username;
                newReview.comment = req.body.comment;
                newReview.rating = req.body.rating;
                newReview.movieID = movie._id;

                newReview.save(function(err){
                    if (err)
                        return res.json(err);
                })

                var pipeline =
                    [
                        {
                            $match:
                                {
                                    movieID: movie._id
                                }
                        },
                        {$group: {_id: '', "review_avg": {$avg: "$rating"}}},
                    ]
                Review.aggregate(pipeline, function(err, result) {
                    console.log(result[0].review_avg);
                    Movie.findOneAndUpdate(
                        {title:req.body.movieTitle},
                        {$set: {"avgRating" : result[0].review_avg}}
                    );
                    res.json({success: true, msg: 'Successfully created new review.', new_movie_avg_rating: result[0].review_avg});
                });


            }

        })
        //TODO Add review to movie (from authenticated user)
    });

app.use('/', router);
app.listen(process.env.PORT || 8080);
module.exports = app; // for testing only


