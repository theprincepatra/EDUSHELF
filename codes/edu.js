const express = require("express");
const bcrypt = require("bcrypt");
const { get } = require('http');
const app = express();
const path = require('path');

const userModel = require('./models/user');

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
app.get('/count', async (req,res)=>{
    const count = await userModel.countDocuments();
    res.send(`
        <body style="background-color:black; color:#fc3232; font-size:30px; display:flex; justify-content:center; align-items:center;">
            <h1>Total users: ${count}</h1>
        </body>
    `);
});
app.post('/signup', async function(req,res){
    let {name, email, password} = req.body;

    const newuser = await userModel.create({
        name,
        email,
        password: await bcrypt.hash(password, 10)
    });
    res.redirect('/login');
});
app.get('/prince', async function(req,res){
    const myname = await userModel.findOne({name: 'Prince Patra'});
    res.send(myname);
});

app.listen(3000, function(){
    console.log('Server is running on port http://localhost:3000');
}); 