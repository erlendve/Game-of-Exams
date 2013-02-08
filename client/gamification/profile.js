// ['100_ex_60_px_trans.png', '15_ex_60_px_trans.png', '50_ex_60_px_trans.png', 'all_the_code_ask_trans.png', 'all_the_code_trans.png', 'first_60_px_trans.png', 'python_1_60_px_trans.png', 'python_2_60_px_trans.png', 'python_3_60_px_trans.png']
// ['100_ex_60_px.png', '15_ex_60_px.png', '50_ex_60_px.png', 'all_the_code.png', 'all_the_code_ask.png', 'first_60_px.png', 'python_1_60_px.png', 'python_2_60_px.png', 'python_3_60_px.png']
Template.profile.achievements = function() {
  var user = Meteor.users.findOne({username: Session.get('subpage')});
  var trans = {'15points': '15_ex_60_px_trans.png','50points': '50_ex_60_px_trans.png','corporate': 'all_the_code_ask_trans.png','all_the_code': 'all_the_code_trans.png','one_exam': 'python_1_60_px_trans.png','two_exam': 'python_2_60_px_trans.png','three_exam': 'python_3_60_px_trans.png'};
  var normal = {'100points': '100_ex_60_px.png','15points': '15_ex_60_px.png','50points': '50_ex_60_px.png','all_the_code': 'all_the_code.png','corporate': 'all_the_code_ask.png','first': 'first_60_px.png','one_exam': 'python_1_60_px.png','two_exam': 'python_2_60_px.png','three_exam': 'python_3_60_px.png'};

  var res = trans;
  if (!user) {
    for (key in res) {
      res[key] = {image: trans[key], done: false};
    }
    return res;
  }

  var player = Players.findOne({userId: user._id});
  var ach = player.achievements;
  if (!ach) {
    var curr = []
    if (player.points >= 15)
      curr.push('15points');
    if (player.points >= 50)
      curr.push('50points');
    if (player.points >= 100)
      curr.push('100points');

    var complete_exams = 0;
    var h09 = Exams.findOne({year: '2009'})._id;
    var h10 = Exams.findOne({year: '2010'})._id;
    var h11 = Exams.findOne({year: '2011'})._id;

    if (Answers.find({userId: user, set_id: h09}).count() === 3)
      complete_exams += 1;
    if (Answers.find({userId: user, set_id: h10}).count() === 5)
      complete_exams += 1;
    if (Answers.find({userId: user, set_id: h11}).count() === 5)
      complete_exams += 1;

    console.log(complete_exams);
    if (complete_exams >= 1) {
      curr.push('one_exam');
    }
    if (complete_exams >= 2) {
      curr.push('two_exam');
    }
    if (complete_exams >= 3) {
      curr.push('three_exam');
    }

    if (Answers.findOne({userId: user, exercise_id: "0059de37-0954-4504-ab78-5f0b5a6086eb"}))
      curr.push('corporate');

    if (Answers.find({userId: user}).count() === 13)
      curr.push('all_the_code');

    Players.update({userId: user}, {$set: {achievements: curr, achievements_done: curr.length}});
  }
  ach = player.achievements;

  for (key in res) {
    res[key] = {image: trans[key], done: false};
  }

  for (i in ach) {
    res[ach[i]] = {image: normal[ach[i]], done: true};
  }
  // console.log(ach);
  // console.log(Players.findOne({userId: user}));

  // var reslist = []
  // for (key in res) {
  //   reslist.push(res[key]);
  // }
  return res;
}

Template.profile.getUser = function() {
  var name = Session.get('subpage');
  var user = Players.findOne({username: name});

  if (user) 
    return user;
  else 
    return false;
}