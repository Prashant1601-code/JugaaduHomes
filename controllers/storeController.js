const Home = require("../models/home");
const { User } = require("../models/user");
const Booking = require("../models/booking");
// const path = require("path");
// const rootDir = require("../utils/pathUtil");

exports.getIndex = (req, res, next) => {
  Home.find().then((registeredHomes) => {
    res.render("store/index", {
      registeredHomes: registeredHomes,
      pageTitle: "JugaaduHomes Home",
      currentPage: "index",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  });
};

exports.getHome = (req, res, next) => {
  Home.find().then((registeredHomes) => {
    res.render("store/home-list", {
      registeredHomes: registeredHomes,
      pageTitle: "Home List",
      currentPage: "home",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  });
};

exports.getBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({
      userId: req.session.user._id,
    }).populate("homeId");

    res.render("store/bookings", {
      bookings: bookings,
      pageTitle: "My Bookings",
      currentPage: "Bookings",
      user: req.session.user,
      isLoggedIn: req.session.isLoggedIn,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.getFavouritesList = async (req, res, next) => {
  const userId = req.session.user._id;
  const user = await User.findById(userId).populate("favourites");
  res.render("store/favourite-list", {
    favouriteHomes: user.favourites,
    pageTitle: "My Favourites",
    currentPage: "favourites",
    isLoggedIn: req.isLoggedIn,
    user: req.session.user,
  });
};

exports.postAddToFavourite = async (req, res, next) => {
  const homeId = req.body.id;
  const userId = req.session.user._id;
  const user = await User.findById(userId);
  if (!user.favourites.includes(homeId)) {
    user.favourites.push(homeId);
    await user.save();
  }
  res.redirect("/favourites");
};

exports.postRemoveFromFavorite = async (req, res, next) => {
  const homeId = req.params.homeId;
  const userId = req.session.user._id;
  const user = await User.findById(userId);
  if (user.favourites.includes(homeId)) {
    user.favourites.pull(homeId);
    await user.save();
  }

  res.redirect("/favourites");
};

exports.getHomeDetail = (req, res, next) => {
  const homeId = req.params.homeId;
  Home.findById(homeId).then((home) => {
    if (!home) {
      console.log("Home not found");
      res.redirect("/homes");
    } else {
      res.render("store/home-detail", {
        home: home,
        pageTitle: "Home Detail",
        currentPage: "Home",
        isLoggedIn: req.isLoggedIn,
        user: req.session.user,
      });
    }
  });
};

exports.getBookingPage = async (req, res, next) => {
  const homeId = req.params.homeId;
  try {
    const home = await Home.findById(homeId);
    const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format

    res.render("store/bookings", {
      home: home,
      pageTitle: "Book Property",
      currentPage: "bookings",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
      minDate: today,
    });
  } catch (error) {
    console.log(error);
    res.redirect("/homes");
  }
};

exports.postCreateBooking = async (req, res, next) => {
  const { homeId, checkIn, checkOut } = req.body;
  try {
    const home = await Home.findById(homeId);
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Validate checkout date is after checkin date
    if (checkOutDate <= checkInDate) {
      return res.render("store/bookings", {
        home: home,
        pageTitle: "Book Property",
        currentPage: "bookings",
        isLoggedIn: req.isLoggedIn,
        user: req.session.user,
        minDate: new Date().toISOString().split("T")[0],
        error: "Check-out date must be after check-in date",
      });
    }

    const numberOfNights = Math.ceil(
      (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)
    );
    const totalPrice = home.price * numberOfNights;

    const booking = new Booking({
      homeId: homeId,
      userId: req.session.user._id,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      totalPrice: totalPrice,
    });

    await booking.save();
    res.redirect("/bookings");
  } catch (error) {
    console.log(error);
    res.redirect("/homes");
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.bookingId;

    // Find the booking
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Verify ownership
    if (booking.userId.toString() !== req.session.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this booking",
      });
    }

    // Check if booking is in the future
    if (new Date(booking.checkIn) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel past or current bookings",
      });
    }

    // Delete the booking instead of updating status
    await Booking.findByIdAndDelete(bookingId);

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel booking error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while cancelling the booking",
    });
  }
};
// exports.getHouseRules = [
//   (req, res, next) => {
//     if (req.session.isLoggedIn) {
//       return res.render("/login");
//     }
//     next();
//   },
//   (req, res, next) => {
//     const homeId = req.params.homeId;
//     const ruleFileName = `House Rules.pdf`;
//     const filePath = path.join(rootDir, "rules", ruleFileName);
//     res.download(filePath, "Rules.pdf");
//   },
// ];
