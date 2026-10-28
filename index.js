require("dotenv").config();
const dns = require('node:dns');
const express = require('express');
const app = express()
const port = process.env.PORT

const dbConfiguration = require('./configurations/dbConfiguration')
const router = require('./routes/index')

dbConfiguration()
app.use(router)





app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})