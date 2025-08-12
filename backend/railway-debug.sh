#!/bin/bash

echo "=== Railway Deployment Troubleshooting Script ==="
echo "Date: $(date)"
echo ""

echo "1. Checking Railway CLI status..."
railway whoami
echo ""

echo "2. Checking project link..."
railway status
echo ""

echo "3. Checking environment variables..."
railway variables --json | jq '.' 2>/dev/null || railway variables
echo ""

echo "4. Testing application build..."
if mvn clean package -DskipTests -q; then
    echo "✅ Local build: SUCCESS"
    if [ -f "target/artwork-ecommerce-1.0.0.jar" ]; then
        echo "✅ JAR file created: $(ls -lh target/artwork-ecommerce-1.0.0.jar | awk '{print $5}')"
    fi
else
    echo "❌ Local build: FAILED"
fi
echo ""

echo "5. Testing health endpoint..."
if curl -f -s https://backend-dev-ce5d.up.railway.app/api/health > /dev/null; then
    echo "✅ Health endpoint: ACCESSIBLE"
    curl -s https://backend-dev-ce5d.up.railway.app/api/health | jq '.' 2>/dev/null || curl -s https://backend-dev-ce5d.up.railway.app/api/health
else
    echo "❌ Health endpoint: NOT ACCESSIBLE"
    echo "Response:"
    curl -I https://backend-dev-ce5d.up.railway.app/api/health 2>/dev/null || echo "No response"
fi
echo ""

echo "6. Checking Railway logs..."
if railway logs 2>/dev/null; then
    echo "✅ Logs retrieved"
else
    echo "❌ No deployment logs found"
fi
echo ""

echo "=== Troubleshooting Complete ==="
echo ""
echo "Manual steps required:"
echo "1. Visit Railway dashboard: https://railway.app"
echo "2. Navigate to project: loving-illumination"
echo "3. Select service: backend"
echo "4. Check Settings > Source and ensure GitHub repository is connected"
echo "5. Enable Auto Deploy if not already enabled"
echo "6. Manually trigger deployment from dashboard if needed"
