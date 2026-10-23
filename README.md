# Civic Help Setu

A civic-tech web application designed to help citizens easily understand, navigate, and track government and public services.

Civic Help Setu turns complex civic procedures into clear, accessible guidance and combines service discovery, AI assistance, secure user accounts, and document tracking in a single experience.

## Why this project exists

Many public services are difficult to understand because they are fragmented across agencies, departments, and portals. Civic Help Setu aims to simplify this by:

- explaining services in plain language
- helping users find the right public service quickly
- providing an AI-backed assistant for guidance
- letting users save and track relevant services
- storing secure personal documents in a protected vault
- enabling secure authentication through Clerk

## Features

- AI-powered civic assistant for practical guidance
- Browseable directory of public services and procedures
- Detailed service pages with eligibility and process information
- Saved services for users to revisit later
- Tracking dashboard for service progress or status updates
- Secure authentication with Clerk (email, Google SSO, and protected routes)
- Digital vault for citizen documents and credentials
- Theme support and responsive UI
- Admin route to manage or review platform access
- Bulk import of service records from CSV or JSON in the admin Service Catalog, with a validation report (row numbers, duplicates) and a preview before anything is saved

## Tech stack

- React 19
- Vite
- React Router
- Clerk authentication
- Lucide React icons
- ESLint
- Vercel-ready deployment config

## Project structure

```text
.
├── .github/
├── public/
├── src/
│   ├── ai/
│   ├── assets/
│   ├── components/
│   ├── context/
│   ├── data/
│   ├── pages/
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .env.example
├── .gitignore
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── CHANGELOG.md
├── SECURITY.md
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── refactor.js
├── vercel.json
├── vite.config.js
├── LICENSE
└── README.md
```

## Key application flows

The app includes the following main routes:

- Home
- Assistant
- Services
- Service Details
- Saved
- Track
- Vault
- Profile
- Login / Sign Up
- Open Source
- Privacy Policy
- Admin

## Getting started

### Prerequisites

- Node.js 18 or newer
- npm

### 1. Clone the repository

```bash
git clone https://github.com/GoldRay19/Civic-Help-Setu.git
cd Civic-Help-Setu
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the sample environment file:

```bash
cp .env.example .env
```

Then update `.env` with your values:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_OPENAI_API_KEY=your_openai_key
VITE_API_BASE_URL=your_backend_base_url
```

#### Clerk setup

1. Create an account or sign in at [Clerk](https://dashboard.clerk.com)
2. Get your publishable key from the Clerk dashboard
3. Add it to `VITE_CLERK_PUBLISHABLE_KEY` in your `.env` file

## Run the app locally

```bash
npm run dev
```

The app will start in development mode with Vite, usually at:

```text
http://localhost:5173
```

## Production build

```bash
npm run build
```

## Linting

```bash
npm run lint
```

## Tests

```bash
npm test
```

## Deployment

This project includes a Vercel configuration (`vercel.json`) and is ready for deployment on Vercel or similar hosting platforms.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Contributing

Contributions are welcome. Please follow the repository standards and review the project docs before making changes.

- open an issue for bug reports or feature requests
- keep changes focused and well-documented
- validate with linting and build checks before submitting

## Notes

This repository includes several civic service and user flow components, and the project is structured as a modern front-end application focused on accessibility, clarity, and public service navigation.

## Contact

For project questions or collaboration opportunities, contact the repository owner through GitHub.
