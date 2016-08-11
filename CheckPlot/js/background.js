// stop tracking on development
var prod_fg = true;

// listen to tab update
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	if (changeInfo.status == 'complete')
	{
		// execute script
		chrome.tabs.executeScript(tab.id, { file: "lib/jquery.js" }, function() {
			chrome.tabs.executeScript(tab.id, { file: "js/content.js" });
		});	
	}
});

// listen for incoming messages...
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    switch (message.method)
	{
		case "openTab":
		// loop tabs
		chrome.tabs.query({}, function (tabs) {
		
		//  retrieve referrer => active tab
		var activeTab = tabs.filter(function(item) {
			return item.active;
		});

		// ensure we don't double tab using title since link changes
		for(i = 0; i < message.data.length; i++)
		{	
		if(prod_fg)
		{
			ga('send', 'event', message.engine.toUpperCase(), 'link', message.data[i].url);			     	
		}
		// open tab
		chrome.tabs.create({ url: message.data[i].url });
		}

		// set referrer => active tab			
		chrome.tabs.update(activeTab[0].id, {active: true});		

		});
			break;	
		case "settings":
			if(prod_fg)
			{
	 			ga('send', 'event', message.engine.toUpperCase(), 'settings', (message.state == true ? 1 : 0));				
			}
			break;	
		case "pageview":
			if(prod_fg)
			{
    			ga('send', 'pageview', message.data);				
			}
			break;	
		case "localStorage":
    		// get local storage and return that to the other end
    		sendResponse({ data : JSON.parse(localStorage['engineOption']) });
 			break;		
	}
	return true;
});

// track installs
chrome.runtime.onInstalled.addListener(function(details){
    if(details.reason == "install")
    {
    	// log event
    	if(prod_fg)
    	{
	    	ga('send', 'event', 'extension', 'install');
    	}
    }
});


// Standard Google Universal Analytics code
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

// set-up google analytics
if(prod_fg)
{
	ga('create', 'UA-63538542-1', 'auto');
	ga('set', 'checkProtocolTask', function(){});
	ga('require', 'displayfeatures');
}

