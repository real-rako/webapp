const https = require('https');
const fs = require("fs");
const express = require('express');
const router = express.Router();
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
	if(req.session.userType === 'admin') {
		app.locals.isAdmin = true;
	}
	else {
		app.locals.isAdmin = false;}
	res.app.use(express.static(path.join(__dirname, '/sitejade/data')))
	exit();
});

app.get('/ditisstom', async function(req,res) {
	await userAuth.firstTime();
	res.redirect('/login');
})
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
		req.session.userType = await userAuth.getUserType(username);
		req.session.username = username;
		res.redirect('/secret');
	}
	else{
		res.redirect('login');
	}

});
app.post('/api/addUser', async (req,res)=> {
    const username = req.body.username;
    const password = req.body.password;
    const userType = req.body.userType;
    
    if(req.session.loggedIn === true && (req.session.userType === 'admin')) {
        userAuth.addUser(username,password,userType);
        res.send('Success');
    }
    else res.send('Do not do that!');
});

app.post('/api/delUser', (req,res)=> {
    const username = req.body.username;
    if(req.session.loggedIn === true && (req.session.userType === 'admin')) {
        userAuth.deleteUser(username);
        res.redirect('/secret/delUser');


    }
    res.redirect('/login');
});
app.get('/secret', function(req, res) {
	if (req.session.loggedIn && (req.session.userType === 'admin')) {
		res.render('secret', {username : req.session.username});
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
		req.session.destroy();
		res.redirect('/pages/login.html');
		res.end();
	}
	else {
		res.redirect('/');
	}
	res.end;

});

app.get('/secret/addUser', function(req,res) {
    if(req.session.loggedIn && (req.session.userType === 'admin')) {
      res.render('secret/addUser');
    }
    else {
      res.redirect('/');
    }
    res.end();
});

app.get('/secret/delUser', async function(req,res) {
    if(req.session.loggedIn && (req.session.userType === 'admin')) {
      const users2 = await userAuth.getAllUsers();
      const username = req.session.username;  
      res.render('secret/delUser', { users: users2, username });
    }
    else {
      res.redirect('/login');
    }
    res.end();
});

app.get('/panel', async function(req, res) {
	const reviews = await userAuth.getAllReviews();

	res.render('reviews/panel', { reviews: reviews})
})



app.get('/panel/addReview', async function(req, res) {
	if(!req.session.loggedIn) res.redirect('/login')
	res.render('reviews/addReview')
})
app.post('/api/addReview', async function(req,res) {
	// add ingelogd checker en database connectie checker
	if(!req.session.loggedIn) return; 
	const { title, author, description, image } = req.body;
	userAuth.addReview(title, author, description, image );
	res.sendStatus(200);
})

app.get('/reviews/:id',  async function(req,res) {
		const review = await userAuth.getReviewById(req.params.id);
		if(!review) {
			res.status(404).send('Review niet gevonden');
			return;
		}
		res.render('reviews/review', { review: review });
})
const options = {
	key: fs.readFileSync("keys/key.pem"),
	cert: fs.readFileSync("keys/cert.pem")

};
https.createServer(options,app).listen(httpsPort);
http.createServer((req, res) => {
	res.writeHead(301, { 'Location':'https://' + req.headers['host'] + req.url});
	res.end();
}).listen(httpPort);
