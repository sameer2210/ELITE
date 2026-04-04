import { OAuth2Client } from "google-auth-library";
import User from "../models/user.model.js";
import { clearAuthCookie, setAuthCookie } from "../utils/authCookie.js";
import generateToken from "../utils/generateToken.js";

const allowedRoles = new Set(["developer", "client"]);

const getSafeRole = (role) => (allowedRoles.has(role) ? role : "client");

const serializeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  profilePic: user.profilePic || user.avatar || "",
  googleId: user.googleId || null,
});

const sendAuthResponse = (res, user, statusCode = 200) => {
  const token = generateToken(user._id);
  setAuthCookie(res, token);

  res.status(statusCode).json({
    ...serializeUser(user),
    token,
  });
};

const getGoogleAudienceList = () => {
  const rawIds =
    process.env.GOOGLE_CLIENT_IDS || process.env.GOOGLE_CLIENT_ID || "";
  const audience = rawIds
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (!audience.length) {
    const error = new Error(
      "Google OAuth is not configured. Set GOOGLE_CLIENT_ID (or GOOGLE_CLIENT_IDS)."
    );
    error.statusCode = 500;
    throw error;
  }

  return audience;
};

const getGoogleClient = () => {
  return new OAuth2Client();
};

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Name, email and password are required.");
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400);
      throw new Error("User already exists");
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password,
      role: getSafeRole(role),
    });

    sendAuthResponse(res, user, 201);
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error("Email and password are required.");
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    if (!user.password) {
      res.status(400);
      throw new Error(
        "This account uses Google sign-in. Continue with Google to log in."
      );
    }

    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    sendAuthResponse(res, user);
  } catch (error) {
    next(error);
  }
};

export const googleAuth = async (req, res, next) => {
  try {
    const { token: googleIdToken, role } = req.body;

    if (!googleIdToken) {
      res.status(400);
      throw new Error("Google ID token is required.");
    }

    const audience = getGoogleAudienceList();
    const oauthClient = getGoogleClient();

    const ticket = await oauthClient.verifyIdToken({
      idToken: googleIdToken,
      audience,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      res.status(401);
      throw new Error("Invalid Google token payload.");
    }

    const googleId = payload.sub;
    const email = payload.email?.toLowerCase();
    const name = payload.name?.trim();
    const profilePic = payload.picture || "";
    const isEmailVerified = Boolean(payload.email_verified);

    if (!googleId || !email || !isEmailVerified) {
      res.status(401);
      throw new Error("Google account must have a verified email.");
    }

    if (!allowedRoles.has(role)) {
      res.status(400);
      throw new Error("Account type must be either client or developer.");
    }

    const selectedRole = role;
    let user = await User.findOne({ email });
    let isNewUser = false;

    if (!user) {
      user = await User.create({
        name: name || email.split("@")[0],
        email,
        googleId,
        profilePic,
        avatar: profilePic,
        role: selectedRole,
        isVerified: true,
      });
      isNewUser = true;
    } else {
      if (user.googleId && user.googleId !== googleId) {
        res.status(409);
        throw new Error("This email is linked to a different Google account.");
      }

      if (!user.googleId) user.googleId = googleId;
      if (name && !user.name) user.name = name;
      if (profilePic) user.profilePic = profilePic;
      if (profilePic && !user.avatar) user.avatar = profilePic;
      if (!user.isVerified && isEmailVerified) user.isVerified = true;

      await user.save();
    }

    const token = generateToken(user._id);
    setAuthCookie(res, token);

    res.status(200).json({
      ...serializeUser(user),
      token,
      isNewUser,
    });
  } catch (error) {
    if (error?.message?.includes("Wrong recipient")) {
      error.message =
        "Google verification failed: client ID mismatch. Ensure frontend VITE_GOOGLE_CLIENT_ID and backend GOOGLE_CLIENT_ID/GOOGLE_CLIENT_IDS are aligned.";
    }

    if (!res.statusCode || res.statusCode === 200) {
      res.status(error.statusCode || 401);
    }
    next(error);
  }
};

export const logoutUser = async (req, res) => {
  clearAuthCookie(res);
  res.status(200).json({ message: "Logged out successfully." });
};
