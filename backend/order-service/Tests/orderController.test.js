const orderController = require('../Controller/orderController');
const orderModel = require('../Model/orderModel');
const axios = require('axios');

// Mock the dependencies
jest.mock('../Model/orderModel');
jest.mock('axios');

describe('Order Controller Tests', () => {
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

    describe('placeOrder', () => {
        it('should place an order successfully with valid menu items', async () => {
            const mockMenu = [
                { _id: 'item1', name: 'Pizza', price: 12.99, isAvailable: true },
                { _id: 'item2', name: 'Burger', price: 9.99, isAvailable: true },
                { _id: 'item3', name: 'Salad', price: 7.99, isAvailable: true }
            ];

            const mockCreatedOrder = {
                _id: 'order123',
                customerId: 'user123',
                menuItems: ['item1', 'item2'],
                totalAmount: 22.98,
                status: 'pending'
            };

            // Mock axios call to menu service
            axios.get.mockResolvedValue({ data: mockMenu });

            // Mock order creation
            orderModel.create = jest.fn().mockResolvedValue(mockCreatedOrder);

            req.body = {
                menuItemId: ['item1', 'item2']
            };

            await orderController.placeOrder(req, res);

            expect(axios.get).toHaveBeenCalledWith(
                'http://localhost:3002/api/v1/menu/internal/',
                { headers: { "x-secret-code": 'test-secret' } }
            );
            expect(orderModel.create).toHaveBeenCalledWith({
                customerId: 'user123',
                menuItems: ['item1', 'item2'],
                totalAmount: 22.98
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "Order created successfully!",
                Order: mockCreatedOrder
            });
        });

        it('should return 403 when user is not logged in', async () => {
            req.user = { id: null };

            await orderController.placeOrder(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                message: "User not logged in!"
            });
        });

        it('should return 500 when menuItemId is not an array', async () => {
            req.body = {
                menuItemId: 'item1' // String instead of array
            };

            await orderController.placeOrder(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: "MenuItemID not an array bro"
            });
        });

        it('should return 500 when order is empty', async () => {
            req.body = {
                menuItemId: []
            };

            await orderController.placeOrder(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: "Order cannot be empty!"
            });
        });

        it('should return 500 when menu service is unavailable', async () => {
            axios.get.mockResolvedValue({ data: null });

            req.body = {
                menuItemId: ['item1', 'item2']
            };

            await orderController.placeOrder(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: "Could not fetch menu from menu service."
            });
        });

        it('should return 400 when menu items are invalid or unavailable', async () => {
            const mockMenu = [
                { _id: 'item1', name: 'Pizza', price: 12.99, isAvailable: true }
            ];

            axios.get.mockResolvedValue({ data: mockMenu });

            req.body = {
                menuItemId: ['item1', 'item999'] // item999 doesn't exist
            };

            await orderController.placeOrder(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: "One or more menu items are invalid or unavailable."
            });
        });

        it('should calculate correct total price for multiple items', async () => {
            const mockMenu = [
                { _id: 'item1', name: 'Pizza', price: 15.50, isAvailable: true },
                { _id: 'item2', name: 'Burger', price: 10.25, isAvailable: true },
                { _id: 'item3', name: 'Salad', price: 8.75, isAvailable: true }
            ];

            const mockCreatedOrder = {
                _id: 'order123',
                customerId: 'user123',
                menuItems: ['item1', 'item2', 'item3'],
                totalAmount: 34.50
            };

            axios.get.mockResolvedValue({ data: mockMenu });
            orderModel.create = jest.fn().mockResolvedValue(mockCreatedOrder);

            req.body = {
                menuItemId: ['item1', 'item2', 'item3']
            };

            await orderController.placeOrder(req, res);

            expect(orderModel.create).toHaveBeenCalledWith({
                customerId: 'user123',
                menuItems: ['item1', 'item2', 'item3'],
                totalAmount: 34.50
            });
        });

        it('should return 500 when error occurs during order creation', async () => {
            const mockMenu = [
                { _id: 'item1', name: 'Pizza', price: 12.99, isAvailable: true }
            ];

            const mockError = new Error('Database error');

            axios.get.mockResolvedValue({ data: mockMenu });
            orderModel.create = jest.fn().mockRejectedValue(mockError);

            req.body = {
                menuItemId: ['item1']
            };

            await orderController.placeOrder(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: "Error creating order!",
                e: mockError
            });
        });
    });

    describe('cancelOrder', () => {
        it('should cancel order successfully', async () => {
            const mockDeletedOrder = {
                _id: 'order123',
                customerId: 'user123',
                status: 'cancelled'
            };

            orderModel.findByIdAndDelete = jest.fn().mockResolvedValue(mockDeletedOrder);

            req.params = { id: 'order123' };

            await orderController.cancelOrder(req, res);

            expect(orderModel.findByIdAndDelete).toHaveBeenCalledWith('order123');
            // Note: The controller doesn't send a success response, so we don't check for it
        });

        it('should return 404 when orderId is not provided', async () => {
            req.params = { id: null };

            await orderController.cancelOrder(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: "OrderID is required!"
            });
        });

        it('should return 404 when order is not found', async () => {
            orderModel.findByIdAndDelete = jest.fn().mockResolvedValue(null);

            req.params = { id: 'order999' };

            await orderController.cancelOrder(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: "Could not find order!"
            });
        });

        it('should return 500 when error occurs during cancellation', async () => {
            const mockError = new Error('Database error');

            orderModel.findByIdAndDelete = jest.fn().mockRejectedValue(mockError);

            req.params = { id: 'order123' };

            await orderController.cancelOrder(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: "Error cancelling order!",
                e: mockError
            });
        });
    });
});