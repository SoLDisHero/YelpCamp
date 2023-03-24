const Campground = require("../models/campground.js");
const { cloudinary } = require("../cloudinary/index.js");

const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res, next) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index.ejs", { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/new.ejs");
};

module.exports.createCampground = async (req, res, next) => {
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.campground.location,
      limit: 1,
    })
    .send();

  // if (!req.body.campground) throw new ExpressError("Invalid Data", 400);
  const campground = new Campground(req.body.campground);
  campground.geometry = geoData.body.features[0].geometry;
  campground.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  campground.author = req.user._id; //update author name after logged in
  await campground.save();
  console.log(campground);
  req.flash("success", "Successfully made a new campground!");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampground = async (req, res, next) => {
  const id = req.params.id;
  const campground = await Campground.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("author");
  console.log(campground);
  if (!campground) {
    req.flash("error", "Can't find the campground");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/show.ejs", {
    campground,
    //msg: req.flash("success"), // for showing msg of flash
  });
};

module.exports.renderEditForm = async (req, res, next) => {
  const id = req.params.id;
  const campground = await Campground.findById(id);
  if (!campground) {
    req.flash("error", "Can not find the campfround");
    return res.redirect("/campgrounds.ejs");
  }
  res.render("campgrounds/edit.ejs", { campground });
};

module.exports.updateCampground = async (req, res, next) => {
  const id = req.params.id;
  const camp = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
  });
  const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
  camp.images.push(...imgs); //pass in not an array, just take data from array, bc it would cause array into array
  await camp.save();
  if (req.body.deleteImages) {
    //delete from cloudinary
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await camp.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
    console.log(camp);
  }

  req.flash("success", "Successfully updated campground");
  res.redirect(`/campgrounds/${camp._id}`);
};

module.exports.deleteCampground = async (req, res, next) => {
  const id = req.params.id;
  await Campground.findByIdAndDelete(id);
  res.redirect("/campgrounds");
  req.flash("success", "You deleted campground");
};
