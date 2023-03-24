const express = require("express");
const router = express.Router({ mergeParams: true }); //all the params from app.js going to merge here
const {
  validateReview,
  isLoggedIn,
  isReviewAuthor,
} = require("../middleware.js");
const catchAsync = require("../utils/catchAsync.js");
const Campground = require("../models/campground.js");
const Review = require("../models/review.js");
const ExpressError = require("../utils/ExpressError.js");
const reviews = require("../controllers/reviews.js");
//reviews

router.post("/", isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  catchAsync(reviews.deleteReview)
);

module.exports = router;
