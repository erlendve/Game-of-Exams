//Google analytics
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-37876151-1']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

Template.page.events = {
  //This is to prevent browser refresh, so the app does not have to load again.
  'click .goe-navlink': function(event) {
    // prevent default browser link click behaviour
    event.preventDefault();
    // get the path from the link        
    var reg = /.+?\:\/\/.+?(\/.+?)(?:#|\?|$)/;
    var pathname = reg.exec(event.currentTarget.href)[1];
    // route the URL 
    Router.navigate(pathname, true);
    //scroll to top the page
    $(document).scrollTop(0);
  }
}

Template.navbar.events({
  //humour?
  'dblclick #alpha': function() {
    konamiactivate();
  }, 

  'click #alpha': function(e) {
    e.preventDefault();
  }
});

//Bullshit konami code
function konamiactivate() {
  konami = new Konami()
  konami.code = function() {
    if (Meteor.user()) {
      alert('Konami code is awesome. One day this alert will be awesome too!');
    }
  }

  konami.load();
}

Template.page.rendered = function() {
  console.log('page rendered');
}

Template.page.navbar = function() {
  console.log('navbar rendered');
}