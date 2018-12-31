firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in, they can see this page
  } else {
    // User is signed out, kick them to the signin page
    window.location.replace('/signin')
  }
});
