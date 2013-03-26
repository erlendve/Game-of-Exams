//Collections go here

//The exercises
Exercises = new Meteor.Collection('exercises');

//The exams
Exams = new Meteor.Collection('exams');

//The Courses
Courses = new Meteor.Collection('courses');

//The answers given by players
Answers = new Meteor.Collection('answers');

//Data about users, specifically related to their scores, badges etc.
Players = new Meteor.Collection('players');

Languages = new Meteor.Collection('languages');

//Answers for solved exercises
Solutions = new Meteor.Collection('solutions');

///////// Allow & deny rules ////////
Answers.allow({
	insert: function (userId, doc) {
    	// the user must be logged in, and the document must be owned by the user
    	// return (userId && doc.owner === userId);
    	return false;
    },
    update: function (userId, docs, fields, modifier) {
        return false;
    	// // can only change your own documents
    	// return _.all(docs, function(doc) {
    	// 	return doc.userId === userId;
    	// });
    },
    remove: function (userId, docs) {
    	// can only remove your own documents
    	return _.all(docs, function(doc) {
           return doc.userId === userId;
       });
    },
    fetch: ['userId']
});

Answers.deny({
	// update: function (userId, docs, fields, modifier) {
 //    	// can't change owners
 //    	return _.contains(fields, 'owner');
 //    },
 //    remove: function (userId, docs) {
 //   		// can't remove locked documents
 //   		return _.any(docs, function (doc) {
 //   			return doc.locked;
 //   		});
 //   	},
 //  fetch: ['locked'] // no need to fetch 'owner'
});

if (Meteor.isServer) {
    (function() {
        var green = {
            'insert': function() {
                return Meteor.user() && Meteor.user().isAdmin;
            },
            'update': function() {
                return Meteor.user() && Meteor.user().isAdmin;
            },
            'remove': function() {
                return Meteor.user() && Meteor.user().isAdmin;
            }   
        }
        Exercises.allow(green);
        Exams.allow(green);
        Courses.allow(green);
        Players.allow(green);
        Answers.allow(green);
        Solutions.allow(green);
        Meteor.users.allow(green);
    })();
}