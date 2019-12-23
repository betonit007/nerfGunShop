const layout = require('../layout');

const getError = (errors, prop) => { //helper function for errors

  if (errors === '!confirmation' && prop === 'passwordConfirmation') {  //hack for check.custom method error
    return 'Passwords do not match';
  }

  try {
    return errors.mapped()[prop].msg;
  } catch (error) {
    return '';
  }
}

module.exports = ({ req, errors }) => {

  return layout({
    content: `
    <div>
      Your id is: ${req.session.userId}
      <form method='POST'>
        <input name='email' placeholder='email'/>
        ${getError(errors, 'email')}
        <input name='password' placeholder='password'/>
        ${getError(errors, 'password')}
        <input name='passwordConfirmation' placeholder='password confirmation'/>
        ${getError(errors, 'passwordConfirmation')}
        <button>Sign UP</button>
      </form>
    </div>
  `
  })
}