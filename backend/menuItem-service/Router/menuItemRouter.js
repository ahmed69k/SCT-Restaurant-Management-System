import { Router } from 'express';
import {
  getMenu,
  getAllItems,
  createItem,
  updateItem,
  deleteItem
} from '../Controller/menuItemController';

// Import your team's real middlewares (note the exact path and .js extension)
import authenticationMiddleware from '../Middleware/AuthenticationMiddleware.js';
import authorizationMiddleware from '../Middleware/AuthorizationMiddleware.js';

const router = Router();

// Public route - anyone can see the menu (no auth needed)
router.get('/', getMenu);

// Protected routes - need login
router.use(authenticationMiddleware); // ← applies to all routes below

// Customer can see all items (including unavailable ones? maybe for internal use)
router.get('/all', getAllItems);

// Admin-only routes
router.post('/', authorizationMiddleware(['admin']), createItem);
router.put('/:id', authorizationMiddleware(['admin']), updateItem);
router.delete('/:id', authorizationMiddleware(['admin']), deleteItem);

export default router;