const userController = require('../Controller/userController');
const userSchema = require('../Model/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Mock the dependencies
jest.mock('../Model/userModel');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('User Controller Tests', () => {
    let req, res;

    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();

        // Setup request and response objects
        req = {
            body: {},
            params: {},
            user: { id: 'user123', role: 'User' }
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            cookie: jest.fn().mockReturnThis(),
            clearCookie: jest.fn().mockReturnThis()
        };

        // Mock environment variable
        process.env.SECRET_KEY = 'test-secret-key';
    });

    describe('register', () => {
        it('should register a new user successfully', async () => {
            const mockUser = {
                _id: 'user123',
                name: 'John Doe',
                email: 'john@example.com',
                password: 'hashedPassword',
                role: 'User',
                save: jest.fn().mockResolvedValue(true)
            };

            userSchema.findOne = jest.fn().mockResolvedValue(null);
            bcrypt.hash = jest.fn().mockResolvedValue('hashedPassword');
            userSchema.mockImplementation(() => mockUser);

            req.body = {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password123',
                role: 'User'
            };

            await userController.register(req, res);

            expect(userSchema.findOne).toHaveBeenCalledWith({ email: 'john@example.com' });
            expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
            expect(mockUser.save).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "User Registered Successfully!",
                newUser: mockUser
            });
        });

        it('should return 409 when email already exists', async () => {
            const existingUser = { _id: 'user456', email: 'john@example.com' };
            userSchema.findOne = jest.fn().mockResolvedValue(existingUser);

            req.body = {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password123',
                role: 'User'
            };

            await userController.register(req, res);

            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith("Email already in use!");
        });

        it('should return 500 when error occurs during registration', async () => {
            const mockError = new Error('Database error');
            userSchema.findOne = jest.fn().mockRejectedValue(mockError);

            req.body = {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password123',
                role: 'User'
            };

            await userController.register(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith("Error Registering User:" + mockError);
        });
    });

    describe('login', () => {
        it('should login user successfully and return token', async () => {
            const mockUser = {
                _id: 'user123',
                email: 'john@example.com',
                password: 'hashedPassword',
                role: 'User'
            };

            userSchema.findOne = jest.fn().mockResolvedValue(mockUser);
            bcrypt.compare = jest.fn().mockResolvedValue(true);
            jwt.sign = jest.fn().mockReturnValue('mock-jwt-token');

            req.body = {
                email: 'john@example.com',
                password: 'password123'
            };

            await userController.login(req, res);

            expect(userSchema.findOne).toHaveBeenCalledWith({ email: 'john@example.com' });
            expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
            expect(jwt.sign).toHaveBeenCalledWith(
                { user: { id: 'user123', role: 'User' } },
                'test-secret-key',
                { expiresIn: '3h' }
            );
            expect(res.cookie).toHaveBeenCalledWith('token', 'mock-jwt-token', { httpOnly: true });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "User logged in successfully!",
                token: 'mock-jwt-token'
            });
        });

        it('should return 404 when user not found', async () => {
            userSchema.findOne = jest.fn().mockResolvedValue(null);

            req.body = {
                email: 'nonexistent@example.com',
                password: 'password123'
            };

            await userController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: "User not found!"
            });
        });

        it('should return 409 when password is incorrect', async () => {
            const mockUser = {
                _id: 'user123',
                email: 'john@example.com',
                password: 'hashedPassword'
            };

            userSchema.findOne = jest.fn().mockResolvedValue(mockUser);
            bcrypt.compare = jest.fn().mockResolvedValue(false);

            req.body = {
                email: 'john@example.com',
                password: 'wrongpassword'
            };

            await userController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith({
                message: "Pasword is incorrect!"
            });
        });

        it('should return 500 when error occurs during login', async () => {
            const mockError = new Error('Database error');
            userSchema.findOne = jest.fn().mockRejectedValue(mockError);

            req.body = {
                email: 'john@example.com',
                password: 'password123'
            };

            await userController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: "Error logging in!",
                e: mockError
            });
        });
    });

    describe('logout', () => {
        it('should logout user successfully', async () => {
            await userController.logout(req, res);

            expect(res.clearCookie).toHaveBeenCalledWith('token', { httpOnly: true });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "User logged out sucessfully!"
            });
        });

        it('should return 500 when error occurs during logout', async () => {
            res.clearCookie = jest.fn().mockImplementation(() => {
                throw new Error('Cookie error');
            });

            await userController.logout(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: "Error logging out"
            });
        });
    });

    describe('delete', () => {
        it('should delete user successfully when user deletes own account', async () => {
            const mockUser = { _id: 'user123', name: 'John Doe' };
            userSchema.findById = jest.fn().mockResolvedValue(mockUser);
            userSchema.findByIdAndDelete = jest.fn().mockResolvedValue(mockUser);

            req.params = { id: 'user123' };
            req.user = { id: 'user123', role: 'User' };

            await userController.delete(req, res);

            expect(userSchema.findByIdAndDelete).toHaveBeenCalledWith('user123');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "User deleted successfully!"
            });
        });

        it('should delete user successfully when admin deletes any account', async () => {
            const mockUser = { _id: 'user456', name: 'Jane Doe' };
            userSchema.findById = jest.fn().mockResolvedValue(mockUser);
            userSchema.findByIdAndDelete = jest.fn().mockResolvedValue(mockUser);

            req.params = { id: 'user456' };
            req.user = { id: 'admin123', role: 'Admin' };

            await userController.delete(req, res);

            expect(userSchema.findByIdAndDelete).toHaveBeenCalledWith('user456');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "User deleted successfully!"
            });
        });

        it('should return 404 when user not found', async () => {
            userSchema.findById = jest.fn().mockResolvedValue(null);

            req.params = { id: 'user999' };

            await userController.delete(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: "User not found!"
            });
        });

        it('should return 403 when user tries to delete another user account', async () => {
            const mockUser = { _id: 'user456', name: 'Jane Doe' };
            userSchema.findById = jest.fn().mockResolvedValue(mockUser);

            req.params = { id: 'user456' };
            req.user = { id: 'user123', role: 'User' };

            await userController.delete(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                message: "You can only delete your account!"
            });
        });

        it('should return 500 when error occurs during deletion', async () => {
            const mockError = new Error('Database error');
            userSchema.findById = jest.fn().mockRejectedValue(mockError);

            req.params = { id: 'user123' };

            await userController.delete(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: "Error deleting user!",
                e: mockError
            });
        });
    });

    describe('getUser', () => {
        it('should get user by id successfully', async () => {
            const mockUser = {
                _id: 'user123',
                name: 'John Doe',
                email: 'john@example.com'
            };

            userSchema.findById = jest.fn().mockResolvedValue(mockUser);

            req.params = { id: 'user123' };

            await userController.getUser(req, res);

            expect(userSchema.findById).toHaveBeenCalledWith('user123');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "User found!",
                User: mockUser
            });
        });

        it('should return 404 when user not found', async () => {
            userSchema.findById = jest.fn().mockResolvedValue(null);

            req.params = { id: 'user999' };

            await userController.getUser(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: "User not found!"
            });
        });

        it('should return 500 when error occurs', async () => {
            const mockError = new Error('Database error');
            userSchema.findById = jest.fn().mockRejectedValue(mockError);

            req.params = { id: 'user123' };

            await userController.getUser(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: "Error getting user!",
                e: mockError
            });
        });
    });

    describe('getCurrentUser', () => {
        it('should get current user successfully', async () => {
            const mockUser = {
                _id: 'user123',
                name: 'John Doe',
                email: 'john@example.com'
            };

            const mockQuery = {
                select: jest.fn().mockResolvedValue(mockUser)
            };

            userSchema.findById = jest.fn().mockReturnValue(mockQuery);

            req.user = { id: 'user123' };

            await userController.getCurrentUser(req, res);

            expect(userSchema.findById).toHaveBeenCalledWith('user123');
            expect(mockQuery.select).toHaveBeenCalledWith('-password');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ user: mockUser });
        });

        it('should return 404 when current user not found', async () => {
            const mockQuery = {
                select: jest.fn().mockResolvedValue(null)
            };

            userSchema.findById = jest.fn().mockReturnValue(mockQuery);

            req.user = { id: 'user999' };

            await userController.getCurrentUser(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: "User not found!"
            });
        });

        it('should return 500 when error occurs', async () => {
            const mockError = new Error('Database error');
            const mockQuery = {
                select: jest.fn().mockRejectedValue(mockError)
            };

            userSchema.findById = jest.fn().mockReturnValue(mockQuery);

            req.user = { id: 'user123' };

            await userController.getCurrentUser(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: "Error getting current user!"
            });
        });
    });

    describe('getUsers', () => {
        it('should get all users successfully', async () => {
            const mockUsers = [
                { _id: 'user1', name: 'John Doe' },
                { _id: 'user2', name: 'Jane Doe' }
            ];

            userSchema.find = jest.fn().mockResolvedValue(mockUsers);

            await userController.getUsers(req, res);

            expect(userSchema.find).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "Users found:",
                users: mockUsers
            });
        });

        it('should return 404 when no users found', async () => {
            userSchema.find = jest.fn().mockResolvedValue(null);

            await userController.getUsers(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: "No users found!"
            });
        });

        it('should return 500 when error occurs', async () => {
            const mockError = new Error('Database error');
            userSchema.find = jest.fn().mockRejectedValue(mockError);

            await userController.getUsers(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: "Error getting users!",
                e: mockError
            });
        });
    });

    describe('updateUser', () => {
        it('should update user successfully when user updates own account', async () => {
            const mockUser = { _id: 'user123', name: 'John Doe' };
            const mockUpdatedUser = { _id: 'user123', name: 'John Updated' };

            const mockQuery = {
                select: jest.fn().mockResolvedValue(mockUpdatedUser)
            };

            userSchema.findById = jest.fn().mockResolvedValue(mockUser);
            userSchema.findByIdAndUpdate = jest.fn().mockReturnValue(mockQuery);
            bcrypt.hash = jest.fn().mockResolvedValue('newHashedPassword');

            req.params = { id: 'user123' };
            req.user = { id: 'user123', role: 'User' };
            req.body = {
                name: 'John Updated',
                email: 'johnupdated@example.com',
                password: 'newpassword'
            };

            await userController.updateUser(req, res);

            expect(userSchema.findById).toHaveBeenCalledWith('user123');
            expect(bcrypt.hash).toHaveBeenCalledWith('newpassword', 10);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "User updated!",
                updatedUser: mockUpdatedUser
            });
        });

        it('should update user successfully when admin updates any account', async () => {
            const mockUser = { _id: 'user456', name: 'Jane Doe', role: 'User' };
            const mockUpdatedUser = { _id: 'user456', name: 'Jane Updated', role: 'Admin' };

            const mockQuery = {
                select: jest.fn().mockResolvedValue(mockUpdatedUser)
            };

            userSchema.findById = jest.fn().mockResolvedValue(mockUser);
            userSchema.findByIdAndUpdate = jest.fn().mockReturnValue(mockQuery);

            req.params = { id: 'user456' };
            req.user = { id: 'admin123', role: 'Admin' };
            req.body = {
                name: 'Jane Updated',
                role: 'Admin'
            };

            await userController.updateUser(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "User updated!",
                updatedUser: mockUpdatedUser
            });
        });

        it('should not allow non-admin to change role', async () => {
            const mockUser = { _id: 'user123', name: 'John Doe', role: 'User' };
            const mockUpdatedUser = { _id: 'user123', name: 'John Updated', role: 'User' };

            const mockQuery = {
                select: jest.fn().mockResolvedValue(mockUpdatedUser)
            };

            userSchema.findById = jest.fn().mockResolvedValue(mockUser);
            userSchema.findByIdAndUpdate = jest.fn().mockReturnValue(mockQuery);

            req.params = { id: 'user123' };
            req.user = { id: 'user123', role: 'User' };
            req.body = {
                name: 'John Updated',
                role: 'Admin' // Non-admin trying to change role
            };

            await userController.updateUser(req, res);

            // Check that findByIdAndUpdate was called without the role field
            expect(userSchema.findByIdAndUpdate).toHaveBeenCalledWith(
                'user123',
                { $set: { name: 'John Updated' } },
                { new: true }
            );
        });

        it('should return 403 when unauthorized user tries to update another account', async () => {
            req.params = { id: 'user456' };
            req.user = { id: 'user123', role: 'User' };
            req.body = { name: 'Updated Name' };

            await userController.updateUser(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                message: "You are not authorized to perform this action."
            });
        });

        it('should return 404 when user not found', async () => {
            userSchema.findById = jest.fn().mockResolvedValue(null);

            req.params = { id: 'user123' };
            req.user = { id: 'user123', role: 'User' };
            req.body = { name: 'Updated Name' };

            await userController.updateUser(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: "User not found!"
            });
        });

        it('should return 500 when error occurs during update', async () => {
            const mockError = new Error('Database error');
            userSchema.findById = jest.fn().mockRejectedValue(mockError);

            req.params = { id: 'user123' };
            req.user = { id: 'user123', role: 'User' };
            req.body = { name: 'Updated Name' };

            await userController.updateUser(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: "Error updating user!",
                e: mockError
            });
        });
    });
});