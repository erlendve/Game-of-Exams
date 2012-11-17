//default options
$.pnotify.defaults.delay = 7000;

var notifyStandard = function (title, text, type) {
	$.pnotify({
      title: title,
      text: text,
      type: type,
    });
}

//data is the dictionary with title, text etc...
var notifyCustom = function(data) {
	$.pnotify(data);
}