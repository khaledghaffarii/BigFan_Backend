const { User } = require("../models/user");
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const router = express.Router();
const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};
const emailValidator = require("email-validator");
const { sendConfirmationEmail } = require("../helpers/sendMailer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("invalid image type");

    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, "public/uploads");
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(" ").join("-");
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});
const uploadOptions = multer({ storage: storage });

router.get(`/`, async (req, res) => {
  const userList = await User.find().select("-passwordHash  -confPasswordHash");

  if (!userList) {
    res.status(500).json({ success: false });
  }
  res.send(userList);
});

router.get("/:id", async (req, res) => {
  const user = await User.findById(req.params.id).select(
    "-passwordHash  -confPasswordHash"
  );

  if (!user) {
    res
      .status(500)
      .json({ message: "The user with the given ID was not found." });
  }
  res.status(200).send(user);
});

router.post("/", uploadOptions.single("image"), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).send("No image in the request");

  const fileName = file.filename;
  const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
  User.findOne({ email: req.body.email }).then(async (user) => {
    if (user) {
      console.log("email is already exist ! ");
      return res.status(400).send("email is already exist !");
    } else {
      let user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        image: `${basePath}${fileName}`,
        passwordHash: bcrypt.hashSync(
          JSON.stringify(req.body.passwordHash),
          10
        ),
        confPasswordHash: bcrypt.hashSync(
          JSON.stringify(req.body.confPasswordHash),
          10
        ),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        country: req.body.country,
      });
      console.log(
        "🚀 ~ file: users.js ~ line 78 ~ router.post ~ basePath",
        basePath
      );

      user = await user.save();
      if (!emailValidator.validate(req.body.email)) {
        return res.status(400).send("The Email is invalid ");
      }
      if (!user) return res.status(400).send("the user cannot be created!");
      if (req.body.passwordHash != req.body.confPasswordHash) {
        return res
          .status(400)
          .send("passwords are not confirmed, it must match !!");
      }
      return res.send(user);
    }
  });
});

router.put("/:id", uploadOptions.single("image"), async (req, res) => {
  const userExist = await User.findById(req.params.id);
  let newPassword;

  if (req.body.passwordHash) {
    newPassword = bcrypt.hashSync(JSON.stringify(req.body.passwordHash), 10);
  } else {
    newPassword = userExist.passwordHash;
  }

  const file = req.file;
  if (!file) return res.status(400).send("No image in the request");

  const fileName = file.filename;
  const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      passwordHash: newPassword,
      phone: req.body.phone,
      image: `${basePath}${fileName}`,
      phone: req.body.phone,
      isAdmin: req.body.isAdmin,
      country: req.body.country,
    },
    { new: true }
  );
  if (!emailValidator.validate(req.body.email)) {
    return res.status(400).send("The Email is invalid ");
  }
  if (!user) return res.status(400).send("the user cannot be created!");

  res.send(user);
});
//delete all user just the admin
router.delete("/", (req, res) => {
  User.remove({ isAdmin: { $ne: "true" } })
    .then((user) => {
      if (user) {
        return res
          .status(200)
          .json({ success: true, message: "the user is deleted!" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "user not found!" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: err });
    });
});
//delete one user
router.delete("/:id", (req, res) => {
  User.findByIdAndRemove(req.params.id)
    .then((user) => {
      if (user) {
        return res
          .status(200)
          .json({ success: true, message: "the user is deleted!" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "user not found!" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: err });
    });
});

router.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  const secret = process.env.secret;
  if (!emailValidator.validate(req.body.email)) {
    return res.status(400).send("The Email is invalid ");
  }
  if (!user) {
    return res.status(400).send("The user not found");
  }
  if (
    user &&
    bcrypt.compareSync(JSON.stringify(req.body.password), user.passwordHash) &&
    !user.isActive
  ) {
    const token = jwt.sign(
      {
        userId: user.id,
        isAdmin: user.isAdmin,
      },
      secret,
      { expiresIn: "1d" }
    );

    res.status(200).send({
      user: user.email,
      token: token,
      message: "veuillez verifier votre boite email pour l'activation",
    });
  } else {
    res.status(400).send("password is wrong!");
  }
});

router.post("/register", uploadOptions.single("image"), async (req, res) => {
  //method for create a rondom string character
  const character =
    "123456789abcdefghijklmnopqrstuvwxzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let activationCode = "";
  for (let i = 0; i < 25; i++) {
    activationCode += character[Math.floor(Math.random() * character.length)];
  }

  const file = req.file;
  if (!file) return res.status(400).send("No image in the request");

  const fileName = file.filename;
  const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

  User.findOne({ email: req.body.email }).then(async (user) => {
    if (user) {
      //console.log("email is already exist ! ");
      return res.status(400).send("email is already exist !");
    } else {
      let user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        image: `${fileName}`,
        passwordHash: bcrypt.hashSync(
          JSON.stringify(req.body.passwordHash),
          10
        ),
        confPasswordHash: bcrypt.hashSync(
          JSON.stringify(req.body.passwordHash),
          10
        ),
        phone: req.body.phone,
        country: req.body.country,
        activationCode: activationCode,
      });
      console.log(user.image);
      if (!user) return res.status(400).send("the user cannot be created!");
      if (!emailValidator.validate(req.body.email)) {
        return res.status(400).send("The Email is invalid ");
      }

      if (
        req.body.passwordHash.length < 5 ||
        req.body.passwordHash.length > 10
      ) {
        return res
          .status(400)
          .send("Password Should contain  5 to 10 character");
      }

      if (req.body.passwordHash === req.body.confPasswordHash) {
        user = await user.save();
        sendConfirmationEmail(user.email, user.activationCode);
        return res.send(user);
      } else {
        res.status(401).send("passwords are not confirmed, it must match !!");
      }
    }

    // const blob = await new Promise((resolve, reject) => {
    //   const xhr = new XMLHttpRequest();
    //   xhr.onload = function () {
    //     resolve(xhr.response);
    //   };
    //   xhr.onerror = function (e) {
    //     reject(new TypeError("Network request failed"));
    //   };
    //   xhr.responseType = "blob";
    //   xhr.open("GET", localPath, true);
    //   xhr.send(null);
    //  });
    //  blob.close();
  });
});

router.get(`/get/count`, async (req, res) => {
  const userCount = await User.countDocuments((count) => count);

  if (!userCount) {
    res.status(500).json({ success: false });
  }
  res.send({
    userCount: userCount,
  });
});

module.exports = router;
