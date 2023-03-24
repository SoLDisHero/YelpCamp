const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync.js");
const Campground = require("../models/campground.js");
const {
  isLoggedIn,
  isAuthor,
  validateCapmground,
} = require("../middleware.js");
const { populate } = require("../models/campground.js");
const campgrounds = require("../controllers/campgrounds.js");
const multer = require("multer");
const { storage } = require("../cloudinary/index.js");
const upload = multer({ storage });

router
  .route("/")
  .get(catchAsync(campgrounds.index))
  .post(
    isLoggedIn,
    upload.array("image"),
    validateCapmground,
    catchAsync(campgrounds.createCampground)
  );
// .post(upload.single("image"), (req, res) => {
//   console.log(req.body, req.file);
//   res.send("Working");
// });
router.get("/new", isLoggedIn, campgrounds.renderNewForm);
router
  .route("/:id")
  .get(catchAsync(campgrounds.showCampground))
  .put(
    isLoggedIn,
    isAuthor,
    upload.array("image"),
    validateCapmground,
    catchAsync(campgrounds.updateCampground)
  )
  .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));
//all campgrounds

//router.get("/", catchAsync(campgrounds.index));

//create a campground

// router.get("/new", isLoggedIn, campgrounds.renderNewForm);

// router.post(
//   "/",
//   isLoggedIn,
//   validateCapmground,
//   catchAsync(campgrounds.createCampground)
// );

//one campground

//router.get("/:id", catchAsync(campgrounds.showCampground));

//edit and update our campground

router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(campgrounds.renderEditForm)
);

// router.put(
//   "/:id",
//   isLoggedIn,
//   isAuthor,
//   validateCapmground,
//   catchAsync(campgrounds.updateCampground)
// );

//delete

// router.delete(
//   "/:id",
//   isLoggedIn,
//   isAuthor,
//   catchAsync(campgrounds.deleteCampground)
// );

module.exports = router;
