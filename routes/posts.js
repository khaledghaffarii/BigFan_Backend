const { Post } = require("../models/post");
const { Comment } = require("../models/comment");
const express = require("express");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const router = express.Router();

const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

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
  const postList = await Post.find()
    // .populate("user", "firstName lastName image ")
    // .populate("comments", "on_comment datecommented")
    // .populate("like", "user")
    // .sort({ datePosted: -1 });

  if (!postList) {
    res.status(500).json({ success: false });
  }
  const commentList = await Comment.find().populate("post");
  // console.log(
  //   "🚀 ~ file: posts.js ~ line 41 ~ router.get ~ commentList",
  //   commentList
  // );
 
  res.send(postList);
});

router.get("/:id", async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate("comments", "on_comment datecommented ")
    .populate("user", "firstName lastName image ")
    .sort({ datePosted: -1 });

  if (!post) {
    res
      .status(500)
      .json({ message: "The post with the given ID was not found." });
  }
  res.status(200).send(post);
});

router.post("/", async (req, res) => {
  let post = new Post({
    image: req.body.image,
    video: req.body.video,
    visibility: req.body.visibility,
    user: req.body.user,
   // address_location: req.body.address_location,
  });
  post = await post.save();
  if (!post) return res.status(400).send("the user cannot be created!");
  res.send(post);
});

router.put("/:id", uploadOptions.single("image"), async (req, res) => {
  const postExist = await Post.findById(req.params.id);
  const file = req.file;
  let imagepath;
  console.log(
    "🚀 ~ file: posts.js ~ line 97 ~ router.put ~ req.body.status",
    file
  );

  if (file) {
    const fileName = file.filename;
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
    imagepath = `${basePath}${fileName}`;
  } else {
    imagepath = postExist.image;
  }

  const post = await Post.findByIdAndUpdate(
    req.params.id,
    {
      image: imagepath,
      video: req.body.video,
      //address_location: req.body.address_location,
      visibility: req.body.visibility,
      user: req.body.user,
      //status: req.body.status,
    },
    { new: true }
  );

  if (!post) return res.status(400).send("the post cannot be update!");
  res.send(post);
});

router.delete("/:id", (req, res) => {
  Post.findByIdAndRemove(req.params.id)
    .then((post) => {
      if (post) {
        return res
          .status(200)
          .json({ success: true, message: "the post is deleted!" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "post not found!" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: err });
    });
});
//delete all post 
router.delete("/", (req, res) => {
  Post.remove()
    .then((post) => {
      if (post) {
        return res
          .status(200)
          .json({ success: true, message: "the all posts is deleted!" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "post not found!" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: err });
    });
});
// router.get('/get/totalsales', async (req, res) => {
//   const totalSales = await Order.aggregate([
//       { $group: { _id: null, totalsales: { $sum: '$totalPrice' } } }
//   ])

//   if (!totalSales) {
//       return res.status(400).send('The order sales cannot be generated')
//   }

//   res.send({ totalsales: totalSales.pop().totalsales })
// })
router.post("/:id/comment", async (req, res) => {
  const comment = new Comment({
    on_comment: req.body.on_comment,
    post: req.params.id,
  });
  // save comment
  await comment.save();

  const postRelated = await Post.findById(req.params.id);
  // push the comment into the post.comments array
  postRelated.comments.push(comment);
  res.send(comment);
  // save and redirect...
  // await postRelated.save(function(err) {
  // if(err) {console.log(err)}
  // res.redirect('/')
  // })
});
module.exports = router;
