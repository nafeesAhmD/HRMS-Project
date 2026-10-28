const mongoose = require("mongoose");
const Counter = require("./Counter");

const designationSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true, uppercase: true, trim: true }, // DES-001
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 300 },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", default: null },
    level: { type: Number, min: 1, max: 10, default: 1 }, // 1 = junior ... 10 = top management
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Auto code: DES-001, DES-002...
designationSchema.pre("save", async function () {
  if (!this.isNew) return;
  const counter = await Counter.findByIdAndUpdate(
    "designation",
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  this.code = `DES-${String(counter.seq).padStart(3, "0")}`;
});

// Same department mein same title dobara nahi (case-insensitive)
designationSchema.index(
  { title: 1, department: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);

module.exports = mongoose.model("designation", designationSchema);