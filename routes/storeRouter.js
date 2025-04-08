//external module
const express = require("express");

const path = require("path");

const homeController = require("../controllers/storeController");

const storeRouter = express.Router();

storeRouter.get("/", homeController.getIndex);
storeRouter.get("/homes", homeController.getHome);
storeRouter.get("/bookings", homeController.getBookings);
storeRouter.get("/favourites", homeController.getFavouritesList);
storeRouter.post("/favourites", homeController.postAddToFavourite);
storeRouter.get("/homes/:homeId", homeController.getHomeDetail);
storeRouter.post(
  "/favourites/delete/:homeId",
  homeController.postRemoveFromFavorite
);
// storeRouter.get("/rules/:homeId", homeController.getHouseRules);

// Add these new routes
storeRouter.get("/bookings/:homeId", homeController.getBookingPage);
storeRouter.post("/bookings/create", homeController.postCreateBooking);

module.exports = storeRouter;
