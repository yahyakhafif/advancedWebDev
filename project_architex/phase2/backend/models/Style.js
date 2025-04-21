const mongoose = require('mongoose');

const StyleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a style name'],
        unique: true,
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters']
    },
    period: {
        type: String,
        required: [true, 'Please add a time period']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    characteristics: {
        type: [String],
        required: [true, 'Please add key characteristics']
    },
    mainFeatures: {
        type: [String]
    },
    famousExamples: [{
        name: String,
        location: String,
        architect: String,
        year: String,
        imageUrl: String
    }],
    imageUrl: {
        type: String
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Style', StyleSchema);