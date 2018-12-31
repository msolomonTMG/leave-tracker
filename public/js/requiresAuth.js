/* 
 * each page that requiresAuth should rely on a function 
 * on the page called init()
 * to be called after the global user variable has been set
*/

// global user object
var user

firebase.auth().onAuthStateChanged(function(authedUser) {
  if (authedUser) {
    // User is signed in, they can see this page
    
    // get airtable user data based on firebase user data
    fetch(`/api/v1/user/getByFirebaseUid/${authedUser.uid}`, {
      method: 'get'
    }).then((response) => {
      return response.json()
    }).then((airtableUserRecord) => {
      // set global user variable to airtable and firebase data
      authedUser.airtable = airtableUserRecord
      user = authedUser
      
      // run the page's init function once the document is ready
      $(document).ready(function() {
        init() 
      })
    })
  } else {
    // User is signed out, kick them to the signin page
    window.location.replace('/signin')
  }
});
