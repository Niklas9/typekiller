var express = require('express');
var fs = require('fs');
var app = express();

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
app.use(express.bodyParser());

var WORDS_PER_LEVEL = 10;

var words = [];
var toplist = [];

fs.readFile('data/words.json', function(err, data) {
    words = JSON.parse(data);
});

var getRandomWords = function() {
    var randomWords = [];
    for (var i = 0; i < WORDS_PER_LEVEL; i++) {
        randomWords.push(words[Math.floor(Math.random()*words.length)]);
    }
    return randomWords;
};

var toplistCmp = function(a, b) {
    if (a.wpm > b.wpm) {
        return -1;
    }
    if (a.wpm < b.wpm) {
        return 1;
    }
    return 0;
};

var getSortedToplist = function() {
    var l = toplist.sort(toplistCmp);
    return l.slice(0, 10);  // only the last 10
};

app.get('/', function(req, res) {
    res.send('Typekillah');
});

app.get('/words', function(req, res) {
    res.json(getRandomWords());
});

app.get('/toplist', function(req, res) {
    res.send(getSortedToplist());
});

app.post('/toplist', function(req, res) {
    // TODO(niklas9):
    // * do input validation
    var name = req.body.name;
    var wpm = parseFloat(req.body.wpm);
    var d = {'name': name, 'wpm': wpm.toFixed(3)};
    toplist.push(d);
    res.send();
});

app.listen(app.get('port'), function() {
  console.log("Typekiller running:" + app.get('port'));
});
