import MenuItem from '../Model/menuItemModel';

// GET /api/menu → public: get all available items
export const getMenu = async (req, res) => {
  try {
    const items = await MenuItem.find({ isAvailable: true })
      .select('-__v')
      .sort({ category: 1, name: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/menu/all → admin: get all items (including unavailable)
export const getAllItems = async (req, res) => {
  try {
    const items = await MenuItem.find().sort({ category: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/menu → admin only
export const createItem = async (req, res) => {
  const { name, description, price, category, image } = req.body;
  if (!name || !description || !price || !category) {
    return res.status(400).json({ message: 'All fields required' });
  }
  try {
    const item = new MenuItem({ name, description, price, category, image });
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/menu/:id → admin only
export const updateItem = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/menu/:id → admin only
export const deleteItem = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};