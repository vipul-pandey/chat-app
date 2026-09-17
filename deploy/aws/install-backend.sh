#!/usr/bin/env bash
# Run as root after extracting a release and securely installing backend.env.
set -euo pipefail
release=${1:?Usage: install-backend.sh /opt/chat-app/releases/RELEASE}
case "$release" in /opt/chat-app/releases/*) ;; *) exit 2 ;; esac
test -f "$release/backend/server.js"
test -s /etc/chat-app/backend.env
id chatapp >/dev/null 2>&1 || useradd --system --home-dir /opt/chat-app --shell /usr/sbin/nologin chatapp
chown -R chatapp:chatapp "$release"
cd "$release"
runuser -u chatapp -- env npm_config_cache=/tmp/chat-app-npm-cache npm ci --omit=dev --no-audit --no-fund
install -m 0644 "$release/deploy/aws/chat-app.service" /etc/systemd/system/chat-app.service
previous=$(readlink -f /opt/chat-app/current || true)
ln -sfn "$release" /opt/chat-app/current
systemctl daemon-reload
systemctl enable chat-app
systemctl restart chat-app
for attempt in $(seq 1 30); do
    if curl --fail --silent http://127.0.0.1:5100/api/health; then
        exit 0
    fi
    sleep 2
done
if [[ -n "$previous" && "$previous" != "$release" ]]; then
    ln -sfn "$previous" /opt/chat-app/current
    install -m 0644 "$previous/deploy/aws/chat-app.service" /etc/systemd/system/chat-app.service
    systemctl daemon-reload
    systemctl restart chat-app
    echo 'Backend readiness failed; restored the previous release.' >&2
else
    echo 'Backend readiness failed; no previous release is available.' >&2
fi
exit 1
