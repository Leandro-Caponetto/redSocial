const { Image } = require('../models')

const ctrl = {}

ctrl.index = async (req, res) => {
    const images = await Image.find().sort({timestamp: -1}).lean();
    res.render('index', {images})
};

module.exports = ctrl;