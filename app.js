"use strict";
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
//app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.text());
app.use(bodyParser.json());
var multer = require('multer');
var storage = multer.diskStorage({
  destination: __dirname +'/pics/',
  filename: function (req, file, cb) {
    cb(null, req.body.username + '.jpg')
  }
})

var upload = multer({ storage: storage })
const fs = require('fs');
var http = require('http');

//Send html page
app.get("/", function(req, res) {
  res.sendFile(__dirname + '/index.html');
});
app.get("/templates.htm", function(req, res) {
  res.sendFile(__dirname + '/templates.htm');
});

//The dynamically generated threads and thread content took so long I didn't have time to implement quite a lot of stuff

// OBJECTS
// USER - username(unique), forename, surname, password, admin, profile picture, join date
// POST - creator's username, content, timePosted
// THREAD - title(unique), list of Posts
//implicitly: date created, last updated, creator
var doctorwhocomposer = {
  username: "doctorwhocomposer",
  forename: "Delia",
  surname: "Derbyshire",
};
var frankv = {
  username: "frankv",
  forename: "Francisco",
  surname: "Vasconcelos",
};
var post1 = {
  poster: doctorwhocomposer,
  content: "Hi, this is my first post.",
  timePosted: 1547080791000 //utc timestamp in milliseconds
};
var post2 = {
  poster: doctorwhocomposer,
  content: "Hi, this is my SECOND post.",
  timePosted: 1547080792000 //utc timestamp in milliseconds
};
var post3 = {
  poster: frankv,
  content: "Hi, this post is testing the thread order.",
  timePosted: 1547080794000 //utc timestamp in milliseconds
};
var thread1 = {
  id: 0,
  title: "First thread!",
  posts: [post1,post2]
};
var thread2 = {
  id: 1,
  title: "another thread!",
  posts: [post1,post3]
};
var people = [doctorwhocomposer,frankv];
var threads = [thread1,thread2];
var passwords = ["concertina"];
//BASIC ROUTES TO COMPLY WITH TEST CASES
//GET function returns list of users People as JSON
app.get('/people', function(req, res){
  console.log("people requested");
  res.json(people);
});

//GET particular user in People
app.get('/people/:username', function(req, res){
  console.log('user requested:' + req.params.username);
  var user = (people.find(x => x.username === req.params.username));
  res.json(user);
});

//POST adduser, only used to pass preset tests, /adduser handles actual user addition as it is a multipart form
app.post('/people',function(req, res){
  if (passwords.includes(req.headers.access_token)){
    console.log('access OK');
    var username = req.headers.username;
    if (!people.find(x => x.username === username)){
      console.log('username OK');
      var forename = req.headers.forename;
      var surname = req.headers.surname;
      var newUser = {
        username: username,
        forename: forename,
        surname: surname,
      };
      people.push(newUser);
      res.sendStatus(200);
    }
    else{res.status(400).end();} //send error 400 if user already exists
  }
  else {res.send(403);}//send error 403 if access_token not valid
});

//*********************************************FORUM FUNCTIONS****************************************************

//list of Thread titles and last updated time
var threadInfoList = []; //initially empty, populated by initialiseThreadInfoList function
//sorts threadInfoList by dateUpdated, last updated thread at bottom of array
function sortByDateUpdated(threadInfoList, dateUpdated) {
  console.log("sort called");
    return threadInfoList.sort(function(a, b) {
      return (a.dateUpdated < b.dateUpdated);
    });
}

function initialiseThreadInfoList (threads){
  threadInfoList = []; //reset list
  var i = 0;
  while (i< threads.length){
    var thread = threads[i];
    var id = thread.id;
    var title = thread.title;
    var creator = thread.posts[0].poster;
    var dateCreated = thread.posts[0].timePosted;
    var lastPostIndex = thread.posts.length - 1;
    var updater = thread.posts[lastPostIndex].poster;
    var dateUpdated = thread.posts[lastPostIndex].timePosted;
    var threadInfo = {
      id: id,
      title: title,
      creator: creator,
      dateCreated: dateCreated,
      updater: updater,
      dateUpdated: dateUpdated
    }
    threadInfoList.push(threadInfo);
    i = i+1;
  }
  threadInfoList = sortByDateUpdated(threadInfoList, dateUpdated);
}
initialiseThreadInfoList(threads);

app.get('/forum', function(req, res){
  res.json(threadInfoList); //return list of thread info
});
//sends thread object
app.get('/forum/:id', function(req, res){
  var thread = (threads.find(x => x.id == req.params.id));
  if(thread){
    res.json(thread);
  }
  else{
    res.status(404).end(); //send error 400 if thread doesn't exist
  }
});
//Create new thread
//headers: access_token, title, username, content,
app.post('/forum',function(req, res){
  var obj = JSON.parse(req.body);
  if (passwords.includes(obj.access_token)){
    console.log('access OK');
    var title = obj.title;
    if (!threads.find(x => x.title === title)){
      console.log('title OK');
      var creator = people.find(x => x.username === obj.username); //assign user's object instead of username
      var content = obj.content;
      var firstPost = {
        poster: creator,
        content: content,
        timePosted: Date.now()
      };
      var id = threads.length; //IDs are incremental WILL BREAK IF THREAD IS DELETED
      var newThread = {
        id: id,
        title: title,
        posts: [firstPost]
      };
      threads.push(newThread);
      console.log(newThread);
      initialiseThreadInfoList(threads); //sort threadInfoList list on posting
      res.sendStatus(200);
    }
    else{res.status(400).end();} //send error 400 if thread title already exists
  }
  else {res.send(403);}//send error 403 if access_token not valid
});

//Create new post
//headers: access_token, username, content,
app.post('/forum/:id',function(req, res){
  var obj = JSON.parse(req.body);
  if (passwords.includes(obj.access_token)){
    var thread = (threads.find(x => x.id == req.params.id));
    if (thread){  //check thread exists
      var creator = (people.find(x => x.username == obj.username));
      console.log(creator);
      if (creator){ //check user exists
        var content = obj.content;
        var timePosted = Date.now();
        var newPost = {
          poster: creator,
          content: content,
          timePosted: timePosted
        };
        thread.posts.push(newPost);
        initialiseThreadInfoList(threads); //sort threadInfoList list on posting
        console.log(newPost);
        res.sendStatus(200);
      }
      else{res.status(400);}
    }
    else{res.status(400).end();} //send error 400 if thread doesn't exist
  }
  else {res.send(403);}//send error 403 if access_token not valid
});

//Add new user to people and save profile picture
app.post('/adduser',upload.single('image'), function(req, res){
  var username = req.body.username;
  if (!people.find(x => x.username === username)){
    console.log('username OK');
    var forename = req.body.forename;
    var surname = req.body.surname;
    var newUser = {
      username: username,
      forename: forename,
      surname: surname,
    };
    var pass = req.body.passcode;
    people.push(newUser);
    passwords.push(pass);
    res.redirect('/');
    //res.send("User " + username + " has been added.");
  }
  else{res.status(400).send("This username already exists");} //send error 400 if user already exists
});
//serve user profile pictures
app.get('/pics/:username', function(req, res){
  res.sendFile(__dirname + '/pics/' + req.params.username);
  console.log('user\'s picture requested:' + req.params.username);
});


var host = http.createServer(app);
//host.listen(80);
module.exports = host;
