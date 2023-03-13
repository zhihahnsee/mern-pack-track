const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const packageSchema = new Schema({
    username: { type: String, required: true },
    status: { type: String, required: true },
    packagetype: { type: String, required: true },
    deliverydate: { type: Date, required: true },
}, {
    timestamps: true,
});

const Package = mongoose.model('Package', packageSchema);

module.exports = Package;