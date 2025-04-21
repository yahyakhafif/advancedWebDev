const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Style = require('../models/Style');
const { protect, admin } = require('../middleware/auth');

// @route   GET api/styles
// @desc    Get all architectural styles
// @access  Public
router.get('/', async (req, res) => {
    try {
        const styles = await Style.find().sort({ name: 1 });
        res.json(styles);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/styles/:id
// @desc    Get style by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const style = await Style.findById(req.params.id);

        if (!style) {
            return res.status(404).json({ msg: 'Style not found' });
        }

        res.json(style);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Style not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   POST api/styles
// @desc    Create a new architectural style
// @access  Private/Admin
router.post(
    '/',
    [
        protect,
        admin,
        [
            check('name', 'Name is required').not().isEmpty(),
            check('period', 'Time period is required').not().isEmpty(),
            check('description', 'Description is required').not().isEmpty(),
            check('characteristics', 'At least one characteristic is required').isArray({ min: 1 })
        ]
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const {
                name,
                period,
                description,
                characteristics,
                mainFeatures,
                famousExamples,
                imageUrl
            } = req.body;

            // Check if style already exists
            const existingStyle = await Style.findOne({ name });
            if (existingStyle) {
                return res.status(400).json({ msg: 'Style with this name already exists' });
            }

            const newStyle = new Style({
                name,
                period,
                description,
                characteristics,
                mainFeatures: mainFeatures || [],
                famousExamples: famousExamples || [],
                imageUrl,
                createdBy: req.user.id
            });

            const style = await newStyle.save();

            res.status(201).json(style);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route   PUT api/styles/:id
// @desc    Update an architectural style
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
    try {
        let style = await Style.findById(req.params.id);

        if (!style) {
            return res.status(404).json({ msg: 'Style not found' });
        }

        style = await Style.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        res.json(style);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Style not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/styles/:id
// @desc    Delete an architectural style
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const style = await Style.findById(req.params.id);

        if (!style) {
            return res.status(404).json({ msg: 'Style not found' });
        }

        await style.deleteOne();

        res.json({ msg: 'Style removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Style not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   GET api/styles/search/:keyword
// @desc    Search styles by keyword
// @access  Public
router.get('/search/:keyword', async (req, res) => {
    try {
        const keyword = req.params.keyword;
        const styles = await Style.find({
            $or: [
                { name: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } },
                { characteristics: { $elemMatch: { $regex: keyword, $options: 'i' } } }
            ]
        });

        res.json(styles);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;