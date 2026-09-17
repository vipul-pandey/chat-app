# Backend-first AWS migration

Status: backend deployed on 2026-09-17; frontend hosting stays on Vercel.
Source repository: `vipul-pandey/chat-app`, current branch: `master`.

## Live resources

- Region: `ap-south-1`, account: `559947224926`.
- Existing EC2 instance: `i-0de4d014f0d84be58` (`mern-backend`, `t3.micro`).
- Current public IP: `43.205.138.62` (auto-assigned, not an Elastic IP).
- HTTPS backend: `https://d2suke8zow8xpc.cloudfront.net`.
- CloudFront distribution: `E1RD94HS9FYMD0`, caching disabled; all request
  headers/cookies/query strings forwarded for API and Socket.IO support.
- Node: `127.0.0.1:5100`, managed by `chat-app.service`; Nginx listens on port 80.
- Environment: `/etc/chat-app/backend.env`, root-owned with mode 0600, populated
  from the local project's settings without logging their values.
- The practice PM2 process `server` is stopped. Its files remain under
  `/home/ubuntu/mern-practice`; its original Nginx configuration is backed up at
  `/etc/chat-app/practice-nginx.backup`.

Browser-to-CloudFront traffic uses HTTPS. CloudFront-to-EC2 currently uses HTTP;
this learning setup does not provide end-to-end TLS. Configure an origin domain
with a valid TLS certificate before treating it as a hardened production setup.
An EC2 stop/start can change the auto-assigned address: reserve a stable address
or update the CloudFront origin, workflow target, and pinned SSH host entry after
an address change. A normal service restart does not change the EC2 address.

## First deployment

1. Authenticate AWS CLI locally and verify the account with `aws sts get-caller-identity`.
   Choose the region and an existing or new EC2 instance before provisioning.
2. Use an Ubuntu LTS EC2 instance with Systems Manager access, an instance role,
   and a stable outbound address for the database allowlist. Confirm instance size
   and ongoing costs before launch. Install a supported Node.js LTS and Nginx;
   the service template expects Node at `/usr/bin/node`.
3. Create a dedicated `chatapp` service user. Install a backend release under
   `/opt/chat-app/releases/<commit>` with `backend/`, `package.json`, and
   `package-lock.json`. Run `npm ci --omit=dev` in the release directory and point
   `/opt/chat-app/current` at it. Never include a local `.env` in release archives.
4. Store production settings in `/etc/chat-app/backend.env` using the example in
   `deploy/aws/backend.env.example`. Make it root-owned and mode 0600; systemd
   reads it before switching to the service user. Preserve the production MongoDB
   URI and JWT secret. If Atlas has an IP allowlist, add the EC2 outbound IP.
5. Install `deploy/aws/chat-app.service` in `/etc/systemd/system/`, run
   `systemctl daemon-reload`, and enable/start `chat-app`. Node listens only on
   loopback on 5100; do not expose that port in the EC2 security group.
6. Install the Nginx configuration, check for conflicts with its default site,
   run `nginx -t`, and reload Nginx. Verify `/api/health` returns 200 through Nginx.
   A disconnected database returns 503. Inspect `journalctl -u chat-app` on failure.
7. Establish a public HTTPS backend URL before changing the frontend. Choose a
   domain and certificate for Nginx, or a CloudFront backend distribution with
   caching disabled and API/WebSocket forwarding. Finalize origin transport and
   network restrictions with that choice; the included Nginx file alone is HTTP.

## Keep Vercel during this phase

After EC2 is healthy over HTTPS, change the `/api` destination in
`frontend/vercel.json` and the Socket.IO endpoint in `SingleChat.js` together.
Keep production Axios requests same-origin through Vercel: its proxy preserves
the existing HttpOnly, Secure, SameSite=Strict refresh cookie behavior.
Calling an unrelated EC2 domain directly from Axios would break that design.
Set `FRONTEND_ORIGINS` to the exact Vercel/custom frontend origins.

Test login, refresh, logout, two-user messaging, typing, reconnection, and AI chat.
Keep Render available until the new deployment passes these checks. A single
EC2 service restart interrupts active sockets briefly.

## GitHub automatic deployments

`.github/workflows/deploy-backend.yml` runs on pushes to `master` that affect the
backend, root manifests, AWS deployment files, or the workflow; manual dispatch
is also supported. It runs auth tests before deploying. OIDC role
`chat-app-github-deploy` trusts only this repository's `master` branch and permits
EC2 Instance Connect only to this instance as `ubuntu`. That OS user has sudo,
so write access to master must be treated as production deployment access.

The workflow creates a temporary SSH key, checks the pinned host key, uploads a
commit-tagged archive, installs locked dependencies, switches the release
symlink, restarts the service, and verifies readiness. It restores the previous
release if the new service fails readiness. Deployments are serialized. Secrets
stay in the server environment file and are not part of the release archives.
The existing SSH security-group rule allows public access; GitHub-hosted runners
use that route. A future SSM-based pipeline can remove that dependency.

Release directories are retained for rollback. This small instance has limited
disk space; prune older releases deliberately as deployments accumulate, always
retaining the current and last known-good release. Package installation failures
occur before switching the active release.

## Frontend migration later

Once backend deployment and rollback are verified, move React to private S3 with
CloudFront, forwarding `/api/*` and `/socket.io/*` to the EC2 origin. Preserve the
same-origin session design and disable caching for API/socket requests.
