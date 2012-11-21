//Collections go here

//The exercises
Exercises = new Meteor.Collection('exercises');

//The exams
Exams = new Meteor.Collection('exams');

//The Courses
Courses = new Meteor.Collection('courses');

//The answers given by players
Answers = new Meteor.Collection('answers');

function Exercise (ex_set, number, letter, title, text, points) {
	this.set_id = ex_set; //the id of the exercise set this belongs to
	this.number = number;
	this.letter = letter;
	this.text = text;
	this.title = title;
	this.points = points;
}

function Exercise_set(course, title, year) {
	this.courseId = course; //The id of the course this set belongs to
	this.title = title;
	this.year = year;
	this.exercises = []; //The exercises id's that is a part of this set
	this.published = false;
}

// On server startup, create some exercises if the database is empty.
if (Meteor.isServer) {
	Meteor.startup(function () {
		if (Courses.find().count() === 0) {
			Exams.remove({});
			Courses.remove({});
			Exercises.remove({});
			mockCollection();
		}
		console.log('Server starting');
		console.log(Exercises.find().count() + ' exercises in database');
		console.log(Exams.find().count() + ' exams in database');
		Exams.find().forEach( function(exam) {
			console.log(exam);
		});
		console.log(Courses.find().count() + ' courses in database');
		console.log(Meteor.users.find().fetch());
	});
}

var mockCollection = function () {

	var inf3331 = Courses.insert({title: 'INF3331'});
	var inf1000 = Courses.insert({title: 'INF1000'});
	var id = Exams.insert({courseId: inf3331, title: 'Exam', course: 'INF3331', year: 2012, published: true});
	Exams.insert({courseId: inf3331, title: 'Konteeksamen', course: 'INF3331', year: 2011, published: false});
	Exams.insert({courseId: inf1000, title: 'Exam', course: 'INF1000', year: 2010, published: true});

	var exercises = [];

	var text1 = 'Consider the following Python code:\n# !\/usr\/bin\/env python\nimport sys, random math\ndef compute(n, f):\n     i = 0; s = 0\n     while i &lt;= n:\n         s += f(random.random())\n         i += 1\n     return s\/n\nn = sys.argv[1] \nprint \'The average of %d random function evalsis %g\&quot; % (n,\\\ncompute(n, math.sin))\nThere are five errors inthis file - find them!\');';
var oppg1 = new Exercise(id, 1, null, 'Find five errors in this script', text1, 5);	
exercises.push(oppg1);

var text2 = 'Write a function that adds the current date to a filename. For example, calling\nthe function with the text \&quot;myfile\&quot; as argument results in the string\n\&quot;myfile.2010_08_22\&quot; being returned if the current date is August 22, 2010. \nHints: time, localtime, strftime, %d, %m, %Y.';
var oppg2 = new Exercise(id, 2, null, 'Annotate a filename with the current date', text2, 10);
exercises.push(oppg2);

var text3 = '\'You\'re a programmer at Foomatic Inc., where you\'ve been assigned to retrieve\nsome data from the internets. Being an expert Python programmer, you soon\nrealize that you could write a script to do the job for you, while you go\nskiing in the Norwegian mountains.\nUse urllib and HTMLParser (see appendices) to implement a function for\nretrieving data from the site\nhttp:\/\/www.foobar.net\/value_feed.html\nThe data to be retrieved is in the following HTML format:\n&lt;!DOCTYPE html PUBLIC \&quot;-\/\/W3C\/\/DTD XHTML 1.0 Transitional\/\/EN\&quot;\n  \&quot;http:\/\/www.w3.org\/TR\/xhtml1\/DTD\/xhtml1-transitional.dtd\&quot;&gt;\n&lt;html xmlns=\&quot;http:\/\/www.w3.org\/1999\/xhtml\&quot;&gt;\n&lt;head&gt;\n&lt;title&gt;Foobar valuable information&lt;\/title&gt;\n&lt;link rel=\&quot;stylesheet\&quot; href=\&quot;..\/default.css\&quot; type=\&quot;text\/css\&quot;&gt;\'';
var oppg3 = new Exercise(id, 3, null, 'Data retrieval', text3, 13);
exercises.push(oppg3);

for (var i = 0; i < exercises.length; i++)
	Exercises.insert(exercises[i]);
} //End mockCollection