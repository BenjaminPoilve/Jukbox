var express = require('express')
var sse = require('connect-sse')
const spawn = require('child_process').spawn;
var app = express()
const fs = require('fs');
var mp3Duration = require('mp3-duration');
var mm = require('musicmetadata');

var cors= require('cors');
var songJson
var flag=0;
var songToPlay="";

app.use(cors());


function objSong(songname,data, vote) {
  this.songname = songname;
  this.data=[data];
  this.vote = vote;
  this.ip = [];
}



fs.readdir('./songfiles', (err, data) => {
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
});






app.post("/song/:id/vote", function(req, res) {
   var songnum=req.params.id;
   if (songJson[songnum].ip.indexOf(req.connection.remoteAddress) == -1) {
   songJson[songnum].vote+=1;
   songJson[songnum].ip.push(req.connection.remoteAddress);
   res.json(songJson[songnum]);
  if(flag==0){
   playNextSong();
   flag=1;
   }
   }
   else{
   res.json("you already voted");}
});

app.get("/votes",function(req, res) {
  return res.json(songJson.map(function( v) { return v.vote }));
});

app.get("/song",function(req, res) {
  return res.json(songJson.map(function( v) { return v.songname }));
});


app.get("/data",function(req, res) {
  return res.json(songJson.map(function( v) { return v.data }));
});


app.get("/songtoplay",function(req, res) {
  return res.json(songToPlay);
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
songJson[i].ip=[];
console.log("./songfile/"+songJson[i].songname);
mp3Duration("./songfiles/"+songJson[i].songname, function (err, duration) {
  if (err) return console.log(err.message);
  //spawn("ffplay", [ "-autoexit", "-t" , duration , "./songfiles/"+songJson[i].songname]);
  songToPlay=	"./songfiles/"+songJson[i].songname;
  console.log('Your file is ' + duration + ' seconds long');
    setTimeout(playNextSong,duration*1000);

});               


}

app.listen(3000)

