# Deploy NestJS Backend using Mau (AWS)

Mau is the official NestJS deployment platform — runs on AWS without manually managing infrastructure (EC2, scaling, CI/CD, networking).

---

## Pricing

- **AWS Free Tier** — 750 hrs/month for `t2.micro` (valid 12 months for new accounts)
- **After free tier** — cost depends on server, database, storage, and bandwidth usage
- Set a billing alert: **AWS Console → Billing → Budgets**

> **MAU (Monthly Active Users)** is an AWS Cognito billing metric for auth — not related to backend hosting costs.

---

## Prerequisites

- AWS account with billing enabled
- Node.js + Git installed
- NestJS app ready

---

## Deploy Steps

**1. Install Mau CLI**
```bash
npm install -g @nestjs/mau
mau --version
```

**2. Configure AWS**
```bash
aws configure
# Access Key, Secret Key, Region: ap-south-1, Output: json

aws sts get-caller-identity  # verify
```

**3. Build & Deploy**
```bash
npm install && npm run build
mau deploy
```

Mau provisions infrastructure, deploys the app, configures networking, and sets up a deployment pipeline automatically.

---

## Run Manually (if needed)

```bash
NODE_ENV=production node dist/main.js
```

---

## Docker (Optional)

```dockerfile
FROM node:20
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/main"]
```

```bash
docker build -t my-nestjs-app .
docker run -p 3000:3000 my-nestjs-app
```

---

## Recommended Stack

```
Frontend   → Vercel
Backend    → Mau (AWS)
Database   → PostgreSQL / MongoDB
Storage    → AWS S3
Caching    → Redis
Monitoring → CloudWatch
```
