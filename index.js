var express = require('express');
var fs = require('fs');
var app = express();

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

var WORDS_PER_LEVEL = 10;

var words = [];

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

app.get('/', function(request, response) {
    response.send('Typekillah');
});

app.get('/words', function(request, response) {
    response.json(getRandomWords());
});

app.listen(app.get('port'), function() {
  console.log("Typekiller running:" + app.get('port'));
});
