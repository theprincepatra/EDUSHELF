const express = require('express');
const { get } = require('http');
const app = express();
const path = require('path');

// const userModel = require('./models/user');

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req,res){
    res.render('landing');
});

app.get('/signup', function(req,res){
    res.render('signup');
});
app.get('/login', function(req,res){
    res.render('login');
});
app.get('/access-notes', function(req,res){
    res.render('login');
});

app.listen(3000, function(){
    console.log('Server is running on port http://localhost:3000');
}); 