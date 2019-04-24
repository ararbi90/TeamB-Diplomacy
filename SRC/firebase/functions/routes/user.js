var express = require('express');
//const admin = require('./firebaseAdmin');
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
// admin.initializeApp();

var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  admin.database().ref('player').once('value').then(snapshot =>{
    data = {};
    snapshot.forEach(r =>{
      data[r.key] = r.val();
    })
    res.send(data);
    return true;
  }).catch(error => {console.log(error)});
});



module.exports = router;