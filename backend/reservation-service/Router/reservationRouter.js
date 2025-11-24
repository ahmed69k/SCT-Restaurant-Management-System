const express = require("express");
const router = express.Router();

const reservationController = require("../Controller/reservationController");
const authenticationMiddleware = require("../../middleware/authenticationMiddleware");
const authorizationMiddleware = require("../../middleware/authorizationMiddleware");

router.post(
    "/",
    authenticationMiddleware,
    reservationController.createReservation
);

router.get(
    "/",
    authenticationMiddleware,
    authorizationMiddleware(["Admin"]),
    reservationController.getAllReservations
);

router.get(
    "/my",
    authenticationMiddleware,
    reservationController.getMyReservations
);

router.delete(
    "/:id",
    authenticationMiddleware,
    reservationController.deleteReservation
);

module.exports = router;
