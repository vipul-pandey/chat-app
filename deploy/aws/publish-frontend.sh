#!/usr/bin/env bash
set -euo pipefail
bucket=chat-app-frontend-559947224926-ap-south-1
test -s frontend/build/index.html
# Upload assets before HTML; retain old assets for open tabs and rollback.
aws s3 sync frontend/build/ "s3://$bucket/" --exclude index.html --exclude 'static/*' --cache-control 'public,max-age=300' --region ap-south-1 --only-show-errors
aws s3 sync frontend/build/static/ "s3://$bucket/static/" --cache-control 'public,max-age=31536000,immutable' --region ap-south-1 --only-show-errors
aws s3 cp frontend/build/index.html "s3://$bucket/index.html" --cache-control 'no-cache,no-store,must-revalidate' --content-type 'text/html' --region ap-south-1 --only-show-errors
