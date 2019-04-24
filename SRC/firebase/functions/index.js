var createError = require('http-errors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const express = require("express");

var testRouter = require('./routes/test');
//var usersRouter = require('./routes/users');
var gameRouter = require('./routes/game');

const functions = require("firebase-functions");
const cors = require("cors");


/* Express with CORS & automatic trailing '/' solution */
const app = express()

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({ origin: true }))

app.use('/game', gameRouter);
app.use('/test', testRouter);

app.get("*", (request, response) => {
    console.log(request.body);
    response.send(
        "<h1>Team B Dipomacy backend</h1>"
    )
})




// not as clean, but a better endpoint to consume
const teamBackend = functions.https.onRequest((request, response) => {
    if (!request.path) {
        request.url = `/${request.url}` // prepend '/' to keep query params if any
    }
    return app(request, response)
})

module.exports = {
    teamBackend
}