# Vercel Deployment Checklist

在部署到 Vercel 之前，请确认以下所有项目：

## 前置准备

- [ ] PostgreSQL 数据库已设置（推荐：Vercel Postgres, Supabase, 或 Neon）
- [ ] AWS S3 bucket 已创建并配置 CORS
- [ ] 已生成安全的 `UPLOAD_AUTH_KEY`（可使用 `openssl rand -base64 32`）

## 环境变量配置

在 Vercel 项目设置中添加以下环境变量：

- [ ] `AWS_REGION` - AWS 区域（例如：us-east-2）
- [ ] `AWS_ACCESS_KEY_ID` - AWS 访问密钥 ID
- [ ] `AWS_SECRET_ACCESS_KEY` - AWS 密钥
- [ ] `S3_BUCKET_NAME` - S3 存储桶名称
- [ ] `UPLOAD_AUTH_KEY` - 上传认证密钥
- [ ] `podcast_DATABASE_URL` - PostgreSQL 连接字符串

## 部署步骤

### 1. 连接 Git 仓库
- [ ] 在 Vercel 中导入 GitHub/GitLab/Bitbucket 仓库
- [ ] 选择正确的分支（通常是 `main` 或 `master`）

### 2. 配置构建设置
Vercel 应该自动检测 Next.js 项目，但请确认：
- [ ] Framework Preset: **Next.js**
- [ ] Build Command: `pnpm build`
- [ ] Output Directory: `.next`
- [ ] Install Command: `pnpm install`

### 3. 添加环境变量
- [ ] 在 Settings → Environment Variables 中添加所有必需的环境变量
- [ ] 确保所有变量都设置为所有环境（Production, Preview, Development）

### 4. 首次部署
- [ ] 点击 "Deploy" 开始首次部署
- [ ] 等待构建完成（包含 `prisma generate`）

### 5. 运行数据库迁移

首次部署后，运行数据库迁移：

```bash
# 安装 Vercel CLI
pnpm install -g vercel

# 登录
vercel login

# 链接项目
vercel link

# 拉取环境变量
vercel env pull .env.local

# 运行迁移
npx prisma migrate deploy
```

或者手动在数据库中执行 SQL：
```bash
cat prisma/migrations/manual_add_tobacco_record/migration.sql
```

## 验证部署

部署后，测试以下功能：

### 基础功能
- [ ] 首页加载正常
- [ ] 博客文章显示正确
- [ ] RSS 订阅可访问

### Podcast 功能
- [ ] `/podcast` - 列表页面加载
- [ ] `/podcast/upload` - 上传页面可访问
- [ ] 使用 `UPLOAD_AUTH_KEY` 可以认证
- [ ] 可以上传音频文件到 S3
- [ ] 新播客记录保存到数据库

### Tobacco Record 功能
- [ ] `/record` - 页面加载正常
- [ ] 可以添加新的试验记录
- [ ] 可以编辑现有记录
- [ ] 数据持久化到数据库

### API 端点
- [ ] `GET /api/podcasts` - 返回播客列表
- [ ] `GET /api/record` - 返回试验记录
- [ ] 其他 API 端点响应正常

## 常见问题排查

### Prisma 错误
如果遇到 Prisma 相关错误：
1. 确认 `podcast_DATABASE_URL` 在 Vercel 环境变量中正确设置
2. 检查 `package.json` 中的 `postinstall` 脚本包含 `prisma generate`
3. 确认 `prisma/schema.prisma` 中的 binaryTargets 包含 `rhel-openssl-3.0.x`

### 数据库连接失败
1. 验证数据库连接字符串格式正确
2. 确保数据库允许来自 Vercel 的连接
3. 检查防火墙和 SSL 设置

### 构建失败
1. 检查 Vercel 构建日志中的详细错误信息
2. 确认本地 `pnpm build` 可以成功运行
3. 验证所有依赖都在 `package.json` 中正确声明

### 环境变量问题
1. 确认所有必需的环境变量都已设置
2. 检查变量名称拼写是否正确
3. 重新部署以应用新的环境变量更改

## 后续维护

- [ ] 设置自定义域名（可选）
- [ ] 配置 Vercel Analytics（已包含在项目中）
- [ ] 定期备份数据库
- [ ] 监控 S3 存储使用情况
- [ ] 更新依赖包以获取安全补丁

## 有用的命令

```bash
# 本地开发
pnpm dev

# 本地构建测试
pnpm build

# 生成 Prisma Client
npx prisma generate

# 查看数据库状态
npx prisma migrate status

# 打开 Prisma Studio（数据库 GUI）
npx prisma studio

# 部署到 Vercel（使用 CLI）
vercel --prod
```

## 相关文档

- [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) - 详细部署配置
- [PRISMA_SETUP.md](./PRISMA_SETUP.md) - Prisma 数据库设置
- [.env.example](./.env.example) - 环境变量示例
