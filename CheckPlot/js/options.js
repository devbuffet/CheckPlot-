// define our search engines
var objEngine = ['GOOGLE','YAHOO','BING','BAIDU'];

var objAlias = ['engineOption'];

var objModel = [];

$(document).ready(function() {

	// log page view
	chrome.runtime.sendMessage({data: "index.html", method: 'pageview'});

	// defaults
	$.fn.bootstrapSwitch.defaults.size = 'normal';
	$.fn.bootstrapSwitch.defaults.onColor = 'success';

	// transform checkboxes into switches
	$.each(objEngine, function(x,y)
	{
		// push into array
		objModel.push({engine:y,option:false});

		// get value from local storage
		$("#" + y).bootstrapSwitch('state', returnOptionValue(y));
		
		// attach handler
		$("#" + y).on('switchChange.bootstrapSwitch', function (event, state) {
	       updateLocalStorage(y,state);
		});
	});	
});

// updates local storage
function updateLocalStorage(key_tx,state)
{
	localStorage[objAlias] = null;

	// start with empty array
	var obj = [];

	// cursor through array options
	$.each(objEngine, function(x,y)
	{
		obj.push({engine:y,option:$("#" + y).bootstrapSwitch('state')});
	});

	localStorage[objAlias] = JSON.stringify(obj);

	// log that key changed state
	chrome.runtime.sendMessage({data: state, method: 'settings', engine: key_tx});

	// reload tabs
	chrome.tabs.query({}, function (tabs) {
    	$.each(tabs, function(k,v)
    	{	
    		if(isValidSearchEngine(v.url) != null)
    		{
    			chrome.tabs.reload(v.id);    			
    		}
    	});
	});
}

// determine search engine type
function isValidSearchEngine(tabUrl)
{
	var engine = null;

	// analyze url for search engine type
	var url_tx = tabUrl.toLowerCase();
	
	// exclude images from google search
	if((url_tx.indexOf('tbm=isch') == -1) && (url_tx.indexOf('google.') != -1 && url_tx.indexOf('search?q=') != -1) || (url_tx.indexOf('google.') != -1 && url_tx.indexOf('#q=') != -1) || (url_tx.indexOf('google.') != -1 && url_tx.indexOf('&q=') != -1))
	{
		engine = "google";
	}
	else if((url_tx.indexOf('search.yahoo.') != -1 && url_tx.indexOf('?p=') != -1))
	{
		engine = "yahoo";
	}
	else if((url_tx.indexOf('bing.com') != -1 && url_tx.indexOf('?q=') != -1))
	{
		engine = "bing";
	}
	else if((url_tx.indexOf('baidu.com') != -1 && url_tx.indexOf('&wd=') != -1))
	{
		engine = "baidu";
	}

	return engine;
}

// returns option value for search engine
function returnOptionValue(key_tx)
{
	var retval = null;

	if(typeof localStorage[objAlias] == 'undefined')
	{
		// undefined, default to false
		retval = false;
	}
	else{
		// filter to key
		var objFilter = $.grep(JSON.parse(localStorage[objAlias]), function(v) {
		    return v.engine === key_tx;
		});	
		retval = objFilter[0].option;
	}
	return retval;
}