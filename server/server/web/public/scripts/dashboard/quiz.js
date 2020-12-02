function updateAnswer(questionId, answerIndex) {

  const data = {questionId: questionId, answerIndex: answerIndex};
  $.ajax({
    type: 'POST',
    url: '/api/update/user-answer',
    data: data,    
    success: function (result) {
      //window.location = '/dashboard';
    },
    error: function (result) {
      errorAlert(result.responseJSON.message);
    }
  });
}

function submit(userId) {  
  $.ajax({
    type: 'PUT',
    url: '/api/users/quizCompleted/' + userId,
    data: {quizCompleted: true},        
    success: function (result) {
      window.location = '/dashboard/quiz';          
    },
    error: function (result) {
      errorAlert(result.responseJSON.message);
    }
  });   
}
