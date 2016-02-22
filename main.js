var serverIp='http://jukebox.cmc.im';
var serverPort= 80;
var voteValue=[];

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
	httpGetAsync(serverIp+":"+serverPort+"/votes",updateVotes);
}


function getSongs(){
    httpGetAsync(serverIp+':'+serverPort+'/data',updateSongs);
}

function voteSong(songnum){
console.log(songnum);

	
setTimeout(getVotes, 300);
httpPostAsync(serverIp+':'+serverPort+'/song/'+songnum+'/vote',null)


}

function updateVotes(votes){
	voteValue=votes;
	 localUpdate();	

	
}

function updateSongs(songs){
	for (var i =0 ; i < songs.length; i++) { 
		 console.log(songs[i][0][0]);
		 var $input = $('  <div ><input type="button" value="new button" onclick="calculate(event);" /> <input type="text" disabled /></div>');
		 $input.children(":first").attr('value', songs[i][0][0] + " - " +songs[i][0][1] );
		 $input.children(":first").attr('id',i);
		 $input.children(":last").attr('value', 0 );
		 $input.attr('num',i);
	     $input.attr('score',0).show();
         $input.attr('value', songs[i][0][0]);
         $input.appendTo($(".clist"));
		
		
	}
}





function calculate(event) {
	var num=event.target.id;
	voteSong(num);
	//updateList();
	

}
$(document).ready(function(){
$('#box').keyup(function(){
   var valThis = $(this).val().toLowerCase();
    if(valThis == ""){
        $('.clist > div').show();           
    } else {
        $('.clist > div').each(function(){
            var text = $(this).children(":first").attr('value').toLowerCase();
            (text.indexOf(valThis) >= 0) ? $(this).show() : $(this).hide();
        });
   };
});
	});



function localUpdate(){
	for (var i =0 ; i < voteValue.length; i++) { 
	$( "#"+i ).parent().children(":last").attr('value', voteValue[i]);	
	$( "#"+i ).parent().attr('score',voteValue[i]);}
	console.log($(".clist"));
	
		$('.clist div').sort(function(a,b) {
		
			var an = parseInt(a.getAttribute('score'));
		    var bn = parseInt(b.getAttribute('score'));
		    var cn = parseInt(a.getAttribute('num'));
		    var dn = parseInt(b.getAttribute('num'));

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
	
}).appendTo('.clist');	
	
	
}

getSongs();
getVotes();
longPoll=window.setInterval(getVotes,5000);
