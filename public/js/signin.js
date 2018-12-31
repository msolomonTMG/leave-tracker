var provider = new firebase.auth.GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/userinfo.profile');

function signIn() {
  firebase.auth().signInWithPopup(provider).then(function(result) {
    // The signed-in user info.
    const user = result.user;
    console.log(result)
    if (!signInHelpers.isValidEmail(user.email)) {
      // not a valid user, sign them out and send them to login
      firebase.auth().signOut().then(function() {
        console.log('Signed Out');
        const error = 'Not a valid email for this application'
        window.location.href = `/signin?error=${error}`;
      }, function(error) {
        console.error('Sign Out Error', error);
      });
    } else {
      // valid user, proceed to store them in airtable
      // first check if they already exist in airtable...
      signInHelpers.getExistingAirtableUserByFirebaseUid(user.uid)
        .then(existingUser => {
          if (!existingUser) {
            signInHelpers.createNewAirtableUser(user)
              .then(newUser => {
                window.location.href = '/'
              })
          } else {
            // there was already a user, continue to redirect
            window.location.href = '/'
          }
        })
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

const signInHelpers = {
  isValidEmail (email) {
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
  },
  getExistingAirtableUserByFirebaseUid (firebaseUid) {
    return new Promise((resolve, reject) => {
      fetch(`/api/v1/user/getByFirebaseUid/${firebaseUid}`, {
        method: 'get'
      }).then((response) => {
        return response.json()
      }).then((existingUser) => {
        return resolve(existingUser)
      })
    })
  },
  createNewAirtableUser (user) {
    return new Promise((resolve, reject) => {
      fetch(`/api/v1/users`, {
        method: 'post',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: user.displayName,
          email: user.email,
          uid: user.uid
        })
      }).then((response) => {
        return response.json()
      }).then((userRecord) => {
        return resolve(userRecord)
      })
    })
  } 
}
