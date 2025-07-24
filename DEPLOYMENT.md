# ADU Lab Deployment Guide

## 🚀 Quick Deploy Instructions for Derek

### Step 1: Firebase Setup

1. **Create Firebase Project**:
   ```bash
   # Install Firebase CLI if you haven't
   npm install -g firebase-tools
   
   # Login to Firebase
   firebase login
   
   # Create new project
   firebase projects:create adu-lab-app-prod
   ```

2. **Enable Firebase Services**:
   - Go to https://console.firebase.google.com
   - Select your project
   - Enable:
     - Authentication (Email/Password + Google)
     - Firestore Database
     - Hosting
     - Functions (requires Blaze plan)

3. **Initialize Firebase**:
   ```bash
   cd ~/adu-lab-app
   firebase use adu-lab-app-prod
   ```

### Step 2: Set Up API Keys

1. **Stripe Setup**:
   - Go to https://dashboard.stripe.com
   - Get your API keys
   - Create products:
     - Tier 2 One-time: $29
     - Tier 2 Monthly: $29/mo
     - Tier 3 One-time: $44
     - Tier 3 Monthly: $44/mo
     - Pro+ Addon: $15/mo

2. **Configure Firebase Functions**:
   ```bash
   firebase functions:config:set \
     stripe.secret_key="sk_live_..." \
     stripe.webhook_secret="whsec_..." \
     sendgrid.api_key="SG...." \
     hubspot.api_key="..." \
     gemini.api_key="..."
   ```

3. **Update Firebase Config**:
   - Get config from Firebase Console > Project Settings
   - Update `/public/assets/js/firebase-config.js`

### Step 3: Deploy

```bash
# Install dependencies
npm install
cd functions && npm install && cd ..

# Deploy everything
firebase deploy
```

Your app will be live at: `https://adu-lab-app-prod.web.app`

### Step 4: Set Up Custom Domain (Optional)

1. In Firebase Console > Hosting
2. Click "Add custom domain"
3. Follow instructions to verify domain
4. Update DNS records

## 🔧 What You Need From Derek

### Required API Credentials:

1. **Google Cloud / Gemini**:
   - Enable Vertex AI API in Google Cloud Console
   - Create API key for Gemini
   - Enable billing

2. **Stripe**:
   - Live publishable key: `pk_live_...`
   - Live secret key: `sk_live_...`
   - Webhook endpoint secret
   - Product/Price IDs

3. **HubSpot**:
   - Private app access token
   - Or API key (deprecated but still works)

4. **SendGrid**:
   - API key
   - Verified sender email (e.g., noreply@adulab.ai)
   - Email templates (optional)

## 📱 Testing

1. **Local Testing**:
   ```bash
   firebase emulators:start
   ```
   Access at http://localhost:5000

2. **Test Payment Flow**:
   - Use Stripe test cards
   - 4242 4242 4242 4242 (success)
   - 4000 0000 0000 0002 (decline)

3. **Test AI Integration**:
   - Gemini API will process assessments
   - Check Cloud Functions logs

## 🚨 Production Checklist

- [ ] Replace all test API keys with production keys
- [ ] Update Firebase security rules
- [ ] Set up error monitoring (Sentry/LogRocket)
- [ ] Configure backup strategy
- [ ] Set up SSL certificate (automatic with Firebase)
- [ ] Test on multiple devices
- [ ] Set up Google Analytics
- [ ] Configure email domain (SPF/DKIM)

## 📞 Support

If you need help:
1. Check Firebase Console logs
2. Run `firebase functions:log`
3. Contact Derek for credentials

---

**Current Status**: Application structure complete, ready for API credentials and deployment.

**GitHub Repo**: https://github.com/44Labs/adu-lab-app