
const express = require('express');
const route = express.Router();
const Employee = require('../model/employee');

// Create Employee
route.post('/', async (req, res) => {
  try {
    const employee = await Employee.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: employee
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = route;
