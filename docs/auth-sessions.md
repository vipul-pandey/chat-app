# Access-token renewal

Login and signup now issue a 15-minute JWT plus a fixed 90-day refresh session.
The opaque refresh credential lives only in a host-only HttpOnly, SameSite=Strict
cookie (Secure on Render/production). MongoDB stores its SHA-256 hash in
`refreshsessions`; raw refresh credentials are never returned in JSON or stored
in localStorage. Refresh credentials are reusable within their fixed lifetime;
they are not rotated on every refresh, so concurrent browser tabs can safely
renew. Expiry is checked on each refresh, independently of TTL cleanup.

On a protected API authentication failure, the shared Axios client performs one
refresh request and retries once. Parallel requests share that refresh. Auth
failures clear the local login and redirect to the login screen. Network/5xx
failures preserve the session. Logout deletes the server refresh session and
clears the cookie; failure leaves the UI logged in so the user can retry logout.
Previously issued access JWTs remain valid until their expiry (15 minutes for
new tokens); logout does not maintain an access-token revocation list.

Refresh restores API access, not database availability: paused Atlas clusters
still need to be resumed. Socket authentication is unchanged by this feature.

## Deployment

1. Deploy the backend changes to Render and frontend changes to Vercel together.
   During a mixed-version rollout, old frontend login/signup requests will fail
   the new authentication-request header check. Reload after both deployments.
2. Keep Vercel's project root set to `frontend` so `frontend/vercel.json` applies.
   Production Axios uses same-origin `/api` and the rewrite forwards to Render.
   This makes the refresh cookie first-party instead of depending on third-party
   cookies between vercel.app and onrender.com. Socket.IO still connects directly
   to Render. Do not override the production API URL to call Render directly.
3. Render must retain `JWT_SECRET` and `MONGO_URI`. No additional secret/package
   is required. `FRONTEND_ORIGINS` optionally overrides the comma-separated origin
   allowlist; its default includes the existing Vercel URL and localhost:3000.
   Add exact custom or preview frontend origins if needed, never `*`.
4. Existing sessions must log in once to receive a refresh cookie. An expired
   legacy JWT without a refresh cookie redirects to login. Valid legacy JWTs
   remain accepted until expiry; login again to opt into renewal immediately.
5. For development, the existing localhost:5100 backend setting is preserved.
   Run the frontend on localhost:3000 and backend on localhost:5100, both using
   the same hostname. The development cookie is not Secure.

The profile-update route now requires authentication and matching ownership;
previously this endpoint could mint a token without validating the caller.

## Verification

- `npm run test:auth` at the repository root: real local HTTP requests through
  Express handlers with in-memory model doubles (no production database writes).
- `npm run test:auth --prefix frontend`: Axios refresh/concurrency/logout tests.
- `npm run build --prefix frontend`: production compile.
- After deployment: log in, confirm `chat_refresh` exists as HttpOnly/Secure under
  the Vercel domain, then wait 15 minutes. A chat API request should cause one
  `/api/user/refresh` request, then succeed on retry. Logout should clear the cookie.
- Hosted Vercel cookie forwarding and real MongoDB persistence require this
  deployment smoke check; local automated tests do not verify those services.
