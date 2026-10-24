# Civic Help Setu

A civic-tech platform built to make public services easier to discover, understand, and access for everyday citizens.

This project is proudly part of the Nexus Spring of Code Winter Edition, bringing together practical problem-solving, public impact, and modern UI design to improve how people interact with government services and civic information.

Civic Help Setu transforms fragmented and often confusing public service systems into a clearer, more human-centered experience. Citizens can explore government services, understand requirements, track progress, save useful services, and securely manage important documents — all from a single, approachable digital interface.

## Why this project exists

Many public services are difficult to navigate because they are distributed across multiple departments, portals, and workflows. Civic Help Setu addresses that gap by helping citizens:

- understand services in plain, accessible language
- quickly find the right public service or document requirement
- get guided support through an AI-powered assistant
- save important services for later follow-up
- track application progress and service status
- securely store identity and document information in a protected vault
- access the platform through modern, secure authentication flows

## What makes it useful

Civic Help Setu is designed for real-world civic access and clarity. It helps reduce uncertainty by turning bureaucratic processes into understandable steps, making it easier for users to complete service journeys with confidence.

The platform combines citizen support, information discovery, and secure document management in one experience so users can move from confusion to action without bouncing between disconnected systems.

## Features

- AI-powered civic assistant for practical guidance
- Discoverable catalog of public services and procedures
- Detailed service pages with eligibility, steps, and relevant information
- Saved services for quick revisit and personal tracking
- Progress tracking dashboard for service journeys and updates
- Secure authentication with Clerk, including email and Google SSO
- Digital vault for citizen documents and credentials
- Responsive and accessible interface with theme support
- Admin access for reviewing and managing service resources
- Bulk import of service records from CSV or JSON with validation and duplicate checks

## Tech stack

- React 19
- Vite
- React Router
- Clerk authentication
- Lucide React icons
- ESLint
- Vercel-ready deployment setup

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
├── README.md
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

## UI and animation usage

The interface is designed to feel modern, approachable, and reassuring for citizens using government-related features. To support that, the app uses lightweight motion patterns such as:

- subtle hover animations on cards and interactive buttons
- smooth transitions for navigation and panel changes
- soft reveal effects for service highlights and feature blocks
- motion cues for status indicators, call-to-action buttons, and saved items
- gentle background and icon animations to improve engagement without overwhelming the user

Suggested animation patterns:

```css
.card {
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

These kinds of interactions help important content feel more dynamic and usable while keeping the community-first experience clean and accessible.

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
4. To make someone an admin, assign `publicMetadata` with `{ "role": "admin" }` in the Clerk dashboard. Other users are treated as citizens by default.

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

This repository includes several civic service and user flow components, and the project is structured as a modern front-end application focused on accessibility, clarity, and public-service navigation.

## Contact

For project questions or collaboration opportunities, contact the repository owner through GitHub.
