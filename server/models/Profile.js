import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  businessName: { type: String, default: "" },
  owner: { type: String, default: "" },
  phone: { type: String, default: "" },
  gst: { type: String, default: "" },
  address: { type: String, default: "" },
}, { timestamps: true });

const Profile = mongoose.model("Profile", profileSchema);
export default Profile;
