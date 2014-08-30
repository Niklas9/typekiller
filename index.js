var express = require('express')
var app = express();

app.set('port', (process.env.PORT || 80))
app.use(express.static(__dirname + '/public'))

app.get('/', function(request, response) {
  response.send('Typekillah')
})

app.listen(app.get('port'), function() {
  console.log("Typekiller running:" + app.get('port'))
})