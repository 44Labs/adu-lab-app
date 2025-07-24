#!/bin/bash

# ADU Lab Quick Setup Script
# Run this to set up your Firebase project

echo "🚀 ADU Lab Setup Script"
echo "======================"
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "📦 Installing Firebase CLI..."
    npm install -g firebase-tools
fi

# Login to Firebase
echo "🔐 Logging into Firebase..."
firebase login

# Create or select project
echo ""
echo "📱 Firebase Project Setup"
echo "1) Create new project"
echo "2) Use existing project"
read -p "Choose option (1 or 2): " choice

if [ "$choice" = "1" ]; then
    read -p "Enter project ID (e.g., adu-lab-prod): " project_id
    firebase projects:create $project_id
    firebase use $project_id
else
    firebase use --add
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install
cd functions && npm install && cd ..

# Get API keys
echo ""
echo "🔑 API Configuration"
echo "==================="
echo ""
echo "Please have these ready:"
echo "- Stripe Secret Key (sk_live_...)"
echo "- Stripe Webhook Secret (whsec_...)"
echo "- SendGrid API Key"
echo "- HubSpot API Key"
echo ""
read -p "Press Enter when ready..."

# Configure Stripe
echo ""
read -p "Enter Stripe Secret Key: " stripe_secret
read -p "Enter Stripe Webhook Secret: " stripe_webhook
firebase functions:config:set stripe.secret_key="$stripe_secret" stripe.webhook_secret="$stripe_webhook"

# Configure SendGrid
echo ""
read -p "Enter SendGrid API Key: " sendgrid_key
firebase functions:config:set sendgrid.api_key="$sendgrid_key"

# Configure HubSpot
echo ""
read -p "Enter HubSpot API Key: " hubspot_key
firebase functions:config:set hubspot.api_key="$hubspot_key"

# Deploy
echo ""
echo "🚀 Deploying to Firebase..."
firebase deploy

echo ""
echo "✅ Setup Complete!"
echo ""
echo "Your app is deployed to:"
firebase hosting:sites:list

echo ""
echo "Next steps:"
echo "1. Update /public/assets/js/firebase-config.js with your Firebase config"
echo "2. Set up Stripe products in your Stripe dashboard"
echo "3. Configure custom domain in Firebase Console (optional)"
echo ""
echo "For help, check DEPLOYMENT.md"