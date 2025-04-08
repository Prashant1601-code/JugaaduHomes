const { check, validationResult } = require("express-validator");
const { User } = require("../models/user");
const bcrypt = require("bcrypt");
exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    pageTitle: "Login Page",
    currentPage: "login",
    isLoggedIn: false,
    errors: [],
    oldInput: { email: "" },
    user: {},
  });
};
exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    pageTitle: "Signup Page",
    currentPage: "signup  ",
    isLoggedIn: false,
    errors: [],
    oldInput: {
      firstName: "",
      lastName: "",
      email: "",
      userType: "",
      user: {},
    },
  });
};
exports.postSignup = [
  check("firstName")
    .notEmpty()
    .withMessage("First Name is required")
    .isLength({ min: 2 })
    .withMessage("First Name must be at least 3 characters long")
    .trim()
    .matches(/^[A-Za-z\s]+$/)
    .withMessage("First Name must contain only alphabets and spaces"),

  check("lastName")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Last Name must be at least 3 characters long")
    .matches(/^[A-Za-z\s]+$/)
    .withMessage("Last Name must contain only alphabets and spaces"),

  check("email")
    .isEmail()
    .withMessage("Invalid email address")
    .normalizeEmail(),

  check("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number")
    .matches(/[!@#$%^&*(),.?:{}]/)
    .withMessage("Password must contain at least one special character"),

  check("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match");
    }
    return true;
  }),

  check("userType")
    .notEmpty()
    .withMessage("User Type is required")
    .isIn(["guest", "host"])
    .withMessage("Invalid User Type"),

  check("terms")
    .notEmpty()
    .withMessage("You must agree to the terms and conditions")
    .custom((value, { req }) => {
      if (value !== "on") {
        throw new Error("You must agree to the terms and conditions");
      }
      return true;
    }),
  (req, res, next) => {
    const { firstName, lastName, email, password, userType } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render("auth/signup", {
        pageTitle: "Signup Page",
        currentPage: "signup",
        isLoggedIn: false,
        errors: errors.array().map((error) => error.msg),
        oldInput: { firstName, lastName, email, password, userType },
        user: {},
      });
    }

    bcrypt
      .hash(password, 12)
      .then((hashedPassword) => {
        const user = new User({
          firstName,
          lastName,
          email,
          password: hashedPassword,
          userType,
        });
        return user.save();
      })
      .then(() => {
        res.redirect("/login");
      })
      .catch((error) => {
        return res.status(422).render("auth/signup", {
          pageTitle: "Signup Page",
          currentPage: "signup",
          isLoggedIn: false,
          errors: [error.message],
          oldInput: { firstName, lastName, email, userType },
          user: {},
        });
      });
  },
];
exports.postLogin = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(422).render("auth/login", {
      pageTitle: "Login Page",
      currentPage: "login",
      isLoggedIn: false,
      errors: ["user not exist"],
      oldInput: { email },
      user: {},
    });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(422).render("auth/login", {
      pageTitle: "Login Page",
      currentPage: "login",
      isLoggedIn: false,
      errors: ["Invalid email or password"],
      oldInput: { email },
      user: {},
    });
  }
  req.session.isLoggedIn = true;
  req.session.user = user;
  await req.session.save();
  res.redirect("/");
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
};
