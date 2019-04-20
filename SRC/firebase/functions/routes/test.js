var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('Wanted a /test get');
});

router.post("/", (req, res) => {
    console.log(req.body);
    res.send(
        req.body
    )
})

module.exports = router;
