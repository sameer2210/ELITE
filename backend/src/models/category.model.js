import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

categorySchema.index(
  { name: "text", description: "text" },
  {
    weights: { name: 10, description: 3 },
    name: "category_text_search_idx",
  }
);

const Category = mongoose.model("Category", categorySchema);

export default Category;
