#!/bin/bash

# 确保日志目录存在
mkdir -p logs

# 显示当前工作目录
echo "工作目录: $(pwd)"

# 运行应用
echo "启动应用..."
npm run start:dev 