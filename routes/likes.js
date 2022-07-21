const { Like } = require("../models/like");
const { Post } = require("../models/post");
const express = require("express");

const router = express.Router();

router.get(`/`, async (req, res) => {
  const likeList = await Like.find()
    .populate("user", "firstName lastName image ")
    .populate("post", "image datePosted")
    .sort({ datelikeed: -1 });

  if (!likeList) {
    res.status(500).json({ success: false });
  }
  res.send(likeList);
});

router.get("/:id", async (req, res) => {
  const like = await Like.findById(req.params.id)
    .populate("user", "firstName lastName image ")
    .populate("post", "image datePosted")
    .sort({ datelikeed: -1 });

  if (!like) {
    res
      .status(500)
      .json({ message: "The like with the given ID was not found." });
  }
  res.status(200).send(like);
});

router.post("/posts/:postId/likes", async (req, res) => {
  let like = new Like({
    user: req.body.user,
  });

  like = await like
    .save()
    .then(() => Post.findById(req.params.postId))
    .then((post) => {
      post.like.unshift(like);
      return post.save();
    })
    // .then(() => res.redirect("/"))
    .catch((err) => {
      console.log(err);
    });

  if (!like) return res.status(400).send("the user cannot be created!");

  res.send(like);
});

router.delete("/:id", (req, res) => {
  Like.findByIdAndRemove(req.params.id)
    .then((like) => {
      if (like) {
        return res
          .status(200)
          .json({ success: true, message: "the like is deleted!" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "like not found!" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: err });
    });
});

router.get(`/get/count`, async (req, res) => {
  const likeCount = await Like.countDocuments();
  console.log(
    "🚀 ~ file: likes.js ~ line 68 ~ router.get ~ likeCount",
    likeCount
  );

  if (!likeCount) {
    res.status(500).json({ success: false });
  }
  res.send({
    likeCount: likeCount,
  });
});
// router.get(`/get/count/:id`, async (req, res) => {
//   const postLikeList = await Like.aggregate().sort({ dateLiked: -1 });
//   console.log(postLikeList.length);

//   if (!postLikeList) {
//     res.status(500).json({ success: false });
//   }
//   res.send(postLikeList);
// });

module.exports = router;
