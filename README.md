# ADU Lab - AI-Powered ADU Planning Platform

The flagship implementation of the SPAR™ (Strategic Protocols & AI Roadmaps) Campaign framework by 44 Labs.

## Overview

ADU Lab transforms static ADU reports into dynamic, AI-powered decision-making tools. Our platform provides instant feasibility analysis for Accessory Dwelling Unit projects using advanced AI and comprehensive data analysis.

## Features

- **6-Question Assessment**: Quick feasibility analysis in under 2 minutes
- **SPAR Score™**: Proprietary scoring system evaluating Site, Permitting, Architecture, and Resources
- **AI-Powered Reports**: Detailed analysis across 9 categories
- **Tiered Access**: Free assessments to Pro+ subscriptions
- **PWA Capabilities**: Works offline, installable on any device
- **Real-time Updates**: Living documents that evolve with your project

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Firebase (Auth, Firestore, Functions, Hosting)
- **AI**: Google Vertex AI / Gemini API
- **Payments**: Stripe
- **CRM**: HubSpot
- **Email**: SendGrid

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Firebase CLI (`npm install -g firebase-tools`)
- Google Cloud account with billing enabled
- Stripe account
- HubSpot account
- SendGrid account

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/44laboratories/adu-lab-app.git
cd adu-lab-app
```

2. Install dependencies:
```bash
npm install
cd functions && npm install
```

3. Set up Firebase:
```bash
firebase login
firebase use --add
# Select your Firebase project
```

4. Configure environment variables:
```bash
firebase functions:config:set \
  stripe.secret_key="sk_test_..." \
  stripe.webhook_secret="whsec_..." \
  sendgrid.api_key="SG...." \
  hubspot.api_key="..."
```

5. Start the emulators:
```bash
firebase emulators:start
```

6. Access the app at http://localhost:5000

### Deployment

Deploy to Firebase Hosting:
```bash
npm run deploy
```

## Project Structure

```
adu-lab-app/
├── public/               # Frontend files
│   ├── index.html       # Landing page
│   ├── app/            # Authenticated app
│   ├── assets/         # CSS, JS, images
│   └── categories/     # Report sections
├── functions/          # Cloud Functions
│   ├── index.js       # Main functions
│   └── package.json   # Dependencies
├── firebase.json      # Firebase config
└── firestore.rules   # Security rules
```

## API Endpoints

### Cloud Functions

- `processAssessment`: Process Tier 1 assessment with AI
- `createCheckoutSession`: Create Stripe payment session
- `handleStripeWebhook`: Handle payment confirmations
- `sendAssessmentEmail`: Send assessment results

## Security

- Firebase Auth for user authentication
- Firestore security rules for data access
- HTTPS enforced on all endpoints
- API keys stored in Firebase config

## Contributing

This is a proprietary project of 44 Laboratories. For questions or support, contact support@adulab.ai.

## License

Copyright © 2024 44 Laboratories. All rights reserved.

---

Built with ❤️ by 44 Labs