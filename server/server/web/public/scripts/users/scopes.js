'use strict';

$(document).ready(() => {
  $('.table').DataTable({
    scrollX: true,
    scrollY: '500px',
    scrollCollapse: true,
    stateSave: true,
    lengthChange: false,
    dom: 'Bfrtip',
    buttons: [
      'copy', 'csv', 'excel', 'pdf', 'print','colvis'
    ]
  });

  const msg = localStorage.getItem('modalMessage');//after refresh on scope update, get localStorage message for modal
  switch(msg){//switch through modal message received, if unconfigurable message then give an error alert and vice versa.
  case 'Unable to Update Route\'s scope':
    errorAlert(msg);
    break;
  case 'Updated Route\'s Scope':
    successAlert(msg);
    break;
  }
  localStorage.removeItem('modalMessage');
});

$('a[data-toggle="tab"]').on('shown.bs.tab', function(e){//adjusts the columns of the dataTable on switching between navTabs
  $($.fn.dataTable.tables(true)).DataTable().columns.adjust();
});

var success = false;
function updateScope(path, method, scope) {
  $.ajax({
    async: false,
    url: '/api/users/scopes',
    type: 'PUT',
    data: {
      method: method,
      path: path,
      scope: scope
    },
    success: function (result) {
      console.log("hereeee");
      success = true;
      /*$.ajax({//API route for comparing the scope for configurability in the config file and in server for the specified route's scope
        url: '/api/users/scopeCheck',
        type: 'POST',
        data: {
          method: method,
          path: path
        },
        success: function (result){          
          localStorage.setItem('modalMessage', result);
          //location.reload();
        },
        error: function (result){
          console.log(result)
          //errorAlert(result.responseJSON.message);
        },
        timeout: 9000000
      });*/
    },
    error: function (result) {
      errorAlert(result.responseJSON.message);
    },
    //timeout: 50000
  });

  

  function Arezoo() {
    console.log(success)
  if (success) {
    
  console.log("hereeee")
  $.ajax({//API route for comparing the scope for configurability in the config file and in server for the specified route's scope
        url: '/api/users/scopeCheck',
        type: 'POST',
        data: {
          method: method,
          path: path
        },
        async: false,
        success: function (result){ 
        console.log("salammm")         
          localStorage.setItem('modalMessage', result);
          location.reload();
        },
        error: function (result){
          console.log(result)
          //errorAlert(result.responseJSON.message);
        }        
      })
    
  }
}
window.setTimeout(Arezoo, 1000)
}
