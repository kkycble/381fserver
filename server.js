var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var MongoClient = require('mongodb').MongoClient;
var session = require('cookie-session');
var fileUpload = require('express-fileupload');

MongoClient.connect('mongodb://test:test@ds159747.mlab.com:59747/restaurants', (err, db) => {
  if (err) return console.log(err);
  app.listen(process.env.PORT || 8099, () => {
    console.log('listening on port 8099')
  })

  app.use(bodyParser.urlencoded({extended : true}));
  app.set('view engine', 'ejs');
  app.use(express.static('/public'));
  app.use(bodyParser.json());
  app.use(session({name: 'session', secret: 'assgor is awesome'}));
  
  app.get('/', (req, res) => {
    console.log(req.session);
    if(!req.session.authenticated) {
      res.redirect('/login');
    } else res.redirect('/main');
  })
  
  app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
  })
  
  app.get('/logout', (req, res) => {
    req.session = null;
    console.log('Logout Successful', req.session);
    res.redirect('/');
  })
  
  app.get('/main', (req, res) => {
    //res.sendFile(__dirname + '/public/main.html');
    res.render('main', {userid: req.session.userid});
  })
  
  app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/public/register.html');
  })
  
  app.post('/login', (req, res) => {
    if(req.body.userid != '') {
      db.collection('accounts').find({userid: req.body.userid, password: req.body.password}).toArray((err, result) =>{
      if(err) {
        console.log(err);
        res.redirect('/login');
      }
      else if(result.length) {
        console.log('Login Successful', result);
        req.session.authenticated = true;
        req.session.userid = req.body.userid;
        console.log('userid of session: ' + req.session.userid);
        res.redirect('/main');
      }
      else {
        console.log('Invalid Username or Password');

        res.writeHead(400, {"Content-Type": "text/html"});
        res.write("<html><body>");
        res.write("<h1>Invalid Username or Password!</h1>");
        res.write("<br>");
        res.write("<form action=\"/login\" method=\"get\">");
        res.write("<input type=\"submit\" value=\"Go Back\"></form>");
        res.write("</body></html>");
        res.write("<br>");
        res.write("<form action=\"/register\" method=\"get\">");
        res.write("<input type=\"submit\" value=\"Sign Up\"></form>");
        res.end();
      }
    })
    } else {
        console.log('Login Error: Username field is empty');
        
        res.writeHead(400, {"Content-Type": "text/html"});
        res.write("<html><body>");
        res.write("<h1>Login Error: Username field is empty!</h1>");
        res.write("<br>");
        res.write("<form action=\"/login\" method=\"get\">");
        res.write("<input type=\"submit\" value=\"Go Back\"></form>");
        res.write("<br>");
        res.write("</body></html>");
        res.end();
    }
  })
  
  app.post('/register', (req, res) => {
    if(req.body.userid == '') {
      console.log('Register Error: Username field is empty');
      res.writeHead(400, {"Content-Type": "text/html"});
      res.write("<html><body>");
      res.write("<h1>Register Error: Username field is empty!</h1>");
      res.write("<br>");
      res.write("<form action=\"/register\" method=\"get\">");
      res.write("<input type=\"submit\" value=\"Go Back\"></form>");
      res.write("<br>");
      res.write("</body></html>");
      res.end();
    } else {
    db.collection('accounts').find({userid: req.body.userid}).toArray((err, result) => {
      if(err) {
        console.log(err);
        res.redirect('/register');
      }
      else if(result.length) {
        console.log('Username Already Been Used');
        //res.redirect('/register');
        res.writeHead(400, {"Content-Type": "text/html"});
        res.write("<html><body>");
        res.write("<h1>Username Already Been Used!</h1>");
        res.write("<br>");
        res.write("<form action=\"/register\" method=\"get\">");
        res.write("<input type=\"submit\" value=\"Go Back\"></form>");
        res.write("<br>");
        res.write("<form action=\"/login\" method=\"get\">");
        res.write("<input type=\"submit\" value=\"Login\"></form>");
        res.write("</body></html>");
        res.end();
      }
      else
      {
        db.collection('accounts').insert({userid: req.body.userid, password: req.body.password}, (err, result) => {
        if(err) {
          console.log(err);
          res.redirect('/register');
        } 
          else
        {
          console.log('Sign Up Successful', result);
          //res.redirect('/login');
          res.writeHead(200, {"Content-Type": "text/html"});
          res.write("<html><body>");
          res.write("<h1>Sign Up Successful!</h1>");
          res.write("<br>");
          res.write("<form action=\"/login\" method=\"get\">");
          res.write("<input type=\"submit\" value=\"Login\"></form>");
          res.write("<br>");
          res.write("</body></html>");
          res.end();
        }
        })
      }
    })
    
  }})
})