(function () {
	function setupInjection(file) {
		var s = document.createElement('script');
		s.src = chrome.extension.getURL(file);
		var container = document.head || document.documentElement
		container.insertBefore(s, container.children[0])
		s.onload = function () { s.remove(); };
	}
	
	var file = 'inpage.js'
	setupInjection(file);
})();