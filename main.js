var serverIp='http://jukebox.cmc.im';
var serverPort= 80;
var voteValue=[];
var CurrentSong;

function httpGetAsync(theUrl, callback)
{
    var xmlHttp = new XMLHttpRequest();
	xmlHttp.withCredentials = true;
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
	xmlHttp.withCredentials = true;

	xmlHttp.onload = function(){
		 var status = xmlHttp.status; // HTTP response status, e.g., 200 for "200 OK"
         var data = xmlHttp.responseText; // Returned data, e.g., an HTML document.	
	}
    xmlHttp.open("POST", theUrl, true); // true for asynchronous 
    xmlHttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xmlHttp.send(data);
}


function getVotes(){
	httpGetAsync(serverIp+":"+serverPort+"/api/votes",updateVotes);
}


function getSongs(){
    httpGetAsync(serverIp+':'+serverPort+'/api/data',updateSongs);
}

function checkVoted(){
    httpGetAsync(serverIp+':'+serverPort+'/api/votedfor',updateUI);
}


function getCurrentSong(){
 httpGetAsync(serverIp+':'+serverPort+'/api/songtoplay',updateCurrent);
}


function updateCurrent(formervotes){
		for (var i =0 ; i < formervotes.length; i++) {
			if(formervotes[i]==0){
				$( "#"+i ).attr("class","todo-done");
			}else{
				$( "#"+i ).attr("class","todo");
				
			}
	}

		
			


	
}


function updateCurrent(song){
	console.log(song);
	$("div.song").text( song );
	
	
	
}



function voteSong(songnum){
console.log(songnum);

	
setTimeout(getVotes, 300);
httpPostAsync(serverIp+':'+serverPort+'/api/song/'+songnum+'/vote',null)


}

function updateVotes(votes){
	voteValue=votes;
	 localUpdate();	

	
}

function updateSongs(songs){
	for (var i =0 ; i < songs.length; i++) { 
		 console.log(songs[i][0][0]);
		
		 var $input = $( '<li><div class="todo-icon ">0</div><div class="todo-content"></div></li>')
		 $input.on('click', calculate);
		 $input.attr('id',i);
		 $input.attr('value', songs[i][0][0]);
		 $input.children(":first").attr('score', 0 );
		 $input.children(":first").text( 0 );
         $input.children(":last").attr('value', songs[i][0][0] + " - " +songs[i][0][1] );
		
	
		$input.children(":last").append('<h4 class="todo-name">'+songs[i][0][0]+'</h4>'+songs[i][0][1]);
		 
         $input.appendTo($("#list ul"));
		
		
	}
}





function calculate(event) {
	$(this).attr("class","todo-done");
	var num=this.id;
	voteSong(num);
	//updateList();
	
}



$(document).ready(function(){
$('#box').keyup(function(){
   var valThis = $(this).val().toLowerCase();
    if(valThis == ""){
        $('.navList > li').show();           
    } else {
        $('.navList > li').each(function(){
           var text = $(this).children(":last").attr('value').toLowerCase();
            (text.indexOf(valThis) >= 0) ? $(this).show() : $(this).hide();
        });
   };
});
	});



function localUpdate(){
    getCurrentSong();

	for (var i =0 ; i < voteValue.length; i++) { 
			 	$( "#"+i ).children(":first").attr('score', voteValue[i]);
		        $( "#"+i ).children(":first").text( voteValue[i]);
				$( "#"+i ).attr('score', voteValue[i]);
		     
                if(voteValue[i]==0){
						$( "#"+i ).attr("class","todo");
				}
	}

	
		$('.navList li').sort(function(a,b) {
		
			var an = parseInt(a.getAttribute('score'));
		    var bn = parseInt(b.getAttribute('score'));
		    var cn = parseInt(a.getAttribute('id'));
		    var dn = parseInt(b.getAttribute('id'));

	if(an > bn) {
		return -1;
	}
	if(an < bn) {
		return 1;
	}
	if(an == bn) {
		if(cn > dn) {
			return 1;
	    }
	    if(cn < dn) {
			return -1;
		}
	
	}
	
}).appendTo('.navList');	
	
	
}

getSongs();
getVotes();
longPoll=window.setInterval(getVotes,5000);
