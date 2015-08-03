// var Categories = new PouchDB('categories');

// Categories.insert = function(doc){
// 	doc._id = new Date().toISOString();

// 	return Categories.put(doc);
// }

// Categories.insertTabToCat = function(cat, tab){

// }

function resetStorage(){
	chrome.storage.sync.set({categories: {}}, function(){
		console.log('storage reseted.')
	})	
}

function getTabsUrls(callback){
	var urls = [];

	chrome.tabs.query({}, function(tabs){
		_.each(tabs, function(tab){
			if(tab.url) urls.push({ tabId: tab.id, url: tab.url });
		});
		
		callback(urls);
	});
}

function openTab(url){
	chrome.tabs.create({ url: url });
}

function saveCurTabsToCat(cat, callback){
	getTabsUrls(function(tabs){
		chrome.storage.sync.get('categories', function(cats){
			cats = cats ? cats['categories'] : {};
			cats[cat] = tabs;
			console.log(cat);

			chrome.storage.sync.set({ categories: cats }, function(){
				callback(tabs);
			});
		});
	});
}

function openTabsFromCat(category){
	chrome.storage.sync.get('categories', function(cats){
		var tabs = cats['categories'][category];

		if(tabs){
			for(var i = 0, count = tabs.length; i < count; i++){
				openTab(tabs[i].url);
			}
		}
	});
}

function closeTabs(tabs){
	chrome.tabs.create({});

	for(var i = 0, count = tabs.length; i < count; i++){
		chrome.tabs.remove(tabs[i].tabId);
	}	
}

function getCatsNameList(callback){
	var cats = chrome.storage.sync.get('categories', function(cats){
		cats = cats['categories'];

		if(cats) callback(_.keys(cats)); 
	});
}

function renderListOfCats(){
	var lis = '';
	
	getCatsNameList(function(cats){
		_.each(cats, function(cat){
			lis += '<li class="category">'+ cat +'</li>';
		});

		$('#archive-list').html(lis);
		appendOpenTabsEvent();
	});
}

function appendOpenTabsEvent(){
	var catsLists = $('.category');
	catsLists.on('click', function(){
		openTabsFromCat($(this).text());
	});	
}

$(function(){
	var agroupBtn = $('#agroup-btn');
		
	agroupBtn.on('click', function(){
		var cat = prompt("Qual o nome da categoria?");
		saveCurTabsToCat(cat, function(tabs){
			var shouldClose = confirm('Fechar abas atuais para começar novo trabalho?');

			if(shouldClose) closeTabs(tabs);
		});
	});

	chrome.storage.onChanged.addListener(function(){
		renderListOfCats();
	});	

	// Init
	renderListOfCats();
	appendOpenTabsEvent();
});