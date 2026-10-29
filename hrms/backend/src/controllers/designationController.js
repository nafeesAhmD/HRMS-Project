const mongoose = require("mongoose");
const Designation = require("../model/designation");
const Department = require("../model/department");

// Helper: department id valid hai aur DB mein exist karti hai?
const checkDepartment = async (department, res) => {
  if (!mongoose.isValidObjectId(department)) {
    res.status(400).json({ success: false, message: "Invalid department id" });
    return false;
  }
  const dept = await Department.findById(department);
  if (!dept) {
    res.status(404).json({ success: false, message: "Department not found" });
    return false;
  }
  return true;
};

// Common error handler
const handleError = (err, res) => {
  if (err.code === 11000) {
    return res.status(409).json({ success: false, message: "Designation already exists in this department" });
  }
  if (err.name === "ValidationError" || err.name === "CastError") {
    return res.status(400).json({ success: false, message: err.message });
  }
  return res.status(500).json({ success: false, message: err.message });
};

// POST /api/designations
exports.createDesignation = async (req, res) => {
  try {
     console.log("1. request aayi", req.body);
    const { title, description, department, level } = req.body;

    if (department && !(await checkDepartment(department, res))) return;

    const exists = await Designation.findOne({ title, department: department || null })
      .collation({ locale: "en", strength: 2 });
    if (exists) {
      return res.status(409).json({ success: false, message: "Designation already exists in this department" });
    }

    const designation = await Designation.create({
      title,
      description,
      department: department || null,
      level,
    });
    res.status(201).json({ success: true, data: designation });
  } catch (err) {
    handleError(err, res);
  }
};

// GET /api/designations?department=<id>
exports.getDesignations = async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.department) {
      if (!mongoose.isValidObjectId(req.query.department)) {
        return res.status(400).json({ success: false, message: "Invalid department id" });
      }
      filter.department = req.query.department;
    }

    const data = await Designation.find(filter)
      .populate("department", "code name")
      .sort({ level: -1, title: 1 });
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    handleError(err, res);
  }
};

// GET /api/designations/:id
exports.getDesignationById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid designation id" });
    }
    const designation = await Designation.findById(req.params.id).populate("department", "code name");
    if (!designation) {
      return res.status(404).json({ success: false, message: "Designation not found" });
    }
    res.json({ success: true, data: designation });
  } catch (err) {
    handleError(err, res);
  }
};

// PUT /api/designations/:id
exports.updateDesignation = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid designation id" });
    }

    const { title, description, department, level, isActive } = req.body;

    if (department && !(await checkDepartment(department, res))) return;

    const designation = await Designation.findByIdAndUpdate(
      req.params.id,
      { title, description, department, level, isActive },
      { new: true, runValidators: true }
    );
    if (!designation) {
      return res.status(404).json({ success: false, message: "Designation not found" });
    }
    res.json({ success: true, data: designation });
  } catch (err) {
    handleError(err, res);
  }
};