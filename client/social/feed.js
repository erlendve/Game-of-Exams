Template.feed.live = function() {
  //return Answers.find({saved: true}, {sort: {$natural:-1}}).fetch().reverse();

  return Solutions.find({visibility: 'public'}, {sort: {createdAt: 1}, limit: 20}).forEach(function(sol) {
  	sol['title'] = Exercises.findOne(sol.exerciseId);
  	return sol;
  });
};

Template.feed.rendered = function() {
	$('code').each(function(i, e) {hljs.highlightBlock(e)});
};