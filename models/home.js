const mongoose = require("mongoose");
const { User } = require("./user");
const { rule } = require("postcss");

const homeSchema = mongoose.Schema({
  houseName: { type: String, require: true },
  price: { type: Number, require: true },
  location: { type: String, require: true },
  rating: { type: Number, require: true },
  image: String,
  description: String,
});

// homeSchema.pre("findOneAndDelete", async function (next) {
//   console.log("came to pre hook while deleting home");
//   const userId = req.session.user._id;
//   const user = await User.findById(userId);
//   const homeId = this.getQuery()._id;
//   await user.deleteMany({ houseId: homeId });
//   next();
// });

module.exports = mongoose.model("Home", homeSchema);
