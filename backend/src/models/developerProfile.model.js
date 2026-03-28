import mongoose from "mongoose";

const developerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    technologies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Technology",
      },
    ],
    experienceYears: {
      type: Number,
      min: 0,
    },
    hourlyRate: {
      type: Number,
      min: 0,
    },
    availability: {
      type: String,
      trim: true,
    },
    portfolioProjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
      },
    ],
    awards: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Award",
      },
    ],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: 0,
    },
    location: {
      type: String,
      trim: true,
    },
    github: {
      type: String,
      trim: true,
    },
    linkedin: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

developerProfileSchema.index({ skills: 1 });
developerProfileSchema.index({ technologies: 1 });
developerProfileSchema.index({ availability: 1 });
developerProfileSchema.index({ location: 1 });
developerProfileSchema.index({ createdAt: -1 });
developerProfileSchema.index(
  { title: "text", bio: "text", skills: "text", location: "text" },
  {
    weights: { title: 6, skills: 5, bio: 3, location: 1 },
    name: "developer_profile_text_search_idx",
  }
);

const DeveloperProfile = mongoose.model(
  "DeveloperProfile",
  developerProfileSchema
);

export default DeveloperProfile;
