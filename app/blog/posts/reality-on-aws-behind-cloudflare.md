---
title: Running Reality on AWS with Cloudflare in front
date: 2024-01-15 10:00:00
categories: 技术
tags:
  - AWS
  - Cloudflare
  - VPN
keywords: 'reality protocol,xray reality,vless reality,cloudflare forwarding,self-hosted node,AWS proxy,reality aws'
lang: en
translationKey: Reality 在 AWS 上搭建并使用 Cloudflare 进行转发
---

# Running Reality on AWS with Cloudflare in front

## Overview

This document explains how to set up a Reality protocol service on AWS and forward traffic through Cloudflare for better privacy protection and network performance.

## Architecture

```
Client → Cloudflare CDN → AWS EC2 (Reality Server)
```

## Prerequisites

- An AWS account
- A Cloudflare account
- A registered domain (hosted on Cloudflare)
- Basic Linux command-line knowledge

## Step 1: Configure an AWS EC2 instance

### 1.1 Create an EC2 instance

1. Sign in to the AWS console
2. Select the EC2 service
3. Click "Launch instance"
4. Recommended configuration:
   - **AMI**: Ubuntu 22.04 LTS
   - **Instance type**: t3.micro or larger (depending on traffic needs)
   - **Region**: choose a region with lower latency

### 1.2 Configure the security group

Add the following inbound rules to the EC2 security group:

| Type | Protocol | Port range | Source |
|------|------|----------|-----|
| SSH | TCP | 22 | Your IP |
| HTTPS | TCP | 443 | 0.0.0.0/0 |
| Custom TCP | TCP | 8443 | 0.0.0.0/0 |

### 1.3 Allocate an Elastic IP

1. In the EC2 console, select "Elastic IPs"
2. Allocate a new address and associate it with your instance

## Step 2: Install the Reality service

### 2.1 Connect to the EC2 instance

```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### 2.2 Update the system

```bash
sudo apt update && sudo apt upgrade -y
```

### 2.3 Install Xray-core (with Reality support)

```bash
# Download the install script
bash -c "$(curl -L https://github.com/XTLS/Xray-install/raw/main/install-release.sh)" @ install

# Or use the one-click install script
wget -N --no-check-certificate https://raw.githubusercontent.com/teddysun/across/master/xray.sh
chmod +x xray.sh
sudo ./xray.sh
```

### 2.4 Configure Reality

Create the configuration file `/usr/local/etc/xray/config.json`:

**Important note**: If you are not forwarding through Nginx, Xray needs to listen on `0.0.0.0` to accept external connections. If you are forwarding through Nginx, it can listen on `127.0.0.1`.

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

### 2.5 Field-by-field explanation of the configuration file

#### 2.5.1 Top-level configuration

| Field | Description |
|------|------|
| `log` | Logging configuration object |
| `inbounds` | Array of inbound connection configurations, defining how the server accepts client connections |
| `outbounds` | Array of outbound connection configurations, defining how the server forwards traffic |

#### 2.5.2 Logging configuration (log)

```json
"log": {
  "loglevel": "warning"
}
```

| Field | Possible values | Description |
|------|--------|------|
| `loglevel` | `debug`, `info`, `warning`, `error`, `none` | Log level. `warning` logs only warnings and errors |

#### 2.5.3 Inbound configuration (inbounds)

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

| Field | Type | Description |
|------|------|------|
| `listen` | String | Listening address. `0.0.0.0` means all network interfaces (direct connection), `127.0.0.1` means local only (Nginx forwarding) |
| `port` | Number | Listening port. Uses 8443 (an unprivileged port), forwarded to 443 via Nginx |
| `protocol` | String | Protocol type; Reality uses `vless` |
| `settings` | Object | Protocol-specific settings |
| `streamSettings` | Object | Transport-layer configuration |

#### 2.5.4 VLESS settings (settings)

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

| Field | Description |
|------|------|
| `clients` | List of clients; multiple clients can be configured |
| `clients[].id` | Client UUID, used for authentication. Generate it with `cat /proc/sys/kernel/random/uuid` |
| `clients[].flow` | Flow control mode. `xtls-rprx-vision` is the flow control mode recommended for Reality |
| `decryption` | Decryption method. Reality uses `none` (encryption is handled by the TLS layer) |

#### 2.5.5 Transport configuration (streamSettings)

```json
"streamSettings": {
  "network": "tcp",
  "security": "reality",
  "realitySettings": { ... }
}
```

| Field | Possible values | Description |
|------|--------|------|
| `network` | `tcp`, `kcp`, `ws`, `http`, `grpc` | Transport protocol. Reality usually uses `tcp` |
| `security` | `none`, `tls`, `reality` | Security layer type. Use `reality` |
| `realitySettings` | Object | Reality protocol-specific configuration |

#### 2.5.6 Reality settings (realitySettings)

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

| Field | Type | Description |
|------|------|------|
| `show` | Boolean | Whether to show debug information in the logs. `false` is recommended in production |
| `dest` | String | Fallback destination address. When the handshake fails, the server disguises itself as a visit to this website. Format: `domain:port` |
| `xver` | Number | PROXY protocol version. `0` means unused |
| `serverNames` | Array | SNI list; clients must use a domain from this list. Usually kept consistent with `dest` |
| `privateKey` | String | Server private key, generated with `/usr/local/bin/xray x25519`. **Must be kept secret** |
| `shortIds` | Array | List of short IDs, used to distinguish between different client configurations. Can contain an empty string and 16 hexadecimal characters |

**Advice for choosing the dest field:**
- Choose a well-known and stable HTTPS website
- Recommended: `www.microsoft.com:443`, `www.apple.com:443`, `www.cloudflare.com:443`
- Must support TLS 1.3
- Prefer a website geographically close to the server

**About the shortIds field:**
- The empty string `""` means clients are allowed to use no shortId
- A hexadecimal string can be 2-16 characters long (1-8 bytes)
- Examples: `""`, `"0123456789abcdef"`, `"a1b2c3"`

#### 2.5.7 Outbound configuration (outbounds)

```json
"outbounds": [
  {
    "protocol": "freedom",
    "tag": "direct"
  }
]
```

| Field | Possible values | Description |
|------|--------|------|
| `protocol` | `freedom`, `blackhole`, `vmess`, `vless`, etc. | Outbound protocol. `freedom` means a direct connection |
| `tag` | String | Identifier for the outbound connection, used by routing rules |

**Commonly used outbound protocols:**
- `freedom`: connect directly to the destination address (most common)
- `blackhole`: block the connection (used for ad filtering)
- `vmess`/`vless`: chained proxying

### 2.6 Generate a key pair

```bash
/usr/local/bin/xray x25519
```

**Example output:**
```
Private key: SChPg2LBZzQnvGr8aZpYmD3sLmK9qNpTrXwUyVbE1Hk
Public key: xKvN7BqM3pYzWrTgLnFdKs9RmJh6VcXaQwUyE8PbN2o
```

- **Private key**: put it in the `privateKey` field of the server's `config.json`
- **Public key**: put it in the client configuration

### 2.7 Generate a UUID

```bash
cat /proc/sys/kernel/random/uuid
```

**Example output:**
```
a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

Put this UUID into the `clients[].id` field of `config.json`.

### 2.8 Complete configuration example

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

### 2.9 Start the service

```bash
sudo systemctl start xray
sudo systemctl enable xray
sudo systemctl status xray
```

### 2.10 Configure Nginx forwarding (443 → 8443)

Since Xray uses the unprivileged port 8443, we need Nginx to forward traffic from port 443 to 8443.

#### 2.10.1 Install Nginx (including the stream module)

The standard `nginx` package may not include the `stream` module; you need to install `nginx-full`, or check whether the module is present:

```bash
# First check whether Nginx is installed and which version
nginx -V 2>&1 | grep -o with-stream

# If there is no output, or Nginx is not installed, install the version that includes the stream module
sudo apt update
sudo apt install nginx-full -y

# Verify again that the stream module is loaded
nginx -V 2>&1 | grep -o with-stream
```

**Expected output:**
```
with-stream
```

If the stream module is still missing, you can install nginx-extras:

```bash
sudo apt remove nginx nginx-common -y
sudo apt install nginx-extras -y
```

#### 2.10.2 Configure Nginx stream forwarding

**Option one: use a separate configuration file (recommended)**

Create a separate stream configuration file to avoid modifying the main configuration:

```bash
# Create the stream configuration directory
sudo mkdir -p /etc/nginx/streams-enabled

# Create the xray forwarding configuration
sudo nano /etc/nginx/streams-enabled/xray.conf
```

Add the following content to `xray.conf`:

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

Then add an include line at the end of the main configuration file `/etc/nginx/nginx.conf` (after the final `}`):

```bash
sudo nano /etc/nginx/nginx.conf
```

Add the following at the end of the file:

```nginx
# Add after the http block
stream {
    include /etc/nginx/streams-enabled/*.conf;
}
```

**Complete nginx.conf structure example:**

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

# Include the stream configuration
stream {
    include /etc/nginx/streams-enabled/*.conf;
}
```

**Option two: add it directly to the main configuration file (alternative)**

If you would rather not create an extra directory, you can add the full stream block directly at the end of `/etc/nginx/nginx.conf`:

```nginx
# Add after the http block
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

#### 2.10.3 Test and start Nginx

```bash
# Test the configuration file syntax
sudo nginx -t

# If the test passes, restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx

# Check Nginx status
sudo systemctl status nginx
```

#### 2.10.4 Verify port listening

```bash
# Check port 443 (should be nginx)
sudo netstat -tlnp | grep 443

# Check port 8443 (should be xray)
sudo netstat -tlnp | grep 8443
```

**Expected output:**
```
tcp        0      0 0.0.0.0:443             0.0.0.0:*               LISTEN      1234/nginx
tcp        0      0 127.0.0.1:8443          0.0.0.0:*               LISTEN      5678/xray
```

#### 2.10.5 Troubleshooting

**Problem 1: The Nginx configuration test fails**
```bash
# Check the configuration file syntax
sudo nginx -t

# Look at the detailed error log
sudo tail -f /var/log/nginx/error.log
```

**Problem 2: Port 443 is already in use**
```bash
# Show the process occupying port 443
sudo lsof -i :443

# If it is Apache, stop it
sudo systemctl stop apache2
sudo systemctl disable apache2
```

**Problem 3: The Nginx stream module is not loaded**
```bash
# Check whether Nginx includes the stream module
nginx -V 2>&1 | grep -o with-stream

# If the stream module is missing, reinstall an Nginx build that includes it
sudo apt install nginx-extras -y
```

## Step 3: Cloudflare configuration

### 3.1 Add a DNS record

1. Sign in to the Cloudflare dashboard
2. Select your domain
3. Go to the DNS settings
4. Add an A record:
   - **Type**: A
   - **Name**: reality (or any subdomain you like)
   - **IPv4 address**: your AWS Elastic IP
   - **Proxy status**: Proxied (orange cloud)

### 3.2 SSL/TLS settings

1. Go to SSL/TLS → Overview
2. Choose the encryption mode: **Full (strict)**
3. Enable the following options:
   - Always Use HTTPS
   - Automatic HTTPS Rewrites
   - TLS 1.3

### 3.3 Optimize performance (optional)

In the "Speed" settings, enable:
- Auto Minify
- Brotli compression
- HTTP/2 and HTTP/3

## Step 4: Client configuration

### 4.1 Connection information

- **Address**: reality.yourdomain.com
- **Port**: 443
- **UUID**: the UUID generated in step 2.7
- **Flow**: xtls-rprx-vision
- **Transport protocol**: tcp
- **Security**: reality
- **SNI**: www.microsoft.com
- **PublicKey**: the public key generated in step 2.6
- **ShortId**: 0123456789abcdef (or leave it empty)
- **Fingerprint**: chrome

### 4.2 Client configuration example

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

### 4.3 Client software

Clients that support Reality:
- **Windows**: v2rayN (v6.0+)
- **macOS**: V2Box, V2RayXS
- **iOS**: Shadowrocket, Stash
- **Android**: v2rayNG (v1.8.0+)
- **Linux**: Xray-core

## Step 5: Testing and verification

### 5.1 Check the service status

```bash
sudo systemctl status xray
sudo journalctl -u xray -f
```

### 5.2 Test connectivity

```bash
# Check port listening (443 should be nginx, 8443 should be xray)
sudo netstat -tlnp | grep -E "443|8443"

# Test the TLS handshake (through the nginx forward)
openssl s_client -connect your-ec2-ip:443

# Test the xray port directly (locally)
curl -v http://127.0.0.1:8443
```

### 5.3 Client connection test

Connect with a client application and verify by visiting https://www.google.com.

## Advanced configuration

### Multi-user configuration

Add multiple users to the `clients` array:

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

### Routing rule configuration

Add routing rules to split traffic:

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

## Security recommendations

1. **Regular updates**: keep Xray-core and the system up to date
2. **Firewall**: use AWS security groups to restrict access
3. **Key management**: rotate UUIDs and keys periodically
4. **Monitoring**: set up CloudWatch monitoring for traffic anomalies
5. **SSH security**:
   - Disable password login
   - Use key-pair authentication
   - Change the default SSH port
6. **Configuration backups**: back up the `config.json` file regularly

## Troubleshooting

### Cannot connect

1. Check the EC2 security group rules
2. Verify Cloudflare DNS resolution: `nslookup reality.yourdomain.com`
3. Check the service status:
   ```bash
   sudo systemctl status xray
   sudo systemctl status nginx
   ```
4. Verify port listening:
   ```bash
   # Port 443 should be listened on by nginx
   # Port 8443 should be listened on by xray
   sudo netstat -tlnp | grep -E "443|8443"
   ```
5. Check the logs:
   ```bash
   sudo journalctl -u xray -n 50
   sudo tail -f /var/log/nginx/error.log
   ```
6. Verify that the UUID and keys match correctly

### Unstable connection

1. Try turning off the Cloudflare proxy (grey cloud) to test
2. Change the Reality dest target website
3. Check the AWS instance performance metrics
4. Verify that the client flow parameter is correct

### Slow speed

1. Choose an AWS region that is closer
2. Upgrade the EC2 instance type
3. Enable Cloudflare Argo Smart Routing (a paid feature)
4. Check whether the BBR congestion control algorithm is available

### Configuration errors

```bash
# Validate the JSON format
cat /usr/local/etc/xray/config.json | jq .

# Test the configuration file
/usr/local/bin/xray -test -config /usr/local/etc/xray/config.json
```

### Port 8443 connection timeout (Connection timed out)

If you get a connection timeout error when connecting directly on port 8443 (without going through Nginx):

```
error:8000006E:system library:BIO_connect:Connection timed out
```

**Cause 1: Xray listening address is misconfigured**

Check and modify the configuration file, making sure the `listen` field is set to `0.0.0.0`:

```bash
# Check the current configuration
cat /usr/local/etc/xray/config.json | grep -A 3 inbounds

# Edit the configuration file
sudo nano /usr/local/etc/xray/config.json
```

Make sure the configuration contains:

```json
"inbounds": [
  {
    "listen": "0.0.0.0",  // listen on all network interfaces
    "port": 8443,
    ...
  }
]
```

If you use Nginx forwarding, it should be set to `127.0.0.1`:

```json
"inbounds": [
  {
    "listen": "127.0.0.1",  // listen locally only
    "port": 8443,
    ...
  }
]
```

Restart the service after modifying:

```bash
sudo systemctl restart xray
sudo systemctl status xray
```

**Cause 2: Port 8443 is not open in the AWS security group**

1. Sign in to the AWS EC2 console
2. Select your instance and click "Security groups"
3. Edit the inbound rules and make sure they include:
   - Type: Custom TCP
   - Port: 8443
   - Source: 0.0.0.0/0 (or your IP)

**Cause 3: Blocked by the system firewall**

The Ubuntu system may have the ufw firewall enabled:

```bash
# Check the firewall status
sudo ufw status

# If it is enabled, add a rule
sudo ufw allow 8443/tcp

# Or temporarily disable it (not recommended)
sudo ufw disable
```

For systems using iptables:

```bash
# Check the iptables rules
sudo iptables -L -n | grep 8443

# Add an allow rule
sudo iptables -A INPUT -p tcp --dport 8443 -j ACCEPT

# Save the rules
sudo netfilter-persistent save
```

**Cause 4: The Xray service is not running properly**

```bash
# Check the service status
sudo systemctl status xray

# View detailed logs
sudo journalctl -u xray -n 100 --no-pager

# Check port listening
sudo netstat -tlnp | grep 8443
sudo ss -tlnp | grep 8443
```

**Verify the fix**

Test locally on the server:

```bash
# Local test (should succeed)
curl -v http://127.0.0.1:8443

# Test external access (from the server, against the public IP)
curl -v http://$(curl -s ifconfig.me):8443
```

Test from outside:

```bash
# Test the TCP connection
telnet your-ec2-ip 8443

# Or use nc
nc -zv your-ec2-ip 8443

# OpenSSL test
openssl s_client -connect your-ec2-ip:8443
```

## Cost estimate

- **AWS EC2**: t3.micro at $0.0104/hour (about $7.5/month)
- **Elastic IP**: free while the instance is running
- **Traffic**: the first 100GB is free, then $0.09/GB
- **Cloudflare**: the free plan is sufficient

## References

- [Xray official documentation](https://xtls.github.io/)
- [Reality protocol description](https://github.com/XTLS/REALITY)
- [VLESS protocol specification](https://xtls.github.io/config/inbounds/vless.html)
- [Cloudflare documentation](https://developers.cloudflare.com/)
- [AWS EC2 documentation](https://docs.aws.amazon.com/ec2/)

## FAQ

**Q: What is the difference between Reality and TLS?**  
A: Reality is a new-generation protocol that disguises itself with a real TLS fingerprint, making it harder to detect than traditional TLS.

**Q: Why use Cloudflare?**  
A: Cloudflare provides CDN acceleration, hides your real IP, and offers DDoS protection, among other features.

**Q: Can I skip Cloudflare?**  
A: Yes, you can connect directly using the AWS Elastic IP, but that exposes the server's real IP.

**Q: Is shortId required?**  
A: No. Including the empty string `""` in the array allows clients to use no shortId.

**Q: How do I change the dest target website?**  
A: Pick a well-known website that supports TLS 1.3, and update both the `dest` and `serverNames` fields.

## Changelog

- 2026-01-26: Added the field-by-field explanation of config.json, advanced configuration, and FAQ
- 2026-01-26: Initial version

---

**Disclaimer**: Please make sure you comply with local laws and regulations when using this technology. This document is for learning and research purposes only.
