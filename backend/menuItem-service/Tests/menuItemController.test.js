const {
    getMenu,
    getAllItems,
    createItem,
    updateItem,
    deleteItem,
  } = require('../Controller/menuItemController');
  const MenuItem = require('../Model/menuItemModel');
  
  // Mock the MenuItem model
  jest.mock('../Model/menuItemModel');
  
  describe('Menu Item Controller Tests', () => {
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
    });
  
    describe('getMenu', () => {
      it('should get all available menu items successfully', async () => {
        const mockItems = [
          { _id: '1', name: 'Pizza', category: 'Main', price: 12.99, isAvailable: true },
          { _id: '2', name: 'Burger', category: 'Main', price: 9.99, isAvailable: true }
        ];
  
        const mockQuery = {
          select: jest.fn().mockReturnThis(),
          sort: jest.fn().mockResolvedValue(mockItems)
        };
  
        MenuItem.find = jest.fn().mockReturnValue(mockQuery);
  
        await getMenu(req, res);
  
        expect(MenuItem.find).toHaveBeenCalledWith({ isAvailable: true });
        expect(mockQuery.select).toHaveBeenCalledWith('-__v');
        expect(mockQuery.sort).toHaveBeenCalledWith({ category: 1, name: 1 });
        expect(res.json).toHaveBeenCalledWith(mockItems);
      });
  
      it('should return 500 when error occurs getting menu', async () => {
        const mockError = new Error('Database error');
        
        const mockQuery = {
          select: jest.fn().mockReturnThis(),
          sort: jest.fn().mockRejectedValue(mockError)
        };
  
        MenuItem.find = jest.fn().mockReturnValue(mockQuery);
  
        await getMenu(req, res);
  
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ 
          message: 'Server error while getting menu!' 
        });
      });
    });
  
    describe('getAllItems', () => {
      it('should get all menu items including unavailable ones', async () => {
        const mockItems = [
          { _id: '1', name: 'Pizza', category: 'Main', isAvailable: true },
          { _id: '2', name: 'Salad', category: 'Appetizer', isAvailable: false }
        ];
  
        const mockQuery = {
          sort: jest.fn().mockResolvedValue(mockItems)
        };
  
        MenuItem.find = jest.fn().mockReturnValue(mockQuery);
  
        await getAllItems(req, res);
  
        expect(MenuItem.find).toHaveBeenCalledWith();
        expect(mockQuery.sort).toHaveBeenCalledWith({ category: 1 });
        expect(res.json).toHaveBeenCalledWith(mockItems);
      });
  
      it('should return 500 when error occurs getting all items', async () => {
        const mockError = new Error('Database error');
        
        const mockQuery = {
          sort: jest.fn().mockRejectedValue(mockError)
        };
  
        MenuItem.find = jest.fn().mockReturnValue(mockQuery);
  
        await getAllItems(req, res);
  
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ 
          message: 'Server error while getting all menu items!' 
        });
      });
    });
  
    describe('createItem', () => {
      it('should create a menu item successfully', async () => {
        const mockItem = {
          _id: '123',
          name: 'New Pizza',
          description: 'Delicious pizza',
          price: 15.99,
          category: 'Main',
          image: 'pizza.jpg',
          save: jest.fn().mockResolvedValue(true)
        };
  
        MenuItem.mockImplementation(() => mockItem);
  
        req.body = {
          name: 'New Pizza',
          description: 'Delicious pizza',
          price: 15.99,
          category: 'Main',
          image: 'pizza.jpg'
        };
  
        await createItem(req, res);
  
        expect(mockItem.save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(mockItem);
      });
  
      it('should return 400 when required fields are missing', async () => {
        req.body = {
          name: 'Pizza',
          description: 'Tasty'
          // Missing price and category
        };
  
        await createItem(req, res);
  
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ 
          message: 'All fields required' 
        });
      });
  
      it('should return 500 when error occurs creating item', async () => {
        const mockError = new Error('Save failed');
        const mockItem = {
          save: jest.fn().mockRejectedValue(mockError)
        };
  
        MenuItem.mockImplementation(() => mockItem);
  
        req.body = {
          name: 'Pizza',
          description: 'Tasty',
          price: 12.99,
          category: 'Main'
        };
  
        await createItem(req, res);
  
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ 
          message: 'Server error while creating menu item!' 
        });
      });
    });
  
    describe('updateItem', () => {
      it('should update a menu item successfully', async () => {
        const mockUpdatedItem = {
          _id: '123',
          name: 'Updated Pizza',
          price: 16.99
        };
  
        MenuItem.findByIdAndUpdate = jest.fn().mockResolvedValue(mockUpdatedItem);
  
        req.params = { id: '123' };
        req.body = {
          name: 'Updated Pizza',
          price: 16.99
        };
  
        await updateItem(req, res);
  
        expect(MenuItem.findByIdAndUpdate).toHaveBeenCalledWith(
          '123',
          req.body,
          { new: true, runValidators: true }
        );
        expect(res.json).toHaveBeenCalledWith(mockUpdatedItem);
      });
  
      it('should return 404 when item not found', async () => {
        MenuItem.findByIdAndUpdate = jest.fn().mockResolvedValue(null);
  
        req.params = { id: '999' };
        req.body = { name: 'Updated' };
  
        await updateItem(req, res);
  
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ 
          message: 'Item not found' 
        });
      });
  
      it('should return 500 when error occurs updating item', async () => {
        const mockError = new Error('Update failed');
        
        MenuItem.findByIdAndUpdate = jest.fn().mockRejectedValue(mockError);
  
        req.params = { id: '123' };
        req.body = { name: 'Updated' };
  
        await updateItem(req, res);
  
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ 
          message: 'Server error while updating menu item!' 
        });
      });
    });
  
    describe('deleteItem', () => {
      it('should delete a menu item successfully', async () => {
        const mockDeletedItem = {
          _id: '123',
          name: 'Pizza'
        };
  
        MenuItem.findByIdAndDelete = jest.fn().mockResolvedValue(mockDeletedItem);
  
        req.params = { id: '123' };
  
        await deleteItem(req, res);
  
        expect(MenuItem.findByIdAndDelete).toHaveBeenCalledWith('123');
        expect(res.json).toHaveBeenCalledWith({ 
          message: 'Item deleted successfully' 
        });
      });
  
      it('should return 404 when item not found', async () => {
        MenuItem.findByIdAndDelete = jest.fn().mockResolvedValue(null);
  
        req.params = { id: '999' };
  
        await deleteItem(req, res);
  
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ 
          message: 'Item not found' 
        });
      });
  
      it('should return 500 when error occurs deleting item', async () => {
        const mockError = new Error('Delete failed');
        
        MenuItem.findByIdAndDelete = jest.fn().mockRejectedValue(mockError);
  
        req.params = { id: '123' };
  
        await deleteItem(req, res);
  
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ 
          message: 'Server error while deleting menu item!' 
        });
      });
    });
  });