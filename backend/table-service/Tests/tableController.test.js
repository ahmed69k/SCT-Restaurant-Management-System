const tableController = require('../Controller/tableController');
const tableSchema = require('../Model/Table');
const axios = require('axios');

// Mock the dependencies
jest.mock('../Model/Table');
jest.mock('axios');

describe('Table Controller Tests', () => {
    let req, res;

    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();

        // Setup request and response objects
        req = {
            body: {},
            params: {}
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };

        // Mock environment variable
        process.env.RESERVATION_SERVICE_SECRET = 'test-secret';
    });

    describe('createTable', () => {
        it('should create a single table successfully', async () => {
            const mockTable = {
                _id: 'table123',
                seatingType: 'Booth',
                isFree: true,
                save: jest.fn().mockResolvedValue(true)
            };

            tableSchema.mockImplementation(() => mockTable);

            req.body = {
                seatingType: 'Booth'
            };

            await tableController.createTable(req, res);

            expect(mockTable.save).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: "Table created successfully",
                newTable: mockTable
            });
        });

        it('should create multiple tables successfully', async () => {
            const mockTables = [
                { _id: 'table1', seatingType: 'Booth', isFree: true },
                { _id: 'table2', seatingType: 'Double', isFree: true }
            ];

            tableSchema.insertMany = jest.fn().mockResolvedValue(mockTables);

            req.body = [
                { seatingType: 'Booth' },
                { seatingType: 'Double' }
            ];

            await tableController.createTable(req, res);

            expect(tableSchema.insertMany).toHaveBeenCalledWith(req.body);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: "Tables created successfully",
                tables: mockTables
            });
        });

        it('should return 500 when error occurs during table creation', async () => {
            const mockError = new Error('Database error');
            const mockTable = {
                save: jest.fn().mockRejectedValue(mockError)
            };

            tableSchema.mockImplementation(() => mockTable);

            req.body = {
                seatingType: 'Booth'
            };

            await tableController.createTable(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: "Error creating table",
                error: mockError
            });
        });
    });

    describe('updateTable', () => {
        it('should update table successfully', async () => {
            const mockUpdatedTable = {
                _id: 'table123',
                seatingType: 'Couch',
                isFree: false,
                reservation: 'res123'
            };

            tableSchema.findByIdAndUpdate = jest.fn().mockResolvedValue(mockUpdatedTable);

            req.params = { tableId: 'table123' };
            req.body = {
                isFree: false,
                seatingType: 'Couch',
                reservation: 'res123'
            };

            await tableController.updateTable(req, res);

            expect(tableSchema.findByIdAndUpdate).toHaveBeenCalledWith(
                'table123',
                {
                    isFree: false,
                    seatingType: 'Couch',
                    reservation: 'res123'
                },
                { new: true }
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "Table updated sucessfully",
                updatedTable: mockUpdatedTable
            });
        });

        it('should return 500 when error occurs during update', async () => {
            const mockError = new Error('Update failed');
            
            tableSchema.findByIdAndUpdate = jest.fn().mockRejectedValue(mockError);

            req.params = { tableId: 'table123' };
            req.body = {
                isFree: true,
                seatingType: 'Booth'
            };

            await tableController.updateTable(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: "Error updated table",
                error: mockError
            });
        });
    });

    describe('deleteTable', () => {
        it('should delete table successfully', async () => {
            tableSchema.findByIdAndDelete = jest.fn().mockResolvedValue(true);

            req.params = { tableId: 'table123' };

            await tableController.deleteTable(req, res);

            expect(tableSchema.findByIdAndDelete).toHaveBeenCalledWith('table123');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "Table deleted sucessfully"
            });
        });

        it('should return 500 when error occurs during deletion', async () => {
            const mockError = new Error('Deletion failed');
            
            tableSchema.findByIdAndDelete = jest.fn().mockRejectedValue(mockError);

            req.params = { tableId: 'table123' };

            await tableController.deleteTable(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: "Error deleteding table",
                error: mockError
            });
        });
    });

    describe('getAllTables', () => {
        it('should get all tables successfully', async () => {
            const mockTables = [
                { _id: 'table1', seatingType: 'Booth', isFree: true },
                { _id: 'table2', seatingType: 'Double', isFree: false }
            ];

            tableSchema.find = jest.fn().mockResolvedValue(mockTables);

            await tableController.getAllTables(req, res);

            expect(tableSchema.find).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                tables: mockTables
            });
        });

        it('should return 500 when error occurs during retrieval', async () => {
            const mockError = new Error('Retrieval failed');
            
            tableSchema.find = jest.fn().mockRejectedValue(mockError);

            await tableController.getAllTables(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: "Error retrieving table",
                error: mockError
            });
        });
    });

    describe('getTableById', () => {
        it('should get table by id successfully', async () => {
            const mockTable = {
                _id: 'table123',
                seatingType: 'Booth',
                isFree: true
            };

            tableSchema.findById = jest.fn().mockResolvedValue(mockTable);

            req.params = { tableId: 'table123' };

            await tableController.getTableById(req, res);

            expect(tableSchema.findById).toHaveBeenCalledWith('table123');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                table: mockTable
            });
        });

        it('should return 404 when table not found', async () => {
            tableSchema.findById = jest.fn().mockResolvedValue(null);

            req.params = { tableId: 'table999' };

            await tableController.getTableById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: "Table not found!"
            });
        });

        it('should return 500 when error occurs during retrieval', async () => {
            const mockError = new Error('Retrieval failed');
            
            tableSchema.findById = jest.fn().mockRejectedValue(mockError);

            req.params = { tableId: 'table123' };

            await tableController.getTableById(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: "Error retrieving table",
                error: mockError
            });
        });
    });

    describe('getAvailableTables', () => {
        it('should get all available tables successfully', async () => {
            const mockTables = [
                { _id: 'table1', seatingType: 'Booth', isFree: true },
                { _id: 'table2', seatingType: 'Double', isFree: true }
            ];

            tableSchema.find = jest.fn().mockResolvedValue(mockTables);

            await tableController.getAvailableTables(req, res);

            expect(tableSchema.find).toHaveBeenCalledWith({ isFree: true });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                tables: mockTables
            });
        });

        it('should return 500 when error occurs during retrieval', async () => {
            const mockError = new Error('Retrieval failed');
            
            tableSchema.find = jest.fn().mockRejectedValue(mockError);

            await tableController.getAvailableTables(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: "Error retrieving available tables",
                error: mockError
            });
        });
    });

    describe('updateTableStatus', () => {
        it('should update table status successfully', async () => {
            const mockUpdatedTable = {
                _id: 'table123',
                seatingType: 'Booth',
                isFree: false
            };

            tableSchema.findByIdAndUpdate = jest.fn().mockResolvedValue(mockUpdatedTable);

            req.params = { tableId: 'table123' };
            req.body = { isFree: false };

            await tableController.updateTableStatus(req, res);

            expect(tableSchema.findByIdAndUpdate).toHaveBeenCalledWith(
                'table123',
                { isFree: false },
                { new: true }
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "Table status updated successfully!",
                updatedTable: mockUpdatedTable
            });
        });

        it('should return 500 when error occurs during status update', async () => {
            const mockError = new Error('Update failed');
            
            tableSchema.findByIdAndUpdate = jest.fn().mockRejectedValue(mockError);

            req.params = { tableId: 'table123' };
            req.body = { isFree: true };

            await tableController.updateTableStatus(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: "Error updating table status",
                error: mockError
            });
        });
    });
});