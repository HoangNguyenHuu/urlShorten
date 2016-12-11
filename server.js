var express = require('express')
var app = express()
var mongo = require('mongodb')
    // var mongourl = 'mongodb://localhost:27017/url-shorten';
    // console.log(process.env);
mongo.MongoClient.connect(process.env.MONGOLAB_URI || 'mongodb://localhost:27017/url-shorten', function(err, db) {
    if (err) {
        throw new Err("Connect database fail");
    } else {
        console.log("Connect database successful")
    }
    app.get('/', function(req, res) {
        res.send('Put <h1>/new/youUrl</h1> after url to get shortenUrl<br><hr> And then put <h1>short_url</h1> on address bar to redirect original website');
    })

    app.get('/:url', function(req, res) {
        var pre = '';
        if (process.env.APP_URL !== undefined) {
            pre = process.env.APP_URL;
        } else {
            pre = "localhost:8080/"
        }
        var url = pre + req.params.url;
        findUrl(url, db, res);
    });

    app.get('/new/:url*', function(req, res) {
        var url = req.url.slice(5);
        // res.send(url);
        if (validateUrl(url)) {
            var pre = '';
            if (process.env.APP_URL !== undefined) {
                pre = process.env.APP_URL;
            } else {
                pre = "localhost:8080/"
            }
            var urlObj = {
                "original_url": url,
                "short_url": pre + linkGen()
            };
            console.log(urlObj);
            res.send(urlObj);
            save(urlObj, db);
        } else {
            var urlObj = {
                "err": "Invalid url"
            }
            res.send(urlObj);
        }

    });
})

function linkGen() {
    var num = Math.floor(100000 + Math.random() * 900000);
    return num.toString().substring(0, 4);
}

function validateUrl(url) {
    var regex = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i;
    return regex.test(url);
}

function save(obj, db) {
    var website = db.collection('website');
    website.save(obj, function(err, result) {
        if (err)
            throw err
        console.log("Saved");
    })
}

function findUrl(link, db, res) {
    console.log(link);
    var website = db.collection('website');
    website.findOne({
        "short_url": link
    }, function(err, result) {
        if (err) {
            throw err;
        }
        if (result) {
            console.log("Redirecting to: " + result.original_url);
            res.redirect(result.original_url);
        } else {
            res.send({
                "err": "This url is not on database"
            });
        }
    });
}

var port = process.env.PORT || 8080;
app.listen(port, function() {
    console.log('Node.js listening on port ' + port);
});
