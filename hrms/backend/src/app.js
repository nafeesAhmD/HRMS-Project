
const express = require('express')

const app = express()
app.use(express.json()) 

const employeeRoute = require('./route/route')
const departmentRoute = require('./route/departmentRoute.js')


app.use('/api/employee', employeeRoute)
app.use('/api/departments', departmentRoute)


module.exports = app