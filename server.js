var express = require('express')
var sse = require('connect-sse')
var session = require('express-session')

const spawn = require('child_process').spawn;
var app = express()
app.set('trust proxy', 1);
const fs = require('fs');
var mp3Duration = require('mp3-duration');
var mm = require('musicmetadata');
var request = require('request');
var xml2js = require('xml2js');
var deploy = require('./deploy.json');
var morgan= require('morgan');
var cors= require('cors');
var sqlite3 = require('sqlite3').verbose();
//var songJson
var flag=0;
var songToPlay="";
var currentSong="";

app.use(morgan("common"));
app.use(cors({
  credentials: true,
  origin: "localhost"
}));
app.use(session({ 
	secret: 'keyboard cat', 
	resave: false,
	saveUninitialized: true,
	cookie: {
		maxAge: 60 * 60 * 1000
	}
}));

app.use(express.static("."));

/*function objSong(songname, id, vote) {
  this.songname = songname;
  this.id = id;
  this.vote = vote;
}

request("http://feathr.io.s3.amazonaws.com/?prefix=songfiles/", function(err, res, body) {
  if (err)
    return;
  xml2js.parseString(body, function(err, result) {
    if (err)
      return;
    Promise.all(result.ListBucketResult.Contents.filter(function(data) {
      return data.Key[0].indexOf("/") != data.Key[0].length - 1;
    }).map(function(data) {
      return data.Key[0];
    }).map(function(data) {
      return new Promise(function(resolve, reject) {
        mm(request("http://feathr.io.s3.amazonaws.com/" + data), function(err, metadata) {
          if (err)
            reject(err);
          resolve(new objSong(data, [metadata.title , metadata.artist]));
        });
      });
    })).then(function(arr) {
      songJson = arr;
    });
  });
});*/

var songdb = new sqlite3.Database('songdb_base');

songdb.serialize(function() {
    songdb.run("CREATE TABLE IF NOT EXISTS song (id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR, artist VARCHAR, src VARCHAR,  vote INTEGER DEFAULT 0)");
    songdb.run("CREATE TABLE IF NOT EXISTS vote (song_id INTEGER, session_id VARCHAR, CONSTRAINT unique_id UNIQUE (song_id, session_id))");
});




// id PRIMARY KEY,
// title, artist, album, VARCHAR(255)
// vote INTEGER,
// url mp3 VARCHAR(255)

// song_id FOREIGN KEY song
// session_id VARCHAR(255)
// UNIQUE (song_id, session_id)

/*fs.readdir('./songfiles', (err, data) => {
  if (err) throw err;
  var results=[];
  data.forEach(function(song) {
	if(song != ".DS_Store")  {
	var parser = mm(fs.createReadStream('./songfiles/'+song), function (err, metadata ) {
		console.log(song);
    	results.push(new objSong(song,[metadata.title , metadata.artist],0));
	});
	}
  });
  songJson = results;
});*/

app.post("/api/song/:id/vote", function(req, res, next) {
  // UPDATE song SET vote=vote+1 WHERE name=?
  var query = songdb.prepare("INSERT INTO vote VALUES (?, ?)");
  query.run(req.params.id, req.sessionID, function(err) {
    if (err)
      return res.json("You already voted");
  	songdb.run("UPDATE song SET vote=vote+1 WHERE id=?", req.params.id, function(err) {
		if (err)
			return next(err);
    	res.json(true);
	});	
  });
});

app.get("/api/votes",function(req, res, next) {
  var query = songdb.all("SELECT id, vote FROM song", function(err, rows) {
    if (err)
	  return next(err);
  	return res.json(rows);
  });
});

app.get("/api/song",function(req, res) {
  return res.json(songJson.map(function( v) { return v.songname }));
});

app.get("/api/votedfor",function(req, res, next) {
	songdb.all("SELECT * FROM vote WHERE session_id=?", req.sessionID, function (err, rows) {
		if (err)
			return next(err);
		return res.json(rows)
	})
 });

app.get("/api/data",function(req, res) {
  var query = songdb.all("SELECT * FROM song", function(err, rows) {
    if (err)
	  return next(err);
  	return res.json(rows);
  });
});

app.get("/api/songtoplay",function(req, res) {
  return res.json(currentSong);
});

function playNextSong(){
  var votearray= songJson.map(function(v) { return v.vote });
  var sumvote = votearray.reduce(function(pv, cv) { return pv + cv; }, 0);
  console.log(votearray)
  var i
  if(sumvote>0){
   i = votearray.indexOf(Math.max.apply(Math,votearray));}
  else{
  i= Math.floor(Math.random() * (votearray.length));
  }
  console.log(i);
  songJson[i].vote=0;
  songJson[i].uuid=[];
  console.log("./songfile/"+songJson[i].songname);
  songToPlay=	"./songfiles/"+songJson[i].songname;
  currentSong=songJson[i].data;
	
}

app.get("/api/playnextsong", function(req, res, next) {
	// SELECT * FROM song ORDER BY vote DESC LIMIT 1
  songdb.get("SELECT * FROM song ORDER BY vote DESC LIMIT 1", function(err, row) {
    if (err)
	  return next(err);
    songdb.run("UPDATE song SET vote=0 WHERE id=?", row.id, function(err) {
      if (err)
		return next(err);
      songdb.run("DELETE FROM vote WHERE song_id=?", row.id, function(err) {
		if (err)
		  return next(err);
        return res.json(row);
      });
    });
  });
});

app.listen(deploy[0].port)
console.log("Listening on port " + deploy[0].port);
