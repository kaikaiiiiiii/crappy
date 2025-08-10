#!/bin/bash

# 如果 $1 为空则设置为 "transmission-daemon"
process_name=${1:-"transmission-daemon"}

# 获取进程PID
pid=$(pgrep -fo "$process_name")

if [ -z "$pid" ]; then
  echo "未找到进程：$process_name"
  exit 1
fi

# 设置OOM score为-1000
echo "-1000" > "/proc/$pid/oom_score_adj"

echo "已将进程 $process_name (PID: $pid) 的OOM score设置为-1000"
