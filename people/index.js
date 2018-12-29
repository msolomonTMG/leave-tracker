const airtable = require('./airtable')

module.exports = {
  create (personOptions) {
    return new Promise((resolve, reject) => {
      airtable.createRecord('People', {
        'Name': personOptions.name,
        'Annual Salary': personOptions.salary
      })
    })
  }
}
