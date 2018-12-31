/* 
 * each page that requiresAuth should rely on a function 
 * on the page called init()
 * to be called after the global user variable has been set
*/

var user // global user object
firebase.auth().onAuthStateChanged(function(authedUser) {
  if (authedUser) {
    // User is signed in, they can see this page
    user = authedUser // assign this user to the global user object
    init() 
  } else {
    // User is signed out, kick them to the signin page
    window.location.replace('/signin')
  }
});
