const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export const getAuthCookieName = () =>
  process.env.AUTH_COOKIE_NAME || "elite_auth_token";

export const getAuthCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";
  const options = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: THIRTY_DAYS_MS,
    path: "/",
  };

  if (process.env.AUTH_COOKIE_DOMAIN) {
    options.domain = process.env.AUTH_COOKIE_DOMAIN;
  }

  return options;
};

export const setAuthCookie = (res, token) => {
  res.cookie(getAuthCookieName(), token, getAuthCookieOptions());
};

export const clearAuthCookie = (res) => {
  res.clearCookie(getAuthCookieName(), {
    ...getAuthCookieOptions(),
    expires: new Date(0),
    maxAge: 0,
  });
};
