const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema({
 
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  dateLiked: {
    type: Date,
    default: Date.now,
  },

});

likeSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

likeSchema.set("toJSON", {
  virtuals: true,
});

exports.Like = mongoose.model("Like", likeSchema);
exports.likeSchema = likeSchema;
