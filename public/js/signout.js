firebase.auth().signOut().then(function() {
  console.log('Signed Out');
  window.location.replace('/signin');
}, function(error) {
  console.error('Sign Out Error', error);
});
