/** @format */

const path = require("path");
const { randomNumber } = require("../helpers/libs");
const fs = require("fs-extra");
const md5 = require("md5");

const { Image, Comment } = require("../models");

const ctrl = {};

ctrl.index = async (req, res) => {
  const viewModel = { image: {}, comments: {} };

  const image = await Image.findOne({
    filename: { $regex: req.params.image_id },
  }).lean();
  if (image) {
    image.views = image.views + 1;
    viewModel.image = image;
    //  await image.save()
    const comments = await Comment.find({ image_id: image._id }).lean();
    viewModel.comments = comments;
    res.render("image", viewModel);
  } else {
    res.redirect("/");
  }
};

ctrl.create = (req, res) => {
  const saveImage = async () => {
    const imgUrl = randomNumber();
    const images = await Image.find({ filename: imgUrl });
    if (images.length > 0) {
      saveImage();
    } else {
      console.log(imgUrl);
      const imageTempPath = req.file.path;
      const ext = path.extname(req.file.originalname).toLowerCase();
      const targetPath = path.resolve(`src/public/uploads/${imgUrl}${ext}`);

      if (
        ext === ".png" ||
        ext === ".jpg" ||
        ext === ".jpeg" ||
        ext === ".gif"
      ) {
        await fs.rename(imageTempPath, targetPath);
        const newImg = new Image({
          title: req.body.title,
          filename: imgUrl + ext,
          description: req.body.description,
        });
        const imageSaved = await newImg.save();
        res.redirect("./image/" + imgUrl);
      } else {
        await fs.unlink(imageTempPath);
        res.status(500).json({ error: "ONLY IMAGES ARE ALLOW" });
      }
    }
  };

  saveImage();
};

ctrl.like = async (req, res) => {
  const image = await Image.findOne({
    filename: { $regex: req.params.image_id },
  });
  if (image) {
    image.likes = image.likes + 1;
    await image.save();
    res.json({ like: image.likes });
  } else {
    res.status(500).json({ error: "Internal Error" });
  }
};

ctrl.comment = async (req, res) => {
  const image = await Image.findOne({
    filename: { $regex: req.params.image_id },
  }).lean();
  if (image) {
    const newComment = new Comment(req.body);
    newComment.gravatar = md5(newComment.email);
    newComment.image_id = image._id;
    await newComment.save();
    res.redirect("/images/" + image.filename + "#" + newComment._id);
  } else {
    res.redirect("/");
  }
};

ctrl.remove = async (req, res) => {
  const image = await Image.findOne({
    filename: { $regex: req.params.image_id },
  });
  if (image) {
    // await fs.unlink(path.resolve("./src/public/uploads/" + image.filename));
    // await Comment.deleteOne({ image_id: image_id });
    // await image.remove();
    res.json(true)
  }
};

module.exports = ctrl;
