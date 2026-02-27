---
title: Reality 在 AWS 上搭建并使用 Cloudflare 进行转发
date: 2024-01-15 10:00:00
categories: 技术
tags:
  - AWS
  - Cloudflare
  - VPN
---

# Reality 在 AWS 上搭建并使用 Cloudflare 进行转发

## 概述

本文档介绍如何在 AWS 上搭建 Reality 协议服务，并通过 Cloudflare 进行流量转发，以实现更好的隐私保护和网络性能。

## 架构说明

```
客户端 → Cloudflare CDN → AWS EC2 (Reality Server)
```

## 前置要求

- AWS 账户
- Cloudflare 账户
- 已注册的域名（托管在 Cloudflare）
- 基本的 Linux 命令行知识

## 步骤一：AWS EC2 实例配置

### 1.1 创建 EC2 实例

1. 登录 AWS 控制台
2. 选择 EC2 服务
3. 点击"启动实例"
4. 推荐配置：
   - **AMI**: Ubuntu 22.04 LTS
   - **实例类型**: t3.micro 或更高（根据流量需求）
   - **区域**: 选择延迟较低的区域

### 1.2 配置安全组

在 EC2 安全组中添加以下入站规则：

| 类型 | 协议 | 端口范围 | 源 |
|------|------|----------|-----|
| SSH | TCP | 22 | 您的 IP |
| HTTPS | TCP | 443 | 0.0.0.0/0 |
| 自定义 TCP | TCP | 8443 | 0.0.0.0/0 |

### 1.3 分配弹性 IP

1. 在 EC2 控制台中选择"弹性 IP"
2. 分配新地址并关联到您的实例

## 步骤二：安装 Reality 服务

### 2.1 连接到 EC2 实例

```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### 2.2 更新系统

```bash
sudo apt update && sudo apt upgrade -y
```

### 2.3 安装 Xray-core（支持 Reality）

```bash
# 下载安装脚本
bash -c "$(curl -L https://github.com/XTLS/Xray-install/raw/main/install-release.sh)" @ install

# 或使用一键安装脚本
wget -N --no-check-certificate https://raw.githubusercontent.com/teddysun/across/master/xray.sh
chmod +x xray.sh
sudo ./xray.sh
```

### 2.4 配置 Reality

创建配置文件 `/usr/local/etc/xray/config.json`：

**重要提示**：如果不使用 Nginx 转发，Xray 需要监听在 `0.0.0.0` 以接受外部连接。如果使用 Nginx 转发，可以监听在 `127.0.0.1`。

```json
{
  "log": {
    "loglevel": "warning"
  },
  "inbounds": [
    {
      "listen": "0.0.0.0",
      "port": 8443,
      "protocol": "vless",
      "settings": {
        "clients": [
          {
            "id": "YOUR-UUID-HERE",
            "flow": "xtls-rprx-vision"
          }
        ],
        "decryption": "none"
      },
      "streamSettings": {
        "network": "tcp",
        "security": "reality",
        "realitySettings": {
          "show": false,
          "dest": "www.microsoft.com:443",
          "xver": 0,
          "serverNames": [
            "www.microsoft.com"
          ],
          "privateKey": "YOUR-PRIVATE-KEY",
          "shortIds": [
            "",
            "0123456789abcdef"
          ]
        }
      }
    }
  ],
  "outbounds": [
    {
      "protocol": "freedom",
      "tag": "direct"
    }
  ]
}
```

### 2.5 配置文件字段详解

#### 2.5.1 顶层配置

| 字段 | 说明 |
|------|------|
| `log` | 日志配置对象 |
| `inbounds` | 入站连接配置数组，定义服务器如何接收客户端连接 |
| `outbounds` | 出站连接配置数组，定义服务器如何转发流量 |

#### 2.5.2 日志配置 (log)

```json
"log": {
  "loglevel": "warning"
}
```

| 字段 | 可选值 | 说明 |
|------|--------|------|
| `loglevel` | `debug`, `info`, `warning`, `error`, `none` | 日志级别。`warning` 仅记录警告和错误 |

#### 2.5.3 入站配置 (inbounds)

```json
"inbounds": [
  {
    "listen": "0.0.0.0",
    "port": 443,
    "protocol": "vless",
    "settings": { ... },
    "streamSettings": { ... }
  }
]
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `listen` | 字符串 | 监听地址。`0.0.0.0` 表示所有网络接口（直连），`127.0.0.1` 表示仅本地（Nginx 转发） |
| `port` | 数字 | 监听端口。使用 8443（非特权端口），通过 Nginx 转发到 443 |
| `protocol` | 字符串 | 协议类型，Reality 使用 `vless` |
| `settings` | 对象 | 协议特定设置 |
| `streamSettings` | 对象 | 传输层配置 |

#### 2.5.4 VLESS 设置 (settings)

```json
"settings": {
  "clients": [
    {
      "id": "YOUR-UUID-HERE",
      "flow": "xtls-rprx-vision"
    }
  ],
  "decryption": "none"
}
```

| 字段 | 说明 |
|------|------|
| `clients` | 客户端列表，可以配置多个客户端 |
| `clients[].id` | 客户端 UUID，用于身份验证。使用 `cat /proc/sys/kernel/random/uuid` 生成 |
| `clients[].flow` | 流控模式。`xtls-rprx-vision` 是 Reality 推荐的流控方式 |
| `decryption` | 解密方式。Reality 使用 `none`（由 TLS 层加密） |

#### 2.5.5 传输配置 (streamSettings)

```json
"streamSettings": {
  "network": "tcp",
  "security": "reality",
  "realitySettings": { ... }
}
```

| 字段 | 可选值 | 说明 |
|------|--------|------|
| `network` | `tcp`, `kcp`, `ws`, `http`, `grpc` | 传输协议。Reality 通常使用 `tcp` |
| `security` | `none`, `tls`, `reality` | 安全层类型。使用 `reality` |
| `realitySettings` | 对象 | Reality 协议特定配置 |

#### 2.5.6 Reality 设置 (realitySettings)

```json
"realitySettings": {
  "show": false,
  "dest": "www.microsoft.com:443",
  "xver": 0,
  "serverNames": [
    "www.microsoft.com"
  ],
  "privateKey": "YOUR-PRIVATE-KEY",
  "shortIds": [
    "",
    "0123456789abcdef"
  ]
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `show` | 布尔值 | 是否在日志中显示调试信息。生产环境建议 `false` |
| `dest` | 字符串 | 回落目标地址。当握手失败时，伪装成访问此网站。格式: `域名:端口` |
| `xver` | 数字 | PROXY protocol 版本。`0` 表示不使用 |
| `serverNames` | 数组 | SNI 列表，客户端必须使用列表中的域名。通常与 `dest` 保持一致 |
| `privateKey` | 字符串 | 服务器私钥，使用 `/usr/local/bin/xray x25519` 生成。**必须保密** |
| `shortIds` | 数组 | 短 ID 列表，用于区分不同的客户端配置。可以包含空字符串和 16 个十六进制字符 |

**dest 字段选择建议：**
- 选择知名��稳定的 HTTPS 网站
- 推荐：`www.microsoft.com:443`, `www.apple.com:443`, `www.cloudflare.com:443`
- 必须支持 TLS 1.3
- 建议选择与服务器地理位置相近的网站

**shortIds 字段说明：**
- 空字符串 `""` 表示允许客户端不使用 shortId
- 十六进制字符串长度可以是 2-16 个字符（1-8 字节）
- 示例：`""`, `"0123456789abcdef"`, `"a1b2c3"`

#### 2.5.7 出站配置 (outbounds)

```json
"outbounds": [
  {
    "protocol": "freedom",
    "tag": "direct"
  }
]
```

| 字段 | 可选值 | 说明 |
|------|--------|------|
| `protocol` | `freedom`, `blackhole`, `vmess`, `vless`, etc. | 出站协议。`freedom` 表示直连 |
| `tag` | 字符串 | 出站连接的标识，用于路由规则 |

**常用出站协议：**
- `freedom`: 直接连接目标地址（最常用）
- `blackhole`: 阻止连接（用于广告过滤）
- `vmess`/`vless`: 链式代理

### 2.6 生成密钥对

```bash
/usr/local/bin/xray x25519
```

**输出示例：**
```
Private key: SChPg2LBZzQnvGr8aZpYmD3sLmK9qNpTrXwUyVbE1Hk
Public key: xKvN7BqM3pYzWrTgLnFdKs9RmJh6VcXaQwUyE8PbN2o
```

- **Private key**: 填入服务器 `config.json` 的 `privateKey` 字段
- **Public key**: 填入客户端配置

### 2.7 生成 UUID

```bash
cat /proc/sys/kernel/random/uuid
```

**输出示例：**
```
a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

将此 UUID 填入 `config.json` 的 `clients[].id` 字段。

### 2.8 完整配置示例

```json
{
  "log": {
    "loglevel": "warning"
  },
  "inbounds": [
    {
      "listen": "0.0.0.0",
      "port": 8443,
      "protocol": "vless",
      "settings": {
        "clients": [
          {
            "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
            "flow": "xtls-rprx-vision"
          }
        ],
        "decryption": "none"
      },
      "streamSettings": {
        "network": "tcp",
        "security": "reality",
        "realitySettings": {
          "show": false,
          "dest": "www.microsoft.com:443",
          "xver": 0,
          "serverNames": [
            "www.microsoft.com"
          ],
          "privateKey": "SChPg2LBZzQnvGr8aZpYmD3sLmK9qNpTrXwUyVbE1Hk",
          "shortIds": [
            "",
            "0123456789abcdef"
          ]
        }
      }
    }
  ],
  "outbounds": [
    {
      "protocol": "freedom",
      "tag": "direct"
    }
  ]
}
```

### 2.9 启动服务

```bash
sudo systemctl start xray
sudo systemctl enable xray
sudo systemctl status xray
```

### 2.10 配置 Nginx 转发（443 → 8443）

由于 Xray 使用非特权端口 8443，我们需要通过 Nginx 将 443 端口的流量转发到 8443。

#### 2.10.1 安装 Nginx（包含 stream 模块）

标准的 `nginx` 包可能不包含 `stream` 模块，需要安装 `nginx-full` 或检查模块是否存在：

```bash
# 先检查是否已安装 Nginx 及其版本
nginx -V 2>&1 | grep -o with-stream

# 如果没有输出或没有安装 Nginx，安装包含 stream 模块的版本
sudo apt update
sudo apt install nginx-full -y

# 再次验证 stream 模块已加载
nginx -V 2>&1 | grep -o with-stream
```

**预期输出：**
```
with-stream
```

如果仍然没有 stream 模块，可以安装 nginx-extras：

```bash
sudo apt remove nginx nginx-common -y
sudo apt install nginx-extras -y
```

#### 2.10.2 配置 Nginx 流转发

**方法一：使用独立配置文件（推荐）**

创建独立的 stream 配置文件，避免修改主配置：

```bash
# 创建 stream 配置目录
sudo mkdir -p /etc/nginx/streams-enabled

# 创建 xray 转发配置
sudo nano /etc/nginx/streams-enabled/xray.conf
```

在 `xray.conf` 中添加以下内容：

```nginx
upstream xray_backend {
    server 127.0.0.1:8443;
}

server {
    listen 443;
    listen [::]:443;
    proxy_pass xray_backend;
    proxy_protocol off;
}
```

然后在主配置文件 `/etc/nginx/nginx.conf` 末尾添加一行引入（在最后的 `}` 之后）：

```bash
sudo nano /etc/nginx/nginx.conf
```

在文件末尾添加：

```nginx
# 在 http 块之后添加
stream {
    include /etc/nginx/streams-enabled/*.conf;
}
```

**完整的 nginx.conf 结构示例：**

```nginx
user www-data;
worker_processes auto;
pid /run/nginx.pid;

events {
    worker_connections 768;
}

http {
    sendfile on;
    tcp_nopush on;
    types_hash_max_size 2048;
    
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;
    
    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}

# 引入 stream 配置
stream {
    include /etc/nginx/streams-enabled/*.conf;
}
```

**方法二：直接在主配置文件中添加（备选）**

如果不想创建额外目录，也可以直接在 `/etc/nginx/nginx.conf` 末尾添加完整的 stream 块：

```nginx
# 在 http 块之后添加
stream {
    upstream xray_backend {
        server 127.0.0.1:8443;
    }

    server {
        listen 443;
        listen [::]:443;
        proxy_pass xray_backend;
        proxy_protocol off;
    }
}
```

#### 2.10.3 测试和启动 Nginx

```bash
# 测试配置文件语法
sudo nginx -t

# 如果测试通过，重启 Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx

# 检查 Nginx 状态
sudo systemctl status nginx
```

#### 2.10.4 验证端口监听

```bash
# 检查 443 端口（应该是 nginx）
sudo netstat -tlnp | grep 443

# 检查 8443 端口（应该是 xray）
sudo netstat -tlnp | grep 8443
```

**预期输出：**
```
tcp        0      0 0.0.0.0:443             0.0.0.0:*               LISTEN      1234/nginx
tcp        0      0 127.0.0.1:8443          0.0.0.0:*               LISTEN      5678/xray
```

#### 2.10.5 故障排查

**问题 1: Nginx 配置测试失败**
```bash
# 检查配置文件语法
sudo nginx -t

# 查看详细错误日志
sudo tail -f /var/log/nginx/error.log
```

**问题 2: 443 端口被占用**
```bash
# 查看占用 443 端口的进程
sudo lsof -i :443

# 如果是 Apache，停止它
sudo systemctl stop apache2
sudo systemctl disable apache2
```

**问题 3: Nginx stream 模块未加载**
```bash
# 检查 Nginx 是否包含 stream 模块
nginx -V 2>&1 | grep -o with-stream

# 如果没有 stream 模块，需要重新安装包含该模块的 Nginx
sudo apt install nginx-extras -y
```

## 步骤三：Cloudflare 配置

### 3.1 添加 DNS 记录

1. 登录 Cloudflare 控制台
2. 选择您的域名
3. 进入 DNS 设置
4. 添加 A 记录：
   - **类型**: A
   - **名称**: reality（或您喜欢的子域名）
   - **IPv4 地址**: 您的 AWS 弹性 IP
   - **代理状态**: 已代理（橙色云朵）

### 3.2 SSL/TLS 设置

1. 进入 SSL/TLS → 概述
2. 选择加密模式：**完全（严格）**
3. 启用以下选项：
   - 始终使用 HTTPS
   - 自动 HTTPS 重写
   - TLS 1.3

### 3.3 优化性能（可选）

在"速度"设置中启用：
- Auto Minify（自动压缩）
- Brotli 压缩
- HTTP/2 和 HTTP/3

## 步骤四：客户端配置

### 4.1 连接信息

- **地址**: reality.yourdomain.com
- **端口**: 443
- **UUID**: 在步骤 2.7 生成的 UUID
- **流控**: xtls-rprx-vision
- **传输协议**: tcp
- **安全**: reality
- **SNI**: www.microsoft.com
- **PublicKey**: 在步骤 2.6 生成的公钥
- **ShortId**: 0123456789abcdef（或留空）
- **Fingerprint**: chrome

### 4.2 客户端配置示例

```json
{
  "outbounds": [
    {
      "protocol": "vless",
      "settings": {
        "vnext": [
          {
            "address": "reality.yourdomain.com",
            "port": 443,
            "users": [
              {
                "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
                "encryption": "none",
                "flow": "xtls-rprx-vision"
              }
            ]
          }
        ]
      },
      "streamSettings": {
        "network": "tcp",
        "security": "reality",
        "realitySettings": {
          "serverName": "www.microsoft.com",
          "fingerprint": "chrome",
          "publicKey": "xKvN7BqM3pYzWrTgLnFdKs9RmJh6VcXaQwUyE8PbN2o",
          "shortId": "0123456789abcdef"
        }
      }
    }
  ]
}
```

### 4.3 客户端软件

支持 Reality 的客户端：
- **Windows**: v2rayN (v6.0+)
- **macOS**: V2Box, V2RayXS
- **iOS**: Shadowrocket, Stash
- **Android**: v2rayNG (v1.8.0+)
- **Linux**: Xray-core

## 步骤五：测试与验证

### 5.1 检查服务状态

```bash
sudo systemctl status xray
sudo journalctl -u xray -f
```

### 5.2 测试连接

```bash
# 检查端口监听（443 应该是 nginx，8443 应该是 xray）
sudo netstat -tlnp | grep -E "443|8443"

# 测试 TLS 握手（通过 nginx 转发）
openssl s_client -connect your-ec2-ip:443

# 直接测试 xray 端口（本地）
curl -v http://127.0.0.1:8443
```

### 5.3 客户端连接测试

使用客户端软件连接并访问 https://www.google.com 验证。

## 高级配置

### 多用户配置

在 `clients` 数组中添加多个用户：

```json
"clients": [
  {
    "id": "user1-uuid-here",
    "flow": "xtls-rprx-vision"
  },
  {
    "id": "user2-uuid-here",
    "flow": "xtls-rprx-vision"
  }
]
```

### 路由规则配置

添加路由规则实现分流：

```json
"routing": {
  "rules": [
    {
      "type": "field",
      "domain": ["geosite:cn"],
      "outboundTag": "direct"
    },
    {
      "type": "field",
      "ip": ["geoip:cn", "geoip:private"],
      "outboundTag": "direct"
    }
  ]
}
```

## 安全建议

1. **定期更新**: 保持 Xray-core 和系统更新
2. **防火墙**: 使用 AWS 安全组限制访问
3. **密钥管理**: 定期更换 UUID 和密钥
4. **监控**: 设置 CloudWatch 监控流量异常
5. **SSH 安全**: 
   - 禁用密码登录
   - 使用密钥对认证
   - 更改默认 SSH 端口
6. **配置备份**: 定期备份 `config.json` 文件

## 故障排查

### 无法连接

1. 检查 EC2 安全组规则
2. 验证 Cloudflare DNS 解析: `nslookup reality.yourdomain.com`
3. 检查服务状态:
   ```bash
   sudo systemctl status xray
   sudo systemctl status nginx
   ```
4. 验证端口监听:
   ```bash
   # 443 端口应该被 nginx 监听
   # 8443 端口应该被 xray 监听
   sudo netstat -tlnp | grep -E "443|8443"
   ```
5. 查看日志:
   ```bash
   sudo journalctl -u xray -n 50
   sudo tail -f /var/log/nginx/error.log
   ```
6. 验证 UUID 和密钥是否正确匹配

### 连接不稳定

1. 尝试关闭 Cloudflare 代理（灰色云朵）测试
2. 更换 Reality 的 dest 目标网站
3. 检查 AWS 实例性能指标
4. 验证客户端 flow 参数是否正确

### 速度慢

1. 选择距离更近的 AWS 区域
2. 升级 EC2 实例类型
3. 启用 Cloudflare Argo Smart Routing（付费功能）
4. 检查是否有 BBR 拥塞控制算法

### 配置错误

```bash
# 验证 JSON 格式
cat /usr/local/etc/xray/config.json | jq .

# 测试配置文件
/usr/local/bin/xray -test -config /usr/local/etc/xray/config.json
```

### 8443 端口连接超时（Connection timed out）

如果使用 8443 端口直连（不通过 Nginx）时出现连接超时错误：

```
error:8000006E:system library:BIO_connect:Connection timed out
```

**原因 1: Xray 监听地址配置错误**

检查并修改配置文件，确保 `listen` 字段设置为 `0.0.0.0`：

```bash
# 检查当前配置
cat /usr/local/etc/xray/config.json | grep -A 3 inbounds

# 编辑配置文件
sudo nano /usr/local/etc/xray/config.json
```

确保配置中包含：

```json
"inbounds": [
  {
    "listen": "0.0.0.0",  // 监听所有网络接口
    "port": 8443,
    ...
  }
]
```

如果使用 Nginx 转发，应该设置为 `127.0.0.1`：

```json
"inbounds": [
  {
    "listen": "127.0.0.1",  // 仅监听本地
    "port": 8443,
    ...
  }
]
```

修改后重启服务：

```bash
sudo systemctl restart xray
sudo systemctl status xray
```

**原因 2: AWS 安全组未开放 8443 端口**

1. 登录 AWS EC2 控制台
2. 选择您的实例，点击"安全组"
3. 编辑入站规则，确保包含：
   - 类型：自定义 TCP
   - 端口：8443
   - 源：0.0.0.0/0（或您的 IP）

**原因 3: 系统防火墙阻止**

Ubuntu 系统可能启用了 ufw 防火墙：

```bash
# 检查防火墙状态
sudo ufw status

# 如果启用了，添加规则
sudo ufw allow 8443/tcp

# 或者临时禁用（不推荐）
sudo ufw disable
```

对于使用 iptables 的系统：

```bash
# 检查 iptables 规则
sudo iptables -L -n | grep 8443

# 添加允许规则
sudo iptables -A INPUT -p tcp --dport 8443 -j ACCEPT

# 保存规则
sudo netfilter-persistent save
```

**原因 4: Xray 服务未正常运行**

```bash
# 检查服务状态
sudo systemctl status xray

# 查看详细日志
sudo journalctl -u xray -n 100 --no-pager

# 检查端口监听
sudo netstat -tlnp | grep 8443
sudo ss -tlnp | grep 8443
```

**验证修复**

在服务器上本地测试：

```bash
# 本地测试（应该成功）
curl -v http://127.0.0.1:8443

# 测试外部访问（从服务器测试公网 IP）
curl -v http://$(curl -s ifconfig.me):8443
```

从外部测试：

```bash
# 测试 TCP 连接
telnet your-ec2-ip 8443

# 或使用 nc
nc -zv your-ec2-ip 8443

# OpenSSL 测试
openssl s_client -connect your-ec2-ip:8443
```

## 成本估算

- **AWS EC2**: t3.micro $0.0104/小时（约 $7.5/月）
- **弹性 IP**: 实例运行时免费
- **流量**: 前 100GB 免费，之后 $0.09/GB
- **Cloudflare**: 免费计划足够使用

## 参考资源

- [Xray 官方文档](https://xtls.github.io/)
- [Reality 协议说明](https://github.com/XTLS/REALITY)
- [VLESS 协议规范](https://xtls.github.io/config/inbounds/vless.html)
- [Cloudflare 文档](https://developers.cloudflare.com/)
- [AWS EC2 文档](https://docs.aws.amazon.com/ec2/)

## 常见问题 (FAQ)

**Q: Reality 和 TLS 有什么区别？**  
A: Reality 是新一代协议，通过真实 TLS 指纹伪装，比传统 TLS 更难被检测。

**Q: 为什么要使用 Cloudflare？**  
A: Cloudflare 提供 CDN 加速、隐藏真实 IP、DDoS 防护等功能。

**Q: 可以不使用 Cloudflare 吗？**  
A: 可以，直接使用 AWS 弹性 IP 连接，但会暴露服务器真实 IP。

**Q: shortId 必须填写吗？**  
A: 不是必须的，数组中包含空字符串 `""` 表示允许客户端不使用 shortId。

**Q: 如何更换 dest 目标网站？**  
A: 选择支持 TLS 1.3 的知名网站，同时更新 `dest` 和 `serverNames` 字段。

## 更新日志

- 2026-01-26: 添加 config.json 字段详解、高级配置和常见问题
- 2026-01-26: 初始版本

---

**免责声明**: 请确保遵守当地法律法规使用此技术。本文档仅供学习和研究目的。