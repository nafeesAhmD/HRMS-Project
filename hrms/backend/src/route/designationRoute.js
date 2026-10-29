
const router = require("express").Router();

const {
    createDesignation,
    getDesignations,
    updateDesignation
} = require("../controllers/designationController");

router.post("/", createDesignation);
router.get("/", getDesignations);
router.put("/:id", updateDesignation);

module.exports = router;
