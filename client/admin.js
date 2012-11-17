Template.admin.events({

  //TODO make confirmation box if the course has any content
  'click .course_delete': function(e) {
    var course = Courses.findOne({_id: this._id});
    Courses.remove(
      {_id: this._id}, 
      notifyCustom({title: 'Removed course' + course.title, text: 'The course <strong>' + course.title + '</strong> has been removed from the database', type: 'error', icon: 'icon-trash'})
      );
  }, 

  'click .course-edit': function(e) {
    e.preventDefault();
    var h3 = $("#" + this._id + ' h3');
    replaceWithInput(h3, this, courseEditTitle);
  },

  'click .add_new_exam': function() {
    // alert('Totally wanna add an exam right here');
  },

  'click .exam_delete': function(e) {
    var exam = Exams.findOne({_id: this._id});
    Exams.remove(
      {_id: this._id}, 
      notifyCustom({title: 'Removed ' + exam.title + ' ' + exam.year, text: '<strong>' + exam.title + '</strong> has been removed from the database', type: 'error', icon: 'icon-trash'})
      );
  }, 

  'click .publish-exam-toggle': function(e) {
    var self = this;
    Exams.update(this._id,
      {$set: {published: !this.published}}, 
      //callback
      function () {
        //if published is true it just changed to false
        if (self.published) {
          notifyCustom({title: 'Published ' + self.title, text: self.title + ' ' + self.year + ' is now available to all users who subscribes to course ' + self.course 
            + '. You should be careful with changes on this set from now on.',
            type: 'success', icon: 'icon-eye-open'});
        } else {
          notifyCustom({title: 'Unpublished ' + self.title, text: self.title + ' ' + self.year + ' is not available to users anymore ' 
            + '. You can publish later if you want.',
            type: 'success', icon: 'icon-eye-close'});
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
    var title = $('#input_course_title').val();
    Courses.insert({title: $('#input_course_title').val()});
    //TODO move this so it's called after the actual database insert
    notifyStandard('Added ' + title, 'New course <strong>' + title + '</strong> has been added to the database. Use the list below to add exams', 'success');
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

Template.admin_edit_exam.events({
  'click .exam-title-edit': function() {
    var h2 = $("#" + this._id + ' h2:first');
    replaceWithInput(h2, this, examEditTitle);
    return false;
  }, 

  'submit #form_new_exam': function(event) {
    var values = $('#form_new_exam').serializeArray();
    var res = {};
    for (var key in values) {
      var obj = values[key];
      res[obj.name] = obj.value;
      console.log(values[key].name);
    }
    res['published'] = false;

    Exams.insert(res, function(error, result) {
      if (result) {
        var course = Courses.findOne(res['courseId']);
        if (course)
          course = ' was added to the course <strong>' + course.title +'</strong>';
        else
          course = ' was added <span class="label">without a course</span>';

        notifyStandard('Added ' + res['title'], res['title'] + course, 'success');
        Router.navigate('/admin/' + result);
        Session.set('currentPage', 'admin');
        Session.set('adminContext', result);
      }
      if (error)
        notifyStandard('Could not add exam', 'Something went wrong \n Error message: ' + error, 'error');
    });
    console.log(res);
    return false;
  }
});

//Used to route to the edit exam view
Template.admin.edit = function () {
  var exam = Session.get('adminContext');
  // if adminContext is set return the exam to be edited
  if (exam) {
    if (exam === 'newexam') {
      return new Exercise_set();
    }
    var exam = Exams.findOne(exam);
    return exam;
  } else return false;
};

//////// Javascript helper functions ////////

//replace element with an input field that will send it's value to the callback function "onEnter"
function replaceWithInput(dom_element, context, onEnter) {
  var input = '<input type="text">';
  dom_element.replaceWith(input);
  var input = $('#' + context._id + ' input').focus().val(dom_element.text());
  //pressing enter will submit the valie in input
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

function examEditTitle(exam, newtitle) {
  //TODO ooops title + year bug
  Exams.update(exam._id, {$set: {title: newtitle}}, 
    notifyCustom({title: 'Edited exam ' + newtitle, text: 'The exam ' + exam.title + ' changed title to <strong>' + newtitle + '</strong>', type: "info", icon: "icon-edit"})
    );
}

function courseEditTitle(course, newtitle) {
  Courses.update(course._id, {$set: {title: newtitle}}, 
    notifyCustom({title: 'Edited course ' + newtitle, text: 'The course ' + course.title + ' changed title to <strong>' + newtitle + '</strong>', type: "info", icon: "icon-edit"})
    );
}