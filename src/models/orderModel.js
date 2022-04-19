const mongoose = require("mongoose");



const objectId = mongoose.Types.ObjectId;

const orderSchema = new mongoose.Schema({
  userId: {
    type: objectId,
    refs: "User",
    required: true,
    unique: true,
  },
  items: [
    {
      productId: { type: objectId, refs: "Product", required: true },
      quantity: {
        type: Number,
        required: true,
        minLen: 1,
      },
    },
  ],
  totalPrice: {
    type: Number,
    required:true,
  },
  totalItems: { 
      type: Number,
       required: true 
    },
  totalQuantity: {
    type: Number,
    required: true,
  },
  cancellable: { type: Boolean, default: true },
  status: {
    type: String,
    default: "pending",
    enum:["pending", "completed", "cancled"] ,
  },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
},{ timestamps:true });

module.exports = mongoose.model("Order", orderSchema);