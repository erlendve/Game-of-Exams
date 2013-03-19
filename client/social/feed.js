Template.feed.live = function() {
  //return Answers.find({saved: true}, {sort: {$natural:-1}}).fetch().reverse();
  return Answers.find({exercise_id: "b3ee729a-dbd2-4a38-a629-0c0410de9d50"}, {sort: {createdAt: 1}, limit: 20});
};

Template.feed.rendered = function() {
  $('code').each(function(i, e) {hljs.highlightBlock(e)});
};