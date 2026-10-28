const mongoose = require('mongoose')

function dbConfiguration () {
    mongoose.connect(process.env.DB_URL).then(()=> {
        console.log('Database connected')
    }).catch((error)=> {
        console.log(`Error:${error}`)
    })
}

module.exports = dbConfiguration