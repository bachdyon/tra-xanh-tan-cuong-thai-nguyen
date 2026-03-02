#!/bin/sh
# Tạo repo GitHub và push. Chạy sau khi: gh auth login
set -e
cd "$(dirname "$0")"
REPO_NAME="tra-xanh-tan-cuong-thai-nguyen"
if git remote get-url origin 2>/dev/null; then
  echo "Remote origin đã tồn tại. Chỉ push."
  git push -u origin main
else
  echo "Tạo repo $REPO_NAME trên GitHub và push..."
  gh repo create "$REPO_NAME" --public --source=. --remote=origin --push
  echo "Xong: https://github.com/$(gh api user -q .login)/$REPO_NAME"
fi
