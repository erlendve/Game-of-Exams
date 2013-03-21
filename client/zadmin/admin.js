Template.admin.events({
  //TODO make confirmation box if the course has any content
  'click .course_delete': function(e) {
  	var course = Courses.findOne({_id: this._id});
  	if (! confirm("Are you sure you want to delete course?")) {
  		return;
  	}
  	Courses.remove(
  		{_id: this._id}, 
  		notifyCustom({title: 'Removed course ' + course.title, text: 'The course <strong>' + course.title + '</strong> has been removed from the database', type: 'error', icon: 'icon-trash'})
  		);
  }, 

  'click .course-edit': function(e) {
  	e.preventDefault();
    // $('#' + this._id + ' h3').editable({
    //   title: 'New course title',
    //   placement: 'top',
    //   toggle: 'manual',
    // });
    // $('#' + this._id + ' h3').editable('toggle');
  },

  'click .exam_delete': function(e) {
  	var exam = Exams.findOne({_id: this._id});
  	if (! confirm("Are you sure you want to delete this set?")) {
  		return;
  	}

  	Exams.remove(
  		{_id: this._id}, 
  		notifyCustom({title: 'Removed ' + exam.title + ' ' + exam.year, text: '<strong>' + exam.title + '</strong> has been removed from the database', type: 'error', icon: 'icon-trash'})
  		);
  },

  'click .add-category': function() {
  	var self = this;
  	$('#modal_add_category_' + this._id).on('shown', function () {
  		$('#category_name_' + self._id).focus();
  		$('#category_name_' + self._id).bind('keypress', function(event) {
  			if (event.which == 13) {
  				event.preventDefault();
  				$('#btn_submit_category_' + self._id).click();
  			}
  		});

  	});

  	$('#modal_add_category_'+ this._id).on('hidden', function () {
  		$('form', this)[0].reset();
  		$(".add-category").blur();
  	});
  	return true;
  },

  'submit .form_addCategory': function(e) {
  	var catName = $('#category_name_'+ this._id).val();
  	var course = Courses.findOne(this._id);

  	//TODO make it possible to delete/edit categories etc.
  	var categories = course.categories;
  	if (!categories) {
  		categories = {};
  	}
  	categories[catName] = null;

  	//todo check if category already exists
  	Courses.update(this._id, {$set: {categories: categories}}, function() {
  		notifyCustom({title: 'Added ' + catName + ' to ' + course.title, text: 'The category ' + catName + ' was added to the course ' + course.title, type: 'info', icon: 'icon-edit'})
  	});
  	$('#modal_add_category_'+ this._id).modal('hide');
  	return false;
  },

  'click .publish-exam-toggle': function(e) {
  	var self = this;
    console.log(this);
    Exams.update(this._id,
      {$set: {published: !this.published}}, 
      //callback
      function () {
        //if published is false that means it just changed to unpublished
        if (self.published) {
        	notifyCustom({title: 'Published ' + self.title, text: self.title + ' ' + self.year + ' is now available to all users who subscribes to course ' + self.course 
        		+ '. You should be careful with changes on this set from now on.',
        		type: 'success', icon: 'icon-eye-open'});
        } else {
        	notifyCustom({title: 'Unpublished ' + self.title, text: self.title + ' ' + self.year + ' is not available to users anymore ' 
        		+ '. You can publish later if you want.',
        		type: 'info', icon: 'icon-eye-close'});
        }
        Exercises.find({set_id: self._id}).forEach(function(ex) {
          Exercises.update(ex._id, {$set: {published: self.published}})
        });
      });

    return false;
  },

  'click #add_new_course': function(e) {
  	$('#modal_add_course').on('shown', function () {
  		$('#input_course_title').focus();
  	});

  	$('#modal_add_course').on('hidden', function () {
  		$("#form_addCourse")[0].reset();
  		$("#add_new_course").blur();
  	});
  	return true;
  },

  'submit #form_addCourse': function(e) {
    var values = $('#form_addCourse').serializeArray()
    var res = {};
    for (var key in values) {
      var obj = values[key];
      res[obj.name] = obj.value;
    }

    Courses.insert({title: res['title'], description: res['description'], lang: res['lang'], createdAt: + (new Date()), owner: Meteor.userId()});
    //TODO move this so it's called after the actual database insert
    notifyStandard('Added ' + res['title'], 'New course <strong>' + res['title'] + '</strong> has been added to the database. Use the list below to add exams', 'success');
    $('#modal_add_course').modal('hide');
    return false;
  },

  'keypress #input_course_title': function(event) {
   if (event.which == 13) {
    event.preventDefault();
    $('#btn_submit_course').click();
  }
}
});

//Used to route to the edit exam view
Template.admin.edit = function () {
  var id = Session.get('subpage');
  var set = Exams.findOne(id);
  var course = Courses.findOne(id);
  if (set) {
    // console.log('existing set ' + set.title);
    return set;
  }
  if(course) {
    console.log('new exam on course ' + course.title);
    return {
      courseId: course._id, 
      published: false, 
      title: 'Rename me',
      exercises: [],
      createdAt: +(new Date()),
      owner: Meteor.userId(),
      description: 'Add set description',
      language: 'java7',
      category: 'main'
    }
  }
  return false;
 //  var id = Session.get('subpage');
 //  //set values for which categories can be edited
 //  if (id) {
 //   var set = Exams.findOne(id);
 //   if (set)
 //    return set;

 //  var course = Courses.findOne(id);
 //  if (course)
 //      //if a set with the title 'Rename me' already exists, return that one
 //    var set = Exams.findOne({courseId: course._id, title: 'Rename me'});
 //    if (set)
 //      return set;

 //    var newId = Exams.insert({
 //      courseId: course._id, 
 //      published: false, 
 //      title: 'Rename me', 
 //      createdAt: +(new Date()),
 //      owner: Meteor.userId(),
 //      description: 'Add set description',
 //      language: 'java7',
 //      category: 'main'
 //    });
 //    Session.set('subpage', newId);
 //  } else {
 //   return false;
 // }
};

/////// Template admin_set //////
Template.admin_set.helpers({
  'examTotalPoints': function() {
    var i = 0;
    Exercises.find({set_id: this._id}).forEach( function(exam) {
      i += exam.points;
    });
    return i;
  }
});

Template.admin_set.events({
  'click #btn-edit-set': function() {
    $('#savedSetHeader').addClass('fadeOutUp');
    Meteor.setTimeout(function() {
      $('.editron').css({'z-index': 1});
    }, 1000);
  },
  'click #btn-save-set': function() {
    var title = $('#set-title-edit').text().trim();
    var description = $('#set-description-edit').text().trim();
    
    //non-thourough validation
    if (title === 'Rename me') {
      alert("Please edit the set a title to something other than 'Rename me'");
      return;
    }

    if (description === 'Add set description') {
      alert("Please edit the set description to something other than 'Add set description'");
      return;
    }

    //visual effects
    $('.editron').css({'z-index': -1});
    $('#savedSetHeader').removeClass('fadeOutUp').addClass('fadeIn');
    
    var self = this;
    // if set exists update, else new insert
    if (this._id) {
      Exams.update(this._id, {$set: {title: title, description: description}}, 
        notifyCustom({title: 'Section ' + self.title + ' has changed', text: '<strong>Title: </strong>' + title + ' <br /><strong>Description:</strong> ' + description, type: "info", icon: "icon-edit"})
        );
    } else {
      var newEntry = this;
      newEntry.title = title;
      newEntry.description = description;
      var id = Exams.insert(newEntry, function(error, result) {
        notifyCustom({title: 'Section ' + title + ' saved', text: '<strong>Title: </strong>' + title + ' <br /><strong>Description:</strong> ' + description, type: "success", icon: "icon-plus-sign"})
        var setRes = result;
        Exercises.insert({
          set_id: result,
          number: 1,
          letter: '',
          text: '',
          title: 'Rename me',
          points: 5,
          createdAt: + (new Date),
          owner: Meteor.userId(),
          lang: this.lang,
          published: false
        }, function(error, result) {
          if (result) {
            Session.set('currentExercise', result);
            Exams.update(setRes, {$push: {exercises: result}});
          }
        });
      });
      Router.navigate('/admin/' + id, true);
      Session.set('subpage', id);
    }
  },
  'submit #set-form': function() {
    var values = $('#set-form').serializeArray();
    var res = {};
    for (var key in values) {
      var obj = values[key];
      res[obj.name] = obj.value;
    }

    //if set exists, update
    if (this._id) {
      Exams.update(this._id, {$set: {
        title: this.title, 
        description: this.description, 
        lang: res['language'],
        category: res['category'],
        modified: +(new Date()),
        modifiedBy: Meteor.userId()
      }});

      notifyCustom({title: 'Edited set ' + this.title, text: 'The set ' + this.title + ' has been modified', type: "info", icon: "icon-edit"})
      //else insert new set
    } else {
      var newSet = this;
      newSet['lang'] = res['language'];
      newSet['category'] = res['category'];
      var setId = Exams.insert(newSet);
      notifyStandard('Created set ' + newSet.title, 'Added ' + newSet.title + ' to course ' + Courses.findOne(this.courseId).title + ' under the category ' + res['category'], 'success');
      Session.set('editingSet', null);  Session.set('subpage', setId);
      // notifyCustom({title: 'Edited set ' + this.title, text: 'The set ' + this.title + ' has been modified', type: "success", icon: "icon-edit"})
    };

    return false;
  }
});

Template.admin_set.rendered = function () {
  //Make sure the editron is positioned under the jumbotron
  var outer = $('#savedSetHeader').offset().top;
  var margin = $('#savedSetHeader .container').css('margin-left');
  margin = margin.substring(0, margin.length - 2);
  $('.editron').css({
    'top': outer,
    'left': margin*2 + 'px',
    'margin-left': '-' + margin + 'px'
  })

  if (!this.data._id) {
    $('#btn-edit-set').click();
  }
  //X-editable on set  
  $('#set-title-edit').editable({
    placement: 'bottom',
    title: "Enter set title"
  });

  $('#set-description-edit').editable({
    mode: 'inline',
    title: 'Enter set description'
  });

  // var cur = Session.get('currentExercise');
}

//////// Javascript helper functions ////////
function examEditTitle(exam, newtitle) {
  //TODO ooops title + year bug
  Exams.update(exam._id, {$set: {title: newtitle}},
    notifyCustom({title: 'Edited section ' + newtitle, text: 'The section ' + exam.title + ' changed title to <strong>' + newtitle + '</strong>', type: "info", icon: "icon-edit"})
    );
}

function courseEditTitle(course, newtitle) {
  if(confirm('Are you sure you want to edit the course title from ' + course.title + ' to ' + newtitle)) {
   Courses.update(course._id, {$set: {title: newtitle}},
    notifyCustom({title: 'Edited course ' + newtitle, text: 'The course ' + course.title + ' changed title to <strong>' + newtitle + '</strong>', type: "info", icon: "icon-edit"})
    );
 }
};