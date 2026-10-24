const mongoose = require("mongoose");
const Counter = require("./Counter");

const departmentSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true, uppercase: true, trim: true }, // DEP-001
    name: { type: String, required: true, trim: true }, // unique yahan nahi, neeche index mein
    description: { type: String, trim: true, maxlength: 300 },
    head: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", default: null },
    parentDepartment: { type: mongoose.Schema.Types.ObjectId, ref: "Department", default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Auto code: DEP-001, DEP-002...
departmentSchema.pre("save", async function () {
  if (!this.isNew) return;
  const counter = await Counter.findByIdAndUpdate(
    "department",
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  this.code = `DEP-${String(counter.seq).padStart(3, "0")}`;
});

// Case-insensitive unique name (IT aur it dono na ban sakein)
departmentSchema.index(
  { name: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);

module.exports = mongoose.model("Department", departmentSchema);