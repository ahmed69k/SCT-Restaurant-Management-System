const reservationController = require('../Controller/reservationController');
const reservationModel = require('../Model/Reservation');
const axios = require('axios');

// Mock the dependencies
jest.mock('../Model/Reservation');
jest.mock('axios');

describe('Reservation Controller Tests', () => {
    let req, res;

    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();

        // Setup request and response objects
        req = {
            user: { id: 'user123' },
            body: {},
            params: {}
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };

        // Mock environment variable
        process.env.SERVICE_SECRET = 'test-secret';
    });

    describe('createReservation', () => {
        it('should create reservation with Double table for 2 guests', async () => {
            const mockTables = [
                { _id: 'table1', id: 'table1', seatingType: 'Double', isFree: true },
                { _id: 'table2', id: 'table2', seatingType: 'Booth', isFree: true }
            ];

            const mockReservation = {
                _id: 'reservation123',
                table: 'table1',
                numberOfGuests: 2,
                customer: 'user123',
                date: '2024-12-20',
                time: '18:00'
            };

            // Mock table service response
            axios.get.mockResolvedValue({ data: { tables: mockTables } });
            // Mock table reservation
            axios.put.mockResolvedValue({ data: { success: true } });
            // Mock reservation creation
            reservationModel.create = jest.fn().mockResolvedValue(mockReservation);

            req.body = {
                date: '2024-12-20',
                time: '18:00',
                numberOfGuests: 2
            };

            await reservationController.createReservation(req, res);

            expect(axios.put).toHaveBeenCalledWith(
                'http://localhost:3005/api/v1/internal/tables/table1',
                { isFree: false },
                { headers: { "x-secret-code": 'test-secret' } }
            );
            expect(reservationModel.create).toHaveBeenCalledWith({
                table: 'table1',
                numberOfGuests: 2,
                customer: 'user123',
                date: '2024-12-20',
                time: '18:00'
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "Reservation created successfully!",
                reservation: mockReservation
            });
        });

        it('should create reservation with Booth table for 4 guests', async () => {
            const mockTables = [
                { _id: 'table1', id: 'table1', seatingType: 'Double', isFree: true },
                { _id: 'table2', id: 'table2', seatingType: 'Booth', isFree: true }
            ];

            const mockReservation = {
                _id: 'reservation123',
                table: 'table2',
                numberOfGuests: 4,
                customer: 'user123'
            };

            axios.get.mockResolvedValue({ data: { tables: mockTables } });
            axios.put.mockResolvedValue({ data: { success: true } });
            reservationModel.create = jest.fn().mockResolvedValue(mockReservation);

            req.body = {
                date: '2024-12-20',
                time: '19:00',
                numberOfGuests: 4
            };

            await reservationController.createReservation(req, res);

            expect(axios.put).toHaveBeenCalledWith(
                'http://localhost:3005/api/v1/internal/tables/table2',
                { isFree: false },
                { headers: { "x-secret-code": 'test-secret' } }
            );
        });

        it('should create reservation with Couch table for 6 guests', async () => {
            const mockTables = [
                { _id: 'table3', id: 'table3', seatingType: 'Couch', isFree: true }
            ];

            const mockReservation = {
                _id: 'reservation123',
                table: 'table3',
                numberOfGuests: 6
            };

            axios.get.mockResolvedValue({ data: { tables: mockTables } });
            axios.put.mockResolvedValue({ data: { success: true } });
            reservationModel.create = jest.fn().mockResolvedValue(mockReservation);

            req.body = {
                date: '2024-12-20',
                time: '20:00',
                numberOfGuests: 6
            };

            await reservationController.createReservation(req, res);

            expect(reservationModel.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    table: 'table3',
                    numberOfGuests: 6
                })
            );
        });

        it('should create reservation with Table type for more than 6 guests', async () => {
            const mockTables = [
                { _id: 'table4', id: 'table4', seatingType: 'Table', isFree: true }
            ];

            const mockReservation = {
                _id: 'reservation123',
                table: 'table4',
                numberOfGuests: 8
            };

            axios.get.mockResolvedValue({ data: { tables: mockTables } });
            axios.put.mockResolvedValue({ data: { success: true } });
            reservationModel.create = jest.fn().mockResolvedValue(mockReservation);

            req.body = {
                date: '2024-12-20',
                time: '21:00',
                numberOfGuests: 8
            };

            await reservationController.createReservation(req, res);

            expect(reservationModel.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    table: 'table4',
                    numberOfGuests: 8
                })
            );
        });

        it('should return 403 when user is not logged in', async () => {
            req.user = { id: null };

            await reservationController.createReservation(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                message: "User not logged in!"
            });
        });

        it('should return 500 when no available table is found', async () => {
            const mockTables = [
                { _id: 'table1', id: 'table1', seatingType: 'Double', isFree: false },
                { _id: 'table2', id: 'table2', seatingType: 'Booth', isFree: false }
            ];

            axios.get.mockResolvedValue({ data: { tables: mockTables } });

            req.body = {
                date: '2024-12-20',
                time: '18:00',
                numberOfGuests: 2
            };

            await reservationController.createReservation(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: "No available table could be found!"
            });
        });

        it('should return 500 when error occurs during reservation creation', async () => {
            const mockTables = [
                { _id: 'table1', id: 'table1', seatingType: 'Double', isFree: true }
            ];

            const mockError = new Error('Database error');

            axios.get.mockResolvedValue({ data: { tables: mockTables } });
            axios.put.mockResolvedValue({ data: { success: true } });
            reservationModel.create = jest.fn().mockRejectedValue(mockError);

            req.body = {
                date: '2024-12-20',
                time: '18:00',
                numberOfGuests: 2
            };

            await reservationController.createReservation(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: "Error creating reservation!",
                error: 'Database error'
            });
        });
    });

    describe('getAllReservations', () => {
        it('should get all reservations successfully', async () => {
            const mockReservations = [
                { _id: 'res1', customer: 'user1', table: 'table1' },
                { _id: 'res2', customer: 'user2', table: 'table2' }
            ];

            reservationModel.find = jest.fn().mockResolvedValue(mockReservations);

            await reservationController.getAllReservations(req, res);

            expect(reservationModel.find).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "Reservations found!",
                reservations: mockReservations
            });
        });

        it('should return 404 when no reservations found', async () => {
            reservationModel.find = jest.fn().mockResolvedValue(null);

            await reservationController.getAllReservations(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: "Reservations not found!"
            });
        });

        it('should return 500 when error occurs', async () => {
            const mockError = new Error('Database error');
            reservationModel.find = jest.fn().mockRejectedValue(mockError);

            await reservationController.getAllReservations(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith("Error getting all reservations!", mockError);
        });
    });

    describe('getReservationById', () => {
        it('should get reservation by id successfully', async () => {
            const mockReservation = {
                _id: 'res1',
                customer: 'user1',
                table: 'table1'
            };

            reservationModel.findById = jest.fn().mockResolvedValue(mockReservation);

            req.params = { id: 'res1' };

            await reservationController.getReservationById(req, res);

            expect(reservationModel.findById).toHaveBeenCalledWith('res1');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "Reservation found!",
                reservation: mockReservation
            });
        });

        it('should return 404 when reservation not found', async () => {
            reservationModel.findById = jest.fn().mockResolvedValue(null);

            req.params = { id: 'res999' };

            await reservationController.getReservationById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: "Reservation not found!"
            });
        });

        it('should return 500 when error occurs', async () => {
            const mockError = new Error('Database error');
            reservationModel.findById = jest.fn().mockRejectedValue(mockError);

            req.params = { id: 'res1' };

            await reservationController.getReservationById(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: "Error getting reservation by id!",
                e: mockError
            });
        });
    });

    describe('getMyReservations', () => {
        it('should get user reservations successfully', async () => {
            const mockReservations = [
                { _id: 'res1', customer: 'user123', table: 'table1' },
                { _id: 'res2', customer: 'user123', table: 'table2' }
            ];

            reservationModel.find = jest.fn().mockResolvedValue(mockReservations);

            await reservationController.getMyReservations(req, res);

            expect(reservationModel.find).toHaveBeenCalledWith({ customer: 'user123' });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "User reservations found!",
                reservations: mockReservations
            });
        });

        it('should return 404 when user has no reservations', async () => {
            reservationModel.find = jest.fn().mockResolvedValue(null);

            await reservationController.getMyReservations(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: "User Reservations not found!"
            });
        });

        it('should return 500 when error occurs', async () => {
            const mockError = new Error('Database error');
            reservationModel.find = jest.fn().mockRejectedValue(mockError);

            await reservationController.getMyReservations(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: "Error getting user reservations!",
                e: mockError
            });
        });
    });

    describe('cancelReservation', () => {
        it('should cancel reservation successfully', async () => {
            const mockDeletedReservation = {
                _id: 'res1',
                customer: 'user123',
                table: 'table1'
            };

            reservationModel.findByIdAndDelete = jest.fn().mockResolvedValue(mockDeletedReservation);

            req.params = { id: 'res1' };

            await reservationController.cancelReservation(req, res);

            expect(reservationModel.findByIdAndDelete).toHaveBeenCalledWith('res1');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "Reservation cancelled successfully!",
                reservation: mockDeletedReservation
            });
        });

        it('should return 400 when reservation ID is not provided', async () => {
            req.params = { id: null };

            await reservationController.cancelReservation(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: "Reservation ID is required!"
            });
        });

        it('should return 404 when reservation not found', async () => {
            reservationModel.findByIdAndDelete = jest.fn().mockResolvedValue(null);

            req.params = { id: 'res999' };

            await reservationController.cancelReservation(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: "Reservation not found!"
            });
        });

        it('should return 500 when error occurs during cancellation', async () => {
            const mockError = new Error('Database error');
            reservationModel.findByIdAndDelete = jest.fn().mockRejectedValue(mockError);

            req.params = { id: 'res1' };

            await reservationController.cancelReservation(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: "Error cancelling reservation!",
                error: 'Database error'
            });
        });
    });

    describe('updateStatus', () => {
        it('should update reservation status successfully', async () => {
            const mockReservation = {
                _id: 'res1',
                status: 'pending'
            };

            const mockUpdatedReservation = {
                _id: 'res1',
                status: 'confirmed'
            };

            reservationModel.findById = jest.fn().mockResolvedValue(mockReservation);
            reservationModel.findByIdAndUpdate = jest.fn().mockResolvedValue(mockUpdatedReservation);

            req.params = { id: 'res1' };
            req.body = { status: 'confirmed' };

            await reservationController.updateStatus(req, res);

            expect(reservationModel.findById).toHaveBeenCalledWith('res1');
            expect(reservationModel.findByIdAndUpdate).toHaveBeenCalledWith(
                'res1',
                { status: 'confirmed' },
                { new: true }
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "Reservation updated successfully!",
                reservation: mockUpdatedReservation
            });
        });

        it('should return 404 when reservation not found', async () => {
            reservationModel.findById = jest.fn().mockResolvedValue(null);

            req.params = { id: 'res999' };
            req.body = { status: 'confirmed' };

            await reservationController.updateStatus(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: "Reservation not found!"
            });
        });

        it('should return 500 when error occurs during update', async () => {
            const mockError = new Error('Database error');
            reservationModel.findById = jest.fn().mockRejectedValue(mockError);

            req.params = { id: 'res1' };
            req.body = { status: 'confirmed' };

            await reservationController.updateStatus(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: "Error updating reservation!",
                error: 'Database error'
            });
        });
    });
});