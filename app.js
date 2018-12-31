const express = require('express')
const exphbs = require('express-handlebars')
const bodyParser = require('body-parser')
const APP_URL = process.env.APP_URL || ''
const airtable = require('./airtable')

let app = express()
app.engine('handlebars', exphbs({defaultLayout: 'main'}))
app.set('view engine', 'handlebars')
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json())
app.use(express.static(__dirname + '/public'));
app.set('port', process.env.PORT || 3000)

// signin page
app.get('/signin', async function(req, res) {
  const error = req.query.error
  res.render('signin', {
    error: error
  })
})

// signout page
app.get('/signout', async function(req, res) {
  res.render('signout')
})

// create a new user in airtable
app.post('/api/v1/users', async function(req, res) {
  const newUser = await airtable.createRecord('Users', {
    'UID': req.body.uid,
    'Email': req.body.email,
    'Name': req.body.name
  })
  res.json(newUser)
})

// get a user from airtable via firebase uid
app.get('/api/v1/user/getByFirebaseUid/:uid', async function(req, res) {
  const existingUser = await airtable.getRecordsFromView('Users', {
    view: 'All Users',
    filterByFormula: `IF({UID} = "${req.params.uid}", TRUE(), FALSE())`,
    maxRecords: 1
  })
  if (existingUser.length === 0) {
    res.json(null)
  } else {
    res.json(existingUser[0])
  }
})

// create a new event
app.post('/api/v1/events', async function(req, res) {
  console.log(req.body)
  const newEvent = await airtable.createRecord('Dates', {
    'Name': req.body.name,
    'Date': req.body.date,
    'End': req.body.end,
    'Type': req.body.type,
    'Person': [req.body.personId]
  })
  console.log(newEvent)
  res.json(newEvent)
})

// delete an existing event
app.post('/api/v1/events/delete/:airtableId', async function(req, res) {
  const deletedRecord = await airtable.deleteRecord('Dates', req.params.airtableId)
  res.send(deletedRecord)
})

// update an existing event
app.post('/api/v1/events/:airtableId', async function(req, res) {
  console.log(req.body)
  console.log(req.params.airtableId)
  let updateFields = {}
  if (req.body.date) {
    updateFields['Date'] = req.body.date
  }
  if (req.body.end) {
    updateFields['End'] = req.body.end
  }
  console.log('updating event')
  console.log(updateFields)
  let updatedRecord = await airtable.updateRecord('Dates', req.params.airtableId, updateFields)
  res.send(updatedRecord)
})

// create a new person
app.post('/form/v1/person/create', async function(req, res) {
  // create person
  console.log(req.body)
  const newPerson = await airtable.createRecord('People', {
    'Name': req.body.personName,
    'Annual Salary': parseInt(req.body.annualSalary),
    'Number of Short Term Disability Days': parseInt(req.body.daysOnStd),
    'Number of PTO Days': parseInt(req.body.daysOnPto),
    'Leave Start Date': req.body.leaveStartDate,
    'Users': [req.body.userAirtableId]
  })
  res.redirect(`/${newPerson.id}`)
})

// update a person with a form to get redirected
app.post('/form/v1/person/update', async function(req, res) {
  const updatedPerson = await airtable.updateRecord('People', req.body.personId, {
    'Name': req.body.personNanme,
    'Annual Salary': parseInt(req.body.annualSalary),
    'Number of Short Term Disability Days': parseInt(req.body.daysOnStd),
    'Number of PTO Days': parseInt(req.body.daysOnPto),
    'Leave Start Date': req.body.leaveStartDate
  })
  res.redirect(`/${req.body.personId}`)
})

// update a person via api
app.post('/api/v1/person/:personId', async function(req, res) {
  let updateFields = {}
  if (req.body.date) {
    updateFields['Leave Start Date'] = req.body.date
  }
  const updatedPerson = await airtable.updateRecord('People', req.params.personId, updateFields)
  res.send(updatedPerson)
})

// get a person
app.get('/api/v1/person/:personId', async function(req, res) {
  const person = await airtable.getOneRecord('People', req.params.personId)
  res.json(person)
})

// get all available people for this user
// based on if their airtable user is linked to the person record
// uid param is the firebase user id
app.get('/api/v1/person/all/:uid', async function(req, res) {
  const user = await airtable.getRecordsFromView('Users', {
    view: 'All Users',
    filterByFormula: `IF({UID} = "${req.params.uid}", TRUE(), FALSE())`,
    maxRecords: 1
  })
  if (user.length === 0) {
    // we couldnt find an airtable user that matched provided uid
    res.json(null)
  } else {
    const people = await airtable.getRecordsFromView('People', {
      view: 'All People',
      filterByFormula: `IF(FIND("${req.params.uid}", {Users})>=1, TRUE(), FALSE())`,
      sort: [{field: 'Name', direction: 'asc'}]
    })
    res.json(people)
  }
})

app.get('/', async function(req, res) {
  res.render('dashboard')
})

app.get('/:personId', async function(req, res) {
  const person = await airtable.getOneRecord('People', req.params.personId)
  const holidays = await airtable.getRecordsFromView('Holidays', {
    view: 'All Holidays'
  })
  let airtableLeaveDays = await airtable.getRecordsFromView('Dates', {
    view: 'All Dates',
    filterByFormula: `IF({Person} = "${person.get('Name')}", TRUE(), FALSE())`
  })
  let unplannedEvents = []
  let plannedEvents = []
  let formattedHolidays = []
  // assemble available days to planned v unplanned
  for (const leaveDay of airtableLeaveDays) {
    const newEvent = {
      airtableId: leaveDay.id,
      personId: leaveDay.get('Person') ? leaveDay.get('Person')[0] : '',
      title: leaveDay.get('Name'),
      start: leaveDay.get('Date String'),
      end: leaveDay.get('End'),
      type: leaveDay.get('Type'),
      startEditable: true,
      durationEditable: true,
      color: '#05a3f2'
    }
    if (!leaveDay.get('Date String')) {
      unplannedEvents.push(newEvent)
    } else {
      plannedEvents.push(newEvent)
    }
  }
  
  // format holidays
  for (const holiday of holidays) {
    formattedHolidays.push({
      airtableId: holiday.id,
      title: holiday.get('Name'),
      start: holiday.get('Date String'),
      type: 'HOL',
      startEditable: false,
      durationEditable: false,
      color: '#D9D9D9'
    })
  }
  
  res.render('calendar', {
    encodedJson : encodeURIComponent(JSON.stringify({
      plannedEvents: plannedEvents,
      unplannedEvents: unplannedEvents,
      shortTermDisability: [{
        title: 'Short Term Disability',
        start: person.get('Short Term Disability Start Date String'),
        end: person.get('Short Term Disability End Date String'),
        durationEditable: false,
        startEditable: true,
        personId: person.id,
        type: 'STD',
        color: '#080f82',
        textColor: '#ffffff'
      }],
      holidays: formattedHolidays,
      person: person,
      appUrl: APP_URL
    })),
    person: person, // we also use person in the html template
  })
})

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
})

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'
module.exports = app
