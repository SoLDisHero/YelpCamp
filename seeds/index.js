const mongoose = require("mongoose");
const Campground = require("../models/campground.js");
mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelper.js");
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const sample = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 300; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      author: "63f4421eca031d72c451c3b2", //every campground belongs to me (this userId)
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      // image: `https://source.unsplash.com/collection/483251`, //random image in the collection 483251
      description:
        "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Modi cum nostrum fugit corporis. Aspernatur, quia maxime? Illum error, nihil dolores obcaecati velit minus similique nam quo modi reiciendis. Quidem, explicabo!",
      price,
      geometry: {
        type: "Point",
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude,
        ],
      },
      images: [
        {
          url: "https://res.cloudinary.com/ditb5svzv/image/upload/v1677549712/YelpCamp/fidcs7hw17gcb045lwsn.jpg",
          filename: "YelpCamp/fidcs7hw17gcb045lwsn",
        },
        {
          url: "https://res.cloudinary.com/ditb5svzv/image/upload/v1677549714/YelpCamp/urkopclbdmapyp6p5tij.jpg",
          filename: "YelpCamp/urkopclbdmapyp6p5tij",
        },
      ],
    });
    await camp.save();
  }
};
seedDB().then(() => {
  mongoose.connection.close();
});
