# CivicBridge

**"Making public services easier to understand."**

CivicBridge is an open-source civic-tech platform that helps ordinary people understand and navigate government/public services. We aim to translate complex government processes into simple, structured guides using plain language.

## 🌟 Features
- **Simple Language:** Clear, easy-to-understand explanations of government services.
- **AI Assistant:** Conversational interface to help you find what you need.
- **Service Directory:** Searchable directory of public services and procedures.
- **Verified Sources:** All guides point back to official government resources.
- **Authentication with Clerk & Google:** Secure single sign-on with Google and email via Clerk.
- **Digital Document Vault:** Store and verify citizen credentials securely.
- **Open Source:** Community-driven and privacy-focused.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation
1. Clone the repository
```bash
git clone https://github.com/your-org/civicbridge.git
cd civicbridge
```

2. Install dependencies
```bash
npm install
```

3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Add your Clerk Publishable Key:
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

> **Setting up Google Login in Clerk:**
> 1. Go to your [Clerk Dashboard](https://dashboard.clerk.com).
> 2. Navigate to **Configure > Social Connections**.
> 3. Ensure **Google** is toggled ON (enabled by default in development mode).
> 4. Copy your **Publishable Key** from **API Keys** and paste it into `.env` as `VITE_CLERK_PUBLISHABLE_KEY`.


4. Start the development server
```bash
npm run dev
```

## 🤝 Contributing
We welcome contributions! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to get started.

## 📜 License
This project is licensed under the MIT License - see the LICENSE file for details.
