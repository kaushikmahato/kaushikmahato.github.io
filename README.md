# kaushikmahato.github.io

Personal website and blog of **Kaushik Kumar Mahato** — Deep-Tech Architect & Exited Founder.

Built with [Astro](https://astro.build/) and [Tailwind CSS](https://tailwindcss.com/).

## 🚀 Getting Started

### Prerequisites

- Node.js `^22.12.0` or higher (tested on Node 22+ / 26+)
- [pnpm](https://pnpm.io/) or `npx pnpm`

### Local Development

```bash
# Install dependencies
npx pnpm install

# Start development server
npx pnpm dev
```

Visit [http://localhost:4321](http://localhost:4321) in your browser.

### Building for Production

```bash
npx pnpm build
```

The static output will be generated in `dist/`.

## 📁 Project Structure

```
├── public/              # Static assets (favicons, security headers, .nojekyll)
├── src/
│   ├── components/      # UI & layout components
│   ├── content/         # Content collections
│   │   ├── about/       # About page markdown
│   │   ├── blog/        # Blog articles
│   │   ├── legal/       # Privacy policy & Terms of Service
│   │   └── projects/    # Portfolio projects
│   ├── layouts/         # Base and post layout templates
│   ├── pages/           # File-based routes
│   └── site.config.ts   # Global site settings, navigation, and social links
├── .github/workflows/   # GitHub Actions automated deployment
└── astro.config.mjs     # Astro configuration & integrations
```

## 🛠️ Configuration

Site metadata, navigation menus, and social links are managed in `src/site.config.ts`.

## 🌐 Deployment

This repository is set up with GitHub Actions ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)) to automatically build and deploy to GitHub Pages on every commit pushed to `master`.
