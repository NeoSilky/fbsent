var cors = require('cors');
var express = require('express');

var app = express();
app.use(cors());
app.use(express.static('public'));

/*app.get('/', function(req, res) {
    res.sendfile(__dirname + '/public/index.html');
});*/

app.listen(8000);