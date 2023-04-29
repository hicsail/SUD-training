'use strict';

const schema = Joi.object({
  'First Name': Joi.string().required(),
  'Last Name': Joi.string().required(),  
  'Email Address': Joi.string().email().required(),
  'Password': Joi.string().required().min(8).regex(/^[A-Z]+[a-z]+[0-9]+$/, '1 Uppercase, 1 lowercase, 1 number'),
  'Confirm Password': Joi.string().required().min(8).regex(/^[A-Z]+[a-z]+[0-9]+$/, '1 Uppercase, 1 lowercase, 1 number')
});
joiToForm('formFields',schema);

$('#create').click((event) => {
  event.preventDefault();
  const values = {};
  $.each($('#form').serializeArray(), (i, field) => {
    values[field.name] = field.value;
  });
  console.log(values['password'], values['confirmpassword'])
  if(values['password'] === values['confirmpassword']) {
    delete values['confirmpassword'];
    $.ajax({
      type: 'POST',
      url: '/api/users',
      data: values,
      success: function (result) {
        window.location = '/users'
      },
      error: function (result) {
        errorAlert(result.responseJSON.message);
      }
    });
  } else {
    errorAlert('Passwords do not match');
  }
});
