const https = require('https');
const fs = require("fs");
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');
const app = express();
const httpsPort = 443;
const httpPort = 80;

const userAuth = require('./server/auth.js');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname + "/sitejade"));

app.use(session({
    secret: 'secret',
	resave: true,
	saveUninitialized: true,
	maxAge: 30000,
	secure: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.use(function(req, res, exit) {
	app.locals.loggedIn = req.session.loggedIn;
	res.app.use(express.static(path.join(__dirname, '/sitejade/data')))
	exit();
});

app.get('/', function(req, res) {
	res.render("index");
});
app.get('/about', function(req,res) {
	res.render('about')
})
app.get('/contact', function(req,res) {
	res.render('contact')
})
app.get('/login', function(req,res) {
	if(!req.session.loggedIn) {
		res.render('login');
	}
	else {
		res.redirect('/');
	}
}) 
app.get('/reviews/test1', function(req,res) {
	res.render('reviews/test1')
})
app.get('/reviews/test2', function(req,res) {
	res.render('reviews/test2')
})

app.post('/auth', async (req, res)=> {
	var username = req.body.username;
	var password = req.body.password;

	const verify = await userAuth.authenticateUser(username,password);
	if(verify) {
		req.session.loggedIn = true;
		res.redirect('/secret');
	}
	else{
		res.redirect('login');
	}

});
app.get('/secret', function(req, res) {
	if (req.session.loggedIn) {
		res.render('secret');
	}
	else {
		res.redirect('/login');
	} 
});

app.get('/pages/login.html' ,function(req, res) {
	if(req.session.loggedIn) {
		res.redirect('/secret');
		res.end();
	} else {
		res.redirect("/login");
		
	}
});


app.get('/logout', function(req, res) {
	if(req.session.loggedIn) {
		req.session.loggedIn = false;	
		res.redirect('/pages/login.html');
		res.end();
	}
	else {
		res.redirect('/');
	}
	res.end;

});

const options = {
	key: fs.readFileSync("keys/key.pem"),
	cert: fs.readFileSync("keys/cert.pem")

};
https.createServer(options,app).listen(httpsPort);
http.createServer((req, res) => {
	res.writeHead(301, { 'Location':'https://' + req.headers['host'] + req.url});
	res.end();
}).listen(httpPort);
