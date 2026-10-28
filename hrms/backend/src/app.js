
const express = require('express')

const app = express()
app.use(express.json()) 

const employeeRoute = require('./route/route')
const departmentRoute = require('./route/departmentRoute.js')
const designationRoute = require('./model/designation.js')


app.use('/api/employee', employeeRoute)
app.use('/api/departments', departmentRoute)
app.use('/api/designation',  designationRoute)


module.exports = app