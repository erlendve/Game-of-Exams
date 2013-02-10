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
  	var h3 = $("#" + this._id + ' h3');
  	replaceWithInput(h3, this, courseEditTitle);
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
  	Exams.update(this._id,
  		{$set: {published: !this.published}}, 
      //callback
      function () {
        //if published is false that means it just changed to unpublished
        if (!self.published) {
        	notifyCustom({title: 'Published ' + self.title, text: self.title + ' ' + self.year + ' is now available to all users who subscribes to course ' + self.course 
        		+ '. You should be careful with changes on this set from now on.',
        		type: 'success', icon: 'icon-eye-open'});
        } else {
        	notifyCustom({title: 'Unpublished ' + self.title, text: self.title + ' ' + self.year + ' is not available to users anymore ' 
        		+ '. You can publish later if you want.',
        		type: 'info', icon: 'icon-eye-close'});
        }
      }
      );
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
  //if user is editing a set right now, return that set
  // var editing = Session.get('editingSet');
  // if (editing)
  //   return editing;

  var id = Session.get('subpage');
  //set values for which categories can be edited
  if (id) {
   var set = Exams.findOne(id);
   if (set)
    return set;

  var course = Courses.findOne(id);
  if (course)
    return {
     courseId: course._id, 
     published: false, 
     title: 'Rename me', 
     createdAt: +(new Date()),
     owner: Meteor.userId(),
     description: 'Add set description'
   }
 } else {
   return false;
 }
};

/////// Template admin_set //////
Template.admin_set.getCourse = function (fn) {
  //TODO Make this function return the categories a moderator is allowed to edit
  var course = Courses.findOne(this.courseId);
  if (course) {
    return fn.fn(course);
  }
  return false;
};

Template.admin_set.events({
  'click #set-title-edit': function() {
    var current = this;
    var h1 = $("#set-title-edit");
    replaceWithInput(h1, this, function(setId, newtitle) {
      current.title = newtitle;
      Session.set('editingSet', current);
    });
    return false;
  },
  // 'click #set-description-edit': function() {
  //   var current = this;
  //   var el = $("#set-description-edit");
  //   replaceWithInput(el, this, function(setId, newtitle) {
  //     current.description = newtitle;
  //     Session.set('editingSet', current);
  //   });
  //   return false;
  // },
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
  var lang = '';
  if (this.data.lang)
    lang = this.data.lang;
  else {
    var course = Courses.findOne(this.data.courseId);
    if (course) {
      lang = course.lang;
    } 
  }


  var opt = this.find('option[value="' + lang + '"]');
  if (opt) {
    $(opt).attr("selected","selected");
  } 

  //X-editable
  $('#set-description-edit').editable({
   type: 'text',
   pk: 1,
   url: '/post',
   title: 'Enter username'
 });
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


// replace element with an input field that will send it's value to the callback function "onEnter"
function replaceWithInput(dom_element, context, onEnter) {
	var input = '<input id="input-replace" class="input-xxlarge" type="text">';
	var ye = dom_element.replaceWith(input);
	var input = $('#input-replace').focus().val(dom_element.text());
  //pressing enter will submit the value in input
  input.on('keypress', context, function(event) {
  	if (event.which == 13) {
  		event.preventDefault();
  		onEnter(event.data, input.val());
  	}
  });
  //if input looses focus, hides input and shows original dom_element
  input.on('blur', function (event) {
  	input.replaceWith(dom_element);
  })
}