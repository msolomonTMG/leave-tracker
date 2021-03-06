const Airtable = require('airtable')
const base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BASE_ID)

module.exports = {
  getRecordsFromView (tableName, retrievalOptions) {
    console.log('getting airtable records')
    return new Promise((resolve, reject) => {
      
      let recordsToReturn = []

      base(tableName).select(retrievalOptions).eachPage(function page(records, fetchNextPage) {
        records.forEach(record => {
          recordsToReturn.push(record)
        })
        fetchNextPage()
      }, function done(err) {
        if (err) { console.error(err); return reject(err); }
        return resolve(recordsToReturn)
      })
      
    })
  },
  getOneRecord (tableName, recordId) {
    return new Promise((resolve, reject) => {
      base(tableName).find(recordId, (err, record) => {
        if (err) { console.error(err); return reject(err); }
        return resolve(record)
      })
    })
  },
  updateRecord (tableName, recordId, updateOptions) {
    return new Promise((resolve, reject) => {
      base(tableName).update(recordId, updateOptions, (err, record) => {
        if (err) { console.error(err); return reject(err); }
        return resolve(record)
      })
    })
  },
  createRecord (tableName, recordOptions) {
    return new Promise((resolve, reject) => {
      base(tableName).create(recordOptions, (err, record) => {
        if (err) { console.error(err); return reject(err); }
        return resolve(record)
      })
    })
  },
  deleteRecord (tableName, recordId) {
    return new Promise((resolve, reject) => {
      base(tableName).destroy(recordId, (err, record) => {
        if (err) { console.error(err); return reject(err); }
        return resolve(record)
      })
    })
  }
}
