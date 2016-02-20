var serverIp='http://jukebox.cmc.im';
var serverPort= 80;
var oldsong="";


function httpGetAsync(theUrl, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(JSON.parse(xmlHttp.responseText));
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}


function httpPostAsync(theUrl, data)
{    
    var xmlHttp = new XMLHttpRequest();
	xmlHttp.onload = function(){
		 var status = xmlHttp.status; // HTTP response status, e.g., 200 for "200 OK"
         var data = xmlHttp.responseText; // Returned data, e.g., an HTML document.	
	}
    xmlHttp.open("POST", theUrl, true); // true for asynchronous 
    xmlHttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xmlHttp.send(data);
}
  


function getSource(){
	httpGetAsync(serverIp+":"+serverPort+"/songtoplay",updateSource);
    setTimeout(getSource, 1000);
}







function updateSource(song) { 
	    if(song!="" && song != oldsong){
        var audio = document.getElementById('audio');

        var source = document.getElementById('mp3Source');
        source.src=song;
        
        audio.load(); //call this to just preload the audio without playing
        audio.play(); //call this to play the song right away
	    oldsong=song;		
		}
			

    }

getSource();