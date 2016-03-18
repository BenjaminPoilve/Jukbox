var serverHost='';
var voteValue=[];
var CurrentSong;

//httpGetAsync(serverIp+':'+serverPort+'/api/actu',getVotes);

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
	httpGetAsync(serverHost+"/api/votes",updateVotes);
}

function getSongs(){
    httpGetAsync(serverHost+'/api/data',updateSongs);
}

function getVotedFor(){
 httpGetAsync(serverHost+'/api/votedfor',votedfor);
}

function votedfor(formervotes){
	console.log("formervotes", formervotes);
	$("li").attr("class", "");

	for (var i = 0; i < formervotes.length; i++) {
		$("#" + formervotes[i].song_id).attr("class", "todo-done");
			 /*console.log(formervotes[i]);
			if(formervotes[i]==0){
				$( "#"+i ).attr("class","todo-done");}
			if(formervotes[i]==1){
				$( "#"+i ).attr("class","");
				
			}*/
	}	
}


function getCurrentSong(){
 httpGetAsync(serverHost+'/api/songtoplay',updateCurrent);
}


function updateCurrent(song){
	console.log(song);
	$("div.song").text( song );
	
	
	
}



function voteSong(songnum){
console.log(songnum);
	setTimeout(getVotes, 300);
	httpPostAsync(serverHost+'/api/song/'+songnum+'/vote',null);
}

function updateVotes(votes){
	voteValue=votes;
	 localUpdate();	

	
}

function updateSongs(songs){
	console.log(songs);
	for (var i =0 ; i < songs.length; i++) { 
		 console.log(songs[i]);
		
		 var $input = $( '<li><div class="todo-icon ">0</div><div class="todo-content"></div></li>')
		 $input.on('click', calculate);
		 $input.attr('id', songs[i].id);
		 $input.attr('value', songs[i].vote);
		 $input.children(":first").attr('score', 0 );
		 $input.children(":first").text( 0 );
         //$input.children(":last").attr('value', songs[i].name + " - " +songs[i] );
		
	
		 $input.children(":last").append('<h4 class="todo-name">'+songs[i].name +'</h4>'+songs[i].artist);
		 
         $input.appendTo($("#list ul"));
		
		
	}
	
	getVotedFor();
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
			 	$( "#"+voteValue[i].id ).children(":first").attr('score', voteValue[i].vote);
		        $( "#"+voteValue[i].id ).children(":first").text( voteValue[i].vote);
				$( "#"+voteValue[i].id ).attr('score', voteValue[i].vote);
		     
                if(voteValue[i].vote == 0){
						$( "#"+ voteValue[i].id ).attr("class","");
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
longPoll=window.setInterval(getVotes, 500);
