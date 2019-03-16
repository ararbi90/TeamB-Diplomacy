$ = require('jquery');

var config = {
    apiKey: "AIzaSyBmzv9WLDoGI533rDWZXVATzA8ea9xbteo",
    authDomain: "cecs-475-team-b.firebaseapp.com",
    databaseURL: "https://cecs-475-team-b.firebaseio.com",
    projectId: "cecs-475-team-b",
    storageBucket: "cecs-475-team-b.appspot.com",
    messagingSenderId: "25953904090"
};
firebase.initializeApp(config);

let db = firebase.database();
let ref = db.ref("player");
let x = 1;


let playerRequestNotComplete = false;
let playerData = null;


// All invite funstions


let PlayerFireBaseClass = class {

    constructor() {


    }


    getPlayers(userName) {

        var x = ref;
        return x

    }

    validatePlayer(userName) {

        ref.once("value").then(function (data) {
            if (data.child(userName).val() != null) {
                return true;
            } else {
                return false;
            }
        });
    }

    test() {
        return ref;
    }

    printX() {
        console.log(x);
    }
}


let PlayerFireBase = new PlayerFireBaseClass();
//console.log(PlayerFireBase.getPlayers());

