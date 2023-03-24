if (process.env.NODE_ENV !== "production") {
  //environment variable
  require("dotenv").config();
}

const express = require("express");
const app = express();
const path = require("path");
const ejsMate = require("ejs-mate");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const Joi = require("joi");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const MongoDBStore = require("connect-mongo");

const campgroundRoutes = require("./routes/campgrounds.js");
const reviewRoutes = require("./routes/reviews.js");
const userRoutes = require("./routes/users.js");

const dbUrl = process.env.DB_URL || "mongodb://127.0.0.1:27017/yelp-camp";

mongoose.connect(dbUrl);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(mongoSanitize());

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

const secret = process.env.SECRET || "thisshouldbeabettersecret";

const store = MongoDBStore.create({
  mongoUrl: dbUrl,
  secret,
  touchAfter: 24 * 60 * 60, //update our DB in seconds
});

store.on("error", function (e) {
  console.log("Store error", e);
});

const sessionConfig = {
  store,
  name: "ourname", //helps to tangle hackers to find default name
  secret, //secret
  resave: false, //deprecation warning
  saveUninitialized: true,
  cookie: {
    //secure: true, //can join site over HTTPS. works when deployed, not on localhost
    httpOnly: true, //for security. can't reveal for 3d party//it's not accessible over HTTP and JS
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //expires in a week
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
app.use(flash());
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
); //enable all middleware that helmet comes with

app.use(passport.initialize());
app.use(passport.session()); //should be after session()
passport.use(new LocalStrategy(User.authenticate())); //hi passport, we'd like to use LocalStrategy and User model with autehnticate method
passport.serializeUser(User.serializeUser()); //means how we store user in a session
passport.deserializeUser(User.deserializeUser()); //means how we get user out of session

app.get("/", (req, res) => {
  res.render("home.ejs");
});

//setting up a middleware for any single req/ of flash // before route habdlers
app.use((req, res, next) => {
  res.locals.currentUser = req.user; //if user logged in, the current user is logged in user otherwise current user is undefined
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);
app.use("/", userRoutes);

//error handling

app.all("*", (req, res, next) => {
  next(new ExpressError("Page not found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Oh no, something wrong";
  res.status(statusCode).render("error.ejs", { err });
  // res.send("Something wrong");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Serving on port ${port}`);
});
