import axios from "../../api/config";
import { toast } from "react-toastify";
import { LoginUser, LogoutUser, SetLoading } from "../reducers/userSlice";

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const normalizeUser = (user = {}, fallback = {}) => {
  const base = { ...(fallback || {}), ...(user || {}) };
  if (!Object.keys(base).length) return null;

  const normalized = { ...base };
  normalized.id = base._id || base.id || null;

  if (typeof normalized.isAdmin !== "boolean") {
    normalized.isAdmin = base.role === "admin";
  }

  if (!normalized.name) {
    normalized.name = base.fullName || base.username || "";
  }
  if (!normalized.fullName && normalized.name) {
    normalized.fullName = normalized.name;
  }

  if (!Array.isArray(normalized.cart)) {
    normalized.cart = [];
  }

  delete normalized._id;
  delete normalized.password;
  delete normalized.token;

  return normalized;
};

const persistUser = (user, fallback, dispatch) => {
  const normalized = normalizeUser(user, fallback);
  if (!normalized) {
    dispatch(LogoutUser());
    return null;
  }
  localStorage.setItem("user", JSON.stringify(normalized));
  dispatch(LoginUser(normalized));
  return normalized;
};

const clearClientAuthState = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
};

const getErrorMessage = (error, fallback) => {
  return error?.response?.data?.message || fallback;
};

const buildProfilePayload = (user = {}) => {
  const payload = {
    name: user.name || user.fullName,
    email: user.email,
    password: user.password,
  };

  Object.keys(payload).forEach((key) => {
    if (payload[key] === undefined || payload[key] === "") {
      delete payload[key];
    }
  });

  return payload;
};

export const asynccurrentuser = () => async (dispatch) => {
  dispatch(SetLoading(true));
  try {
    const storedUser = getStoredUser();
    const { data } = await axios.get("/api/user/profile");
    persistUser(data, storedUser, dispatch);
  } catch {
    clearClientAuthState();
    dispatch(LogoutUser());
  } finally {
    dispatch(SetLoading(false));
  }
};

export const asyncsigninuser = (user) => async (dispatch) => {
  try {
    const payload = {
      email: user.email,
      password: user.password,
      role: user.role,
    };
    const { data } = await axios.post("/api/auth/signin", payload);
    const storedUser = getStoredUser();
    persistUser(data, storedUser, dispatch);
    localStorage.removeItem("token");
    toast.success("Logged in successfully!");
  } catch (error) {
    toast.error(getErrorMessage(error, "Wrong email or password"));
  }
};

export const asyncGoogleSignin = (payload) => async (dispatch) => {
  try {
    const { data } = await axios.post("/api/auth/google", payload);
    const storedUser = getStoredUser();
    persistUser(data, storedUser, dispatch);
    localStorage.removeItem("token");
    toast.success("Logged in with Google successfully!");
    return data;
  } catch (error) {
    const message = getErrorMessage(
      error,
      "Google login failed. Please try again."
    );
    toast.error(message);
    throw new Error(message);
  }
};

export const asyncsignupuser = (user) => async (dispatch) => {
  try {
    const payload = {
      name: user.name || user.fullName || user.username,
      email: user.email,
      password: user.password,
      role: user.role,
    };

    const { data } = await axios.post("/api/auth/signup", payload);
    const storedUser = getStoredUser();
    persistUser({ ...user, ...data }, storedUser, dispatch);
    localStorage.removeItem("token");
    toast.success("Registered successfully!");
  } catch (error) {
    toast.error(getErrorMessage(error, "Something went wrong during signup"));
  }
};

export const asynclogoutuser = () => async (dispatch) => {
  try {
    await axios.post("/api/auth/logout");
  } catch (error) {
    console.error("Server logout failed:", error);
  } finally {
    clearClientAuthState();
    dispatch(LogoutUser());
    toast.success("Logged out successfully!");
  }
};

export const asyncupdateuser = (userId, user) => async (dispatch) => {
  void userId;
  try {
    const payload = buildProfilePayload(user);
    const { data } = await axios.put("/api/user/profile", payload);

    if (data) {
      const storedUser = getStoredUser();
      persistUser({ ...storedUser, ...user, ...data }, storedUser, dispatch);
      toast.success("Profile updated successfully!");
    } else {
      toast.error("Failed to update user profile.");
    }
  } catch (error) {
    toast.error(
      getErrorMessage(error, "Error updating profile. Please try again.")
    );
  }
};

export const asyncdeleteuser = () => async (dispatch) => {
  try {
    await axios.delete("/api/user/profile");
    clearClientAuthState();
    dispatch(LogoutUser());
    toast.success("Your account has been deleted.");
  } catch (error) {
    toast.error(
      getErrorMessage(error, "Failed to delete account. Please try again.")
    );
  }
};
