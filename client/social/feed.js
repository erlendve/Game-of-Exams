Template.feed.live = function() {
  //sort reverse hack
  //return Answers.find({saved: true}, {sort: {$natural:-1}}).fetch().reverse();
  return Answers.find().fetch().reverse();
}

Template.feed.rendered = function() {
  $('code').each(function(i, e) {hljs.highlightBlock(e)});
};