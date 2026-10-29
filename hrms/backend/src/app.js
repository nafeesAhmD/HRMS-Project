const express = require('express')
const cookieParser = require('cookie-parser')


const app = express()
app.use(express.json()) 
app.use(cookieParser())

const employeeRoute = require('./route/route')
const departmentRoute = require('./route/departmentRoute.js')
const designationRoute = require('./route/designationRoute.js');


app.use('/api/employee', employeeRoute)
app.use('/api/departments', departmentRoute)
app.use('/api/designation', designationRoute)


module.exports = app