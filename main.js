var cors = require('cors');
var express = require('express');

var app = express();
app.use(cors());
app.use(express.static('public'));
