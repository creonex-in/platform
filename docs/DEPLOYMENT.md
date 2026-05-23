# Deploy NestJS on AWS EC2

## Pricing

|          Plan         |           Cost           |
|-----------------------|--------------------------|
| Free Tier (12 months) | t2.micro — 750 hrs/month |
|    After Free Tier    |     ~$8–10/month         |
|     Domain            |       ~$10/year          |

> **MAU (Monthly Active Users)** is a billing metric for AWS Cognito (auth), not EC2. EC2 charges by uptime, not user count.

Set a billing alert: **AWS Console → Billing → Budgets**

---

## Deploy Steps

**1. Configure AWS CLI**
```bash
aws configure
# Access Key, Secret Key, Region: ap-south-1, Output: json
```

**2. Create Key Pair & Security Group**
```bash
aws ec2 create-key-pair --key-name nestjs-key --query 'KeyMaterial' --output text > nestjs-key.pem
chmod 400 nestjs-key.pem

aws ec2 create-security-group --group-name nestjs-sg --description "NestJS SG"
aws ec2 authorize-security-group-ingress --group-name nestjs-sg --protocol tcp --port 22 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-name nestjs-sg --protocol tcp --port 80 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-name nestjs-sg --protocol tcp --port 443 --cidr 0.0.0.0/0
```

**3. Launch EC2 & SSH In**
```bash
aws ec2 run-instances --image-id ami-0c7217cdde317cfec --instance-type t2.micro --key-name nestjs-key --security-groups nestjs-sg

# Get IP
aws ec2 describe-instances --query 'Reservations[*].Instances[*].PublicIpAddress' --output text

ssh -i nestjs-key.pem ubuntu@YOUR_PUBLIC_IP
```

**4. Deploy App**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git

git clone https://github.com/your-username/your-repo.git
cd your-repo
npm install && npm run build
nano .env
npm run start:prod
```

**5. PM2 (keep app alive)**
```bash
sudo npm install -g pm2
pm2 start dist/main.js --name nestjs-app
pm2 save && pm2 startup
```

**6. Nginx + HTTPS**
```bash
sudo apt install -y nginx
sudo nano /etc/nginx/sites-available/nestjs
```
```nginx
server {
    listen 80;
    server_name your-domain.com;
    location / { proxy_pass http://localhost:3000; }
}
```
```bash
sudo ln -s /etc/nginx/sites-available/nestjs /etc/nginx/sites-enabled/
sudo systemctl restart nginx

sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```
