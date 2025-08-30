//external module
const express = require("express");
const session = require("express-session");
const mongoDbStore = require("connect-mongodb-session")(session);
const multer = require("multer");
const DB_Path =
  "mongodb+srv://prashantverma1601_db_user:zSGNe8wWnkakrJ9N@cluster0.tk0hnss.mongodb.net/JugaaduHomes?retryWrites=true&w=majority&appName=Cluster0";

const path = require("path");
const rootDir = require("./utils/pathUtil");
const authRouter = require("./routes/authRouter");
const storeRouter = require("./routes/storeRouter");
const hostRouter = require("./routes/hostRouter");
const errorController = require("./controllers/Error");
const { default: mongoose } = require("mongoose");
const { log } = require("console");

const app = express();

app.set("view engine", "ejs");

app.set("views", "views");

const store = new mongoDbStore({
  uri: DB_Path,
  collection: "sessions",
});

const randomString = (length) => {
  const characters = "abcdefghijklmnopqrstuvwxyz";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "upload/");
  },
  filename: (req, file, cb) => {
    cb(null, randomString(10) + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const multerOption = {
  storage,
  fileFilter,
};

app.use(multer(multerOption).single("image"));

// const storageRule = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "./rules");
//   },
//   filename: (req, file, cb) => {
//     cb(null, randomString(10) + "-" + file.originalname);
//   },
// });
// const fileFilterRule = (req, file, cb) => {
//   // Accept only PDF files
//   if (file.mimetype === "application/pdf") {
//     cb(null, true);
//   } else {
//     cb(null, false); // Reject the file if not PDF
//   }
// };

// const multerOptionRule = {
//   storage: storageRule,
// fileFilter: fileFilterRule,
// };

// app.post("/rules", rules.single("pdf"), (req, res) => {
//   console.log(req.body);
//   console.log(req.file);
//   return res.redirect("host/host-home-list");
// });

app.use(express.static(path.join(rootDir, "public")));
app.use("/upload", express.static(path.join(rootDir, "upload")));
app.use("/host/upload", express.static(path.join(rootDir, "upload")));
app.use("/homes/upload", express.static(path.join(rootDir, "upload")));

app.use(express.urlencoded());

app.use(
  session({
    secret: "Prashant Verma",
    resave: false,
    saveUninitialized: true,
    store: store,
  })
);
app.use((req, res, next) => {
  req.isLoggedIn = req.session.isLoggedIn;

  next();
});

app.use(authRouter);
app.use(storeRouter);
app.use("/host", (req, res, next) => {
  if (req.isLoggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
});
app.use("/host", hostRouter);

app.use(errorController.pageNotFound);

const PORT = 3000;

mongoose
  .connect(DB_Path)
  .then(() => {
    console.log("Connected to mongoDb");
    app.listen(PORT, () => {
      console.log(`Server is running on port http://localhost:3000 ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Error Found on connecting", err);
  });
