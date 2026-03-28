import mongoose from "mongoose";

const clientProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    companyName: {
      type: String,
      trim: true,
    },
    industry: {
      type: String,
      trim: true,
    },
    companySize: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

clientProfileSchema.index({ industry: 1 });
clientProfileSchema.index({ companySize: 1 });
clientProfileSchema.index({ location: 1 });
clientProfileSchema.index({ createdAt: -1 });
clientProfileSchema.index(
  {
    companyName: "text",
    industry: "text",
    location: "text",
    description: "text",
  },
  {
    weights: { companyName: 7, industry: 5, location: 2, description: 3 },
    name: "client_profile_text_search_idx",
  }
);

const ClientProfile = mongoose.model("ClientProfile", clientProfileSchema);

export default ClientProfile;
