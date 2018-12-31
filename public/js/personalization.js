firebase.auth().onAuthStateChanged(function(user) {
  console.log(user)
  let displayName = 'no name'
  let email = 'no email'
  let photoUrl = 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png'
  if (user) {
    // User is signed in.
    displayName = user.displayName
    email = user.email
    photoUrl = user.photoURL
    // var emailVerified = user.emailVerified;
    // var photoURL = user.photoURL;
    // var isAnonymous = user.isAnonymous;
    // var uid = user.uid;
    // var providerData = user.providerData;
    // ...
    $('#auth-text').text('Sign Out')
    $('#auth-icon').attr('src', 'https://cdnjs.cloudflare.com/ajax/libs/octicons/8.2.0/svg/sign-out.svg')
  } else {
    // User is signed out.
    // ...
    $('#auth-text').text('Sign In')
    $('#auth-icon').attr('src', 'https://cdnjs.cloudflare.com/ajax/libs/octicons/8.2.0/svg/sign-in.svg')
  }
  console.log(photoUrl)
  $(document).ready(function() {
    console.log('hello')
    $('#avatar').attr('src', photoUrl)
    $('#display-name').text(displayName)
  })
});
