const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route   GET api/users/favorites
// @desc    Get user's favorite styles
// @access  Private
router.get('/favorites', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('favorites');

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json(user.favorites);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/users/favorites/:styleId
// @desc    Add or remove a style from user favorites
// @access  Private
router.put('/favorites/:styleId', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Check if style is already in favorites
        const isAlreadyFavorite = user.favorites.some(
            (favId) => favId.toString() === req.params.styleId
        );

        if (isAlreadyFavorite) {
            // Remove from favorites
            user.favorites = user.favorites.filter(
                (favId) => favId.toString() !== req.params.styleId
            );
        } else {
            // Add to favorites
            user.favorites.push(req.params.styleId);
        }

        await user.save();

        res.json({
            success: true,
            favorites: user.favorites,
            action: isAlreadyFavorite ? 'removed' : 'added'
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/users
// @desc    Get all users
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json(user);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.status(500).send('Server Error');
    }
});

module.exports = router;