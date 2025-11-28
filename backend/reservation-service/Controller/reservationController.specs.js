const request = require("supertest");
const app = require("../app");  
const axios = require("axios");
const reservationModel = require("../Model/reservationModel");
// mocking for testing (WE DONT USE ACTUAL SERVICES OR DB IN TESTS)

jest.mock("axios");
jest.mock("../Model/reservationModel");


const mockUserId = "12345";

function mockAuth(req, res, next) {
  req.user = { id: mockUserId };
  next();
}

jest.mock("../middleware/authMiddleware", () => mockAuth);



describe("Reservation Controller Tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

 // createReservation tests

  test("should create a reservation successfully", async () => {
    axios.get
      .mockResolvedValueOnce({ data: { table: { id: "T1" } } }) // table service
      .mockResolvedValueOnce({ data: { user: { id: mockUserId } } }); // user service

    const mockReservation = {
      customerId: mockUserId,
      tableId: "T1",
      reservationDate: "2025-01-01",
      reservationTime: "18:00",
      numberOfGuests: 2
    };

    reservationModel.create.mockResolvedValue(mockReservation);

    const res = await request(app)
      .post("/api/v1/reservations")
      .send(mockReservation);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Reservation created successfully!");
    expect(res.body.reservation.tableId).toBe("T1");
  });


  // missing fields test
  
  test("should return 400 if fields are missing", async () => {
    const res = await request(app)
      .post("/api/v1/reservations")
      .send({ tableId: "A" }); // missing date, time, guests

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Missing reservation fields!");
  });


  // table not found test
  
  test("should return 404 if table is not found", async () => {
    axios.get.mockResolvedValueOnce({ data: {} }); // no table returned

    const res = await request(app)
      .post("/api/v1/reservations")
      .send({
        tableId: "T1",
        reservationDate: "2025-01-01",
        reservationTime: "18:00",
        numberOfGuests: 3
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Table not found!");
  });

    // user not found test
 
  test("should return 404 if user is not found", async () => {
    axios.get
      .mockResolvedValueOnce({ data: { table: {} } }) // table found
      .mockResolvedValueOnce({ data: {} }); // user missing

    const res = await request(app)
      .post("/api/v1/reservations")
      .send({
        tableId: "A1",
        reservationDate: "2025-01-01",
        reservationTime: "18:00",
        numberOfGuests: 4
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("User not found!");
  });


// createReservation error handling test
 
  test("should return 500 when createReservation fails", async () => {
    axios.get
      .mockResolvedValueOnce({ data: { table: { id: "T2" } } })
      .mockResolvedValueOnce({ data: { user: { id: mockUserId } } });

    reservationModel.create.mockRejectedValue(new Error("DB error"));

    const res = await request(app)
      .post("/api/v1/reservations")
      .send({
        tableId: "T2",
        reservationDate: "2025-01-01",
        reservationTime: "19:00",
        numberOfGuests: 2
      });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Error creating reservation!");
  });

  // cancelReservation tests

  test("should cancel reservation successfully", async () => {
    reservationModel.findByIdAndDelete.mockResolvedValue({ id: "R1" });

    const res = await request(app)
      .delete("/api/v1/reservations/R1");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Reservation cancelled successfully!");
  });


// cancelReservation not found test

  test("should return 404 when reservation not found", async () => {
    reservationModel.findByIdAndDelete.mockResolvedValue(null);

    const res = await request(app)
      .delete("/api/v1/reservations/R404");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Reservation not found!");
  });

  // cancelReservation error handling test

  test("should return 500 on deleteReservation error", async () => {
    reservationModel.findByIdAndDelete.mockRejectedValue(
      new Error("DB delete error")
    );

    const res = await request(app)
      .delete("/api/v1/reservations/R1");

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Error cancelling reservation!");
  });
});
