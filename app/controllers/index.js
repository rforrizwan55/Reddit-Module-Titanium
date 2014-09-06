var reddit = require('reddit');
var redditmodule = new reddit.reddit({
	clientid:'6sJzdxRPXEATJw',
	redirecturi:'http://www.reddit.com',
	duration:'permanent',
	scope:'identity,edit,flair,history,modconfig,modflair,modlog,modposts,modwiki,mysubreddits,privatemessages,read,report,save,submit,subscribe,vote,wikiedit,wikiread',
	secretkey:'ViVMBd_c-3VKCFOM8TDcM7pcLds'
	});

function doClick(e) {
    redditmodule.PostReddit({title:'rizwan',sr:'test',kind:'self',text:'Hey how are you? this is test post from Titanium module'},function(e){
		
		Ti.API.info(e);
	});
}

$.index.open();
