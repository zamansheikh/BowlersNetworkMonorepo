#!/bin/bash
# ============================================================================
# BowlersNetwork VPS Setup (Ubuntu 24) — Run ONCE on a fresh VPS
# Usage: ssh root@31.97.135.175 'bash -s' < deploy/setup-vps.sh
# ============================================================================

set -e

echo "=== 1. System updates ==="
apt update && apt upgrade -y

echo "=== 2. Install Node.js 22 LTS ==="
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs

echo "=== 3. Install pnpm ==="
npm install -g pnpm@latest

echo "=== 4. Install PM2 ==="
npm install -g pm2

echo "=== 5. Install Nginx ==="
apt install -y nginx

echo "=== 6. Install Certbot (Let's Encrypt) ==="
apt install -y certbot python3-certbot-nginx

echo "=== 7. Clone the repo ==="
mkdir -p /var/www
cd /var/www
if [ ! -d "BowlersNetworkMonorepo" ]; then
  git clone https://github.com/zamansheikh/BowlersNetworkMonorepo.git
fi
cd BowlersNetworkMonorepo

echo "=== 8. Install dependencies ==="
pnpm install --frozen-lockfile

echo "=== 9. Build amateur-player ==="
pnpm --filter @bowlersnetwork/amateur-player build

echo "=== 10. Setup Nginx config ==="
cp deploy/nginx/amateur-player.conf /etc/nginx/sites-available/amateur-player.conf
ln -sf /etc/nginx/sites-available/amateur-player.conf /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

echo "=== 11. Get SSL certificate ==="
certbot --nginx -d base.bowlersnetwork.com --non-interactive --agree-tos --email admin@bowlersnetwork.com

echo "=== 12. Start app with PM2 ==="
cd /var/www/BowlersNetworkMonorepo
pm2 start ecosystem.config.cjs --only amateur-player
pm2 save
pm2 startup systemd -u root --hp /root

echo ""
echo "========================================"
echo "  DONE! amateur-player is live at:"
echo "  https://base.bowlersnetwork.com"
echo "========================================"
