var objEngine = {validEngine_fg: false, 
				 alias: 'itemIndx_' , 
				 engine:null, 
				 css:null, 
				 objModel: [],
				 hover: null
				};

// bootstrap search engine
bootstrapSearch();

$(document).ready(function() {

	// validate search engine
	if(objEngine.engine != null)
	{
		validateRequest();
	}
});

// validates request
function validateRequest()
{	
	// async operation
	chrome.runtime.sendMessage({data: null, method: "localStorage"}, function(response) {
  		
  		// get the option value
  		objEngine.validEngine_fg = returnOptionValue(objEngine.engine.toUpperCase(),response.data);

  		if(objEngine.validEngine_fg)
  		{
  			// may need to change this...
			setTimeout(prepareUI, 900);
  		}
	});
}

// returns option value for search engine
function returnOptionValue(key_tx, objStorage)
{
	var retval = null;

	if(typeof objStorage == 'undefined')
	{
		// undefined, default to false
		retval = false;
	}
	else{
		// filter to key
		var objFilter = $.grep(objStorage, function(v) {
		    return v.engine === key_tx;
		});	

		retval = objFilter[0].option;
	}
	return retval;
}

// populate css object
function populateCSS()
{	
	switch (objEngine.engine)
	{
		case "google":
			objEngine.css = ['h3.r','#ires','#navcnt'];
			objEngine.hover = 'div.rc';
			break;
		case "bing":
			objEngine.css = ['li.b_algo h2','#b_results:first','.b_pag:last'];
			objEngine.hover = 'li.b_algo';
			break;
		case "yahoo":
			objEngine.css = ['div#web h3.title','#main','.searchCenterFooter'];
			objEngine.hover = 'div.dd.algo.Sr';
			break;
		case "baidu":
			objEngine.css = ['h3.t','#content_left','#rs'];
			objEngine.hover = 'div.result.c-container';
			break;
	}
}

// prepares UI
function prepareUI(){

	// find results div and attach checkboxes next to each one...
	$('body').find(objEngine.css[0]).each(function(k,v){	
		$(this).find('a').each(function(k1,v1){
			objEngine.objModel.push({id: k, url: $(this).attr('href'), checked: false});
		});
		$("<input id='" + objEngine.alias + k + "' type='checkbox' class='checkBox' />")
		.prependTo($(this));
	});

	// top button
	$("<button title='Launch Tabs' class='btnOpenTab btn btnTab'>Fling</button><div class='cbtoggle lbl'><input type='checkbox' class='cbtoggleAll checkBox'/>Choose All&nbsp;<span class='cbCount'></span></div>").prependTo($(objEngine.css[1]));
	
	// bottom button
	$("<button title='Launch Tabs' class='btnOpenTab btn btnTab'>Fling</button>").prependTo($(objEngine.css[2]));
	
	// attach handlers to checkboxes
	$.each(objEngine.objModel, function(k,v)
	{
		$('#' + objEngine.alias + v.id).bind('click', toggleCheck);
	});

	// attach handlers to launch buttons
	$('.btnOpenTab').bind('click',prepareTabOpener);

	$('.cbtoggleAll').bind('click',toggleAll);

	// add fling button above each link
	$('body').find(objEngine.hover).each(function(k,v){
		$("<span title='Launch Tabs' style='visibility:hidden;' class='btnTab btnFling'>Fling</span>").prependTo($(this));
	});
	
	// attach mouseovers to div tag	
	// parent container before h3
	$('body').find(objEngine.hover).each(function(k,v){
		// attach handler to button
		$(this).find('span.btnFling').bind('click',prepareTabOpener);
		// attach mouseovers
		$(this).mouseover(function(){toggleVisibility($(this),'span.btnFling','visible');});
		$(this).mouseout(function(){toggleVisibility($(this),'span.btnFling','hidden');});	
	});
}

// toggles visibility state
function toggleVisibility(obj,elem,state)
{
	// get the selected element
	var objItemSelected = $(obj).find(elem);

	// all are hidden by default
	$('body').find('span.btnTab.btnFling').each(function(k,v){
		$(this).css('visibility','hidden');
	});

	// toggle visibility of selected element
	$(objItemSelected).css('visibility',state);
}

// handles toggle all checkbox
function toggleAll()
{
	// empty count
	$('.cbCount').html('');

	if($(this).is(':checked'))
	{
		// uncheck items
		toggleChkState(true);

		// display checkbox count
		displayCheckState(true);

	}
	else{		
		// check items
		toggleChkState(false);
	}	
}

// set data model check state
function toggleChkState(checked_fg)
{
	$.each(objEngine.objModel, function(k,v)
	{
		v.checked = checked_fg;
		$('#' + objEngine.alias + v.id).prop('checked',(checked_fg ? true : false));
	});
}

// displays count of checkbox state to user
function displayCheckState(state_fg)
{
	// filter to checked elements
	var objChecked = returnStateCount(state_fg);

	if(objChecked.length > 0)
	  {
		// count of checked items
		$('.cbCount').html('(' + objChecked.length + ' ' +  (objChecked.length > 1 ? 'items' : 'item') + ' selected)');	
	  }
}

// toggles checkbox state
function toggleCheck () 
{
	// empty count
	$('.cbCount').html('');
	
	var elemId = $(this).attr('id').split('_')[1];

	objEngine.objModel[elemId].checked = $('#' + objEngine.alias + elemId).is(':checked');

	// display checkbox count
	displayCheckState(true);

	//if # selected = # boxes (skip first) then autocheck, else don't
	$('.cbtoggleAll').prop('checked',(returnStateCount(true).length == $('.checkBox').length-1 ? true : false));
}

// returns state count
function returnStateCount(state_fg)
{
	// filter elements
	var obj = $.grep(objEngine.objModel, function(v) {
    	return v.checked === state_fg;
	});

	return obj;
}

// prepares tab launcher
function prepareTabOpener () 
{
	// filter to checked elements
	var objChecked = returnStateCount(true);

	if(objChecked.length < 1)
	{
		alert('Please check off at least one checkbox.');
	}
	else{
		// uncheck selected checkboxes to prevent duplicate tabs from opening
		$.each(objChecked, function(k,v)
		{
			// give user indicator they visited link
			$('#' + objEngine.alias + v.id).next('a').css('color','green');

			// uncheck it
			$('#' + objEngine.alias + v.id).prop('checked',false);
			
			// uncheck item in model
			v.checked = false;
		});

		// empty count
		$('.cbCount').html('');

		// re-calculate # of checked  
		displayCheckState(true);

		// notify background page to open tabs
		chrome.runtime.sendMessage({data: objChecked, method: 'openTab', engine: objEngine.engine});
	}
}

// determine search engine type
function bootstrapSearch()
{
	// analyze url for search engine type
	var url_tx = document.URL.toLowerCase();
	
	// exclude images from google search
	if((url_tx.indexOf('tbm=isch') == -1) && (url_tx.indexOf('google.') != -1 && url_tx.indexOf('search?q=') != -1) || (url_tx.indexOf('google.') != -1 && url_tx.indexOf('#q=') != -1) || (url_tx.indexOf('google.') != -1 && url_tx.indexOf('&q=') != -1))
	{
		objEngine.engine = "google";
	}
	else if((url_tx.indexOf('search.yahoo.') != -1 && url_tx.indexOf('?p=') != -1))
	{
		objEngine.engine = "yahoo";
	}
	else if((url_tx.indexOf('bing.com') != -1 && url_tx.indexOf('?q=') != -1))
	{
		objEngine.engine = "bing";
	}
	else if((url_tx.indexOf('baidu.com') != -1 && url_tx.indexOf('&wd=') != -1))
	{
		objEngine.engine = "baidu";
	}

	// populate css portion
	populateCSS();
}