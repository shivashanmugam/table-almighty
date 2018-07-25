//module delcar
var port = process.env.PORT || 8080;
var express = require('express');
var app = express();
var server = app.listen(port, function (err) {
    if (err) throw err;
    console.log('server Listnering');
});


//middlewares
app.use('/', express.static(__dirname + '/'));

