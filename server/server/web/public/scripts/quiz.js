function updateAnswer(questionId, answerIndex, moduleId) {

  const data = {questionId: questionId, answerIndex: answerIndex};
  $.ajax({
    type: 'POST',
    url: '/api/update/user-answer',
    data: data,
    success: function (result) {
      $.ajax({//enable submit button if all questions are answered
        type: 'GET',
        url: '/api/user-answer/numQuestionAnswered/' + moduleId,
        success: function (result) {
          if (result.numQuestionsAnswered === result.numQuestions) {
            $("#submit").removeAttr("disabled");
          }
        },
        error: function (result) {
          errorAlert(result.responseJSON.message);
        }
      });
    },
    error: function (result) {
      errorAlert(result.responseJSON.message);
    }
  });
}

function submit(userId, moduleId) {
  $.ajax({
    type: 'PUT',
    url: '/api/users/quizCompleted/' + userId + '/' + moduleId,
    data: {quizCompleted: true},
    success: function (result) {
      window.location = '/quiz/' + moduleId;
    },
    error: function (result) {
      errorAlert(result.responseJSON.message);
    }
  });
}

function retake(userId, moduleId) {

  $.ajax({
    type: 'PUT',
    url: '/api/users/quizCompleted/' + userId + '/' + moduleId,
    data: {quizCompleted: false},
    success: function (result) {
      window.location = '/quiz/' + moduleId;
      /*$.ajax({//setting the active porperty of all the previous answers to false
        type: 'PUT',
        url: '/api/user-answer/active/' + moduleId,
        data: {active: false},
        success: function (result) {
          window.location = '/quiz/' + moduleId;
        },
        error: function (result) {
          errorAlert(result.responseJSON.message);
        }
      });   */
    },
    error: function (result) {
      errorAlert(result.responseJSON.message);
    }
  });
}
