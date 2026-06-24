#!/usr/bin/env bash
# cron:0 8 * * *
# new Env("酷狗签到")

set -e
set -u
set -o pipefail

REPO_DIR="../../repo/smr8890_KuSign-Qinglong"

cd "$REPO_DIR"

#拉取api模块
git submodule update --init --recursive

#安装依赖
pnpm install