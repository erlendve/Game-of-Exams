//default options
$.pnotify.defaults.delay = 7000;

var notifyStandard = function (title, text, type, icon) {
	$.pnotify({
      title: title,
      text: text,
      type: type,
      icon: icon
    });
}

//data is the dictionary with title, text etc...
var notifyCustom = function(data) {
	$.pnotify(data);
}