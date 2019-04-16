// const functions = require('firebase-functions');




// // // Create and Deploy Your First Cloud Functions
// // // https://firebase.google.com/docs/functions/write-firebase-functions
// //
// // exports.helloWorld = functions.https.onRequest((request, response) => {
// //  response.send("Hello from Firebase!");
// // });

// // The Firebase Admin SDK to access the Firebase Realtime Database.
// const admin = require('firebase-admin');
// admin.initializeApp();



// // Take the text parameter passed to this HTTP endpoint and insert it into the
// // Realtime Database under the path /messages/:pushId/original
// exports.addMessage = functions.https.onRequest((req, res) => {
//     // Grab the text parameter.
//     const original = req.query.text;
//     // Push the new message into the Realtime Database using the Firebase Admin SDK.
//     var text = {};
//     admin.database().ref('player').on("child_added", function (data) {
//         console.log(data.key);
//         console.log(data.val());
//         text[data.key] = (data.val());        

//     });
//     res.send(text);
// });

const functions = require("firebase-functions")
const cors = require("cors")
const express = require("express")

/* Express with CORS & automatic trailing '/' solution */
const app3 = express()
app3.use(cors({ origin: true }))
app3.get("*", (request, response) => {
    console.log(request.body);
    response.send(
        request.body
    )
})

// app3.post("*", (request, response) => {
//     console.log(request.body);
//     response.send(
//         request.body
//     )
// })

app3.post("/test", (request, response) => {
    console.log(request.body);
    response.send(
        request.body
    )
})

// not as clean, but a better endpoint to consume
const api3 = functions.https.onRequest((request, response) => {
    if (!request.path) {
        request.url = `/${request.url}` // prepend '/' to keep query params if any
    }
    return app3(request, response)
})

module.exports = {
    api3
}