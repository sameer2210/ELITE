import React from "react";
import { GoogleLogin } from "@react-oauth/google";

const GoogleGlyph = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
    <path
      fill="#EA4335"
      d="M12 10.2v3.96h5.5c-.24 1.28-.96 2.37-2.04 3.1l3.3 2.56C20.68 18.1 21.8 15.4 21.8 12c0-.7-.06-1.37-.18-2.02H12z"
    />
    <path
      fill="#34A853"
      d="M12 22c2.9 0 5.34-.96 7.12-2.62l-3.3-2.56c-.92.62-2.1 1-3.82 1-2.94 0-5.42-1.98-6.3-4.64H2.3v2.9A10 10 0 0 0 12 22z"
    />
    <path
      fill="#4A90E2"
      d="M5.7 13.18A6 6 0 0 1 5.34 12c0-.42.08-.82.2-1.2V7.9H2.3A10 10 0 0 0 2 12c0 1.6.38 3.1 1.06 4.08l2.64-2.9z"
    />
    <path
      fill="#FBBC05"
      d="M12 6.1c1.58 0 3 .54 4.12 1.58l3.08-3.08C17.34 2.86 14.9 2 12 2A10 10 0 0 0 2.3 7.9l3.24 2.9C6.56 8.08 9.04 6.1 12 6.1z"
    />
  </svg>
);

const GoogleLoginButton = ({
  selectedRole,
  isLoading,
  errorMessage,
  onCredentialSuccess,
  onGoogleUiError,
}) => {
  const hasRole = Boolean(selectedRole);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-800/50 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-medium text-white/85">
          <GoogleGlyph />
          <span>Continue with Google</span>
        </div>
        <span className="text-[11px] uppercase tracking-wider text-white/50">
          OAuth 2.0
        </span>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/95 p-2">
        <GoogleLogin
          onSuccess={(credentialResponse) =>
            onCredentialSuccess?.(credentialResponse?.credential)
          }
          onError={() =>
            onGoogleUiError?.(
              "Google sign-in failed. Check OAuth Authorized JavaScript origins and client ID."
            )
          }
          text="continue_with"
          shape="pill"
          size="large"
          width="320"
          ux_mode="popup"
          useOneTap={false}
          disabled={isLoading || !hasRole}
        />
      </div>

      {!hasRole && (
        <p className="text-xs text-amber-300">
          Select Client or Developer first, then continue with Google.
        </p>
      )}

      {isLoading && (
        <p className="text-xs text-teal-300">Verifying Google account...</p>
      )}

      {errorMessage && <p className="text-xs text-red-300">{errorMessage}</p>}
    </div>
  );
};

export default GoogleLoginButton;
