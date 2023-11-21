/** @format */
const express = require("express");
const exphbs = require("express-handlebars");

const path = require("path");
const morgan = require("morgan");
const multer = require("multer");
const erroaHndlers = require("errorhandler");

const routes = require("../routes/index");

module.exports = (app) => {
  //Settings
  app.set("port", process.env.PORT || 3000);
  //node sabe donde esta la carpeta views
  app.set("views", path.join(__dirname, "../views"));

  //handlebar
  const hbs = exphbs.create({
    defaultLayout: "main",
    partialsDir: path.join(app.get("views"), "partials"),
    layoutsDir: path.join(app.get("views"), "layouts"),
    extname: ".hbs",
    helpers: require("./helpers"),

   
  });

  app.engine(".hbs", hbs.engine);
  app.set("view engine", ".hbs");

  //middlewares
  app.use(morgan("dev"));
  app.use(
    multer({ dest: path.join(__dirname, "../public/uploads/temp")}).single(
      "image"
    )
  );
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  // routes
  routes(app);

  // static files
  app.use("/public", express.static(path.join(__dirname, "../public")));

  // errohandlers
  if ("development" === app.get("env")) {
    app.use(erroaHndlers);
  }

  return app;
};
