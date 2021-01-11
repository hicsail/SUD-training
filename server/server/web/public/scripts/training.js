const startQuiz = function(userId, moduleId) {	
  $.ajax({
    type: 'PUT',
    data: {trainingCompleted: true},
    url: '/api/users/trainingCompleted/' + userId,    
    success: function (result) {
      window.location = '/quiz/' + moduleId;
    },
    error: function (result) {
      errorAlert(result.responseJSON.message);
    }
  });
}