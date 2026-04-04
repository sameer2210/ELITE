import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { asyncGoogleSignin } from "../../store/actions/userActions";

export const useGoogleAuth = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const loginWithGoogle = useCallback(
    async ({ idToken, role }) => {
      if (!role) {
        setError("Select account type before continuing with Google.");
        return { ok: false };
      }

      if (!idToken) {
        setError("Google login failed. Missing ID token.");
        return { ok: false };
      }

      try {
        setIsLoading(true);
        setError("");
        await dispatch(asyncGoogleSignin({ token: idToken, role }));
        return { ok: true };
      } catch (err) {
        setError(err.message || "Google login failed.");
        return { ok: false };
      } finally {
        setIsLoading(false);
      }
    },
    [dispatch]
  );

  return {
    loginWithGoogle,
    isLoading,
    error,
    clearError: () => setError(""),
    setErrorMessage: (message) => setError(message || ""),
  };
};

export default useGoogleAuth;
