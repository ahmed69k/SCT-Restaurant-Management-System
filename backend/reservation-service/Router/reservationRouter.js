const express = require("express");
const router = express.Router();

const reservationController = require("../Controller/reservationController");
const authenticationMiddleware = require("../Middleware/AuthenticationMiddleware");
const authorizationMiddleware = require("../Middleware/AuthorizationMiddleware");
const serviceAuthMiddleware = require('../Middleware/ServiceAuthMiddleware')

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
    reservationController.cancelReservation
);
router.get('/:id', authenticationMiddleware, authorizationMiddleware(["Staff", "Admin", "User"]), reservationController.getReservationById)
router.get('internal/:id', serviceAuthMiddleware,reservationController.getReservationById)

module.exports = router;
