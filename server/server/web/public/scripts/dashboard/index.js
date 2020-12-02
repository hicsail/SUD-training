const startQuiz = function(userId) {	
	$.ajax({
    type: 'PUT',
    data: {trainingCompleted: true},
    url: '/api/users/trainingCompleted/' + userId,    
    success: function (result) {
      window.location = '/dashboard/quiz';
    },
    error: function (result) {
      errorAlert(result.responseJSON.message);
    }
  });
}
