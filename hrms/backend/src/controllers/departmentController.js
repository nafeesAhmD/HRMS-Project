const Department = require('../model/department');

exports.createDepartment = async (req, res) => {
  try {
    const { name, description, parentDepartment } = req.body;

    if (parentDepartment) {
      const parent = await Department.findById(parentDepartment);
      if (!parent) return res.status(404).json({ success: false, message: "Parent department not found" });
    }

    const exists = await Department.findOne({ name }).collation({ locale: "en", strength: 2 });
    if (exists) return res.status(409).json({ success: false, message: "Department already exists" });

    const dept = await Department.create({ name, description, parentDepartment: parentDepartment || null });
    res.status(201).json({ success: true, data: dept });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getDepartments = async (req, res) => {
  try {
    const data = await Department.find({ isActive: true })
      .populate("head", "employeeCode firstName lastName")
      .populate("parentDepartment", "code name")
      .sort({ name: 1 });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    const { name, description, head, parentDepartment, isActive } = req.body;

    // Department apna hi parent nahi ban sakta
    if (parentDepartment && parentDepartment === req.params.id) {
      return res.status(400).json({ success: false, message: "Department apna parent nahi ho sakta" });
    }

    const dept = await Department.findByIdAndUpdate(
      req.params.id,
      { name, description, head, parentDepartment, isActive },
      { new: true, runValidators: true, omitUndefined: true }
    );
    if (!dept) return res.status(404).json({ success: false, message: "Department not found" });

    res.json({ success: true, data: dept });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};