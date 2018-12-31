var provider = new firebase.auth.GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/userinfo.profile');

function signIn() {
  firebase.auth().signInWithPopup(provider).then(function(result) {
    // This gives you a Google Access Token. You can use it to access the Google API.
    var token = result.credential.accessToken;
    // The signed-in user info.
    var user = result.user;
    console.log(result.user)
    console.log(isValidEmail(result.user.email))
    if (!isValidEmail(result.user.email)) {
      // not a valid user, sign them out and send them to login
      firebase.auth().signOut().then(function() {
        console.log('Signed Out');
        const error = 'Not a valid email for this application'
        window.location.href = `/signin?error=${error}`;
      }, function(error) {
        console.error('Sign Out Error', error);
      });
    } else {
      // valid user, proceed
      window.location.href = '/'
    }
    // ...
  }).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // The email of the user's account used.
    var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    var credential = error.credential;
    // ...
  });
}

function isValidEmail (email) {
  const domain = email.split('@')[1]
  switch(domain) {
    case 'groupninemedia.com':
      return true
      break;
    case 'thrillist.com':
      return true
      break;
    case 'thedodo.com':
      return true
      break;
    case 'nowthisnews.com':
      return true
      break;
    default:
      return false
  }
}
