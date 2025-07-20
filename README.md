# CIN Foundation Website

The official website for the Collective Intelligence Network (CIN) Foundation - Building the Operating System for a More Intelligent Society.

## 🌟 Overview

This website presents the CIN Foundation's vision for a decentralized, AI-driven ecosystem that enables intelligence compounding and trustless collaboration. Built with modern web technologies and optimized for performance and accessibility.

## 🚀 Features

- **Responsive Design**: Optimized for all devices and screen sizes
- **Performance Optimized**: Fast loading with lazy loading and optimized assets
- **Accessibility First**: WCAG compliant with proper semantic markup
- **Interactive Elements**: Smooth animations and expandable content sections
- **SEO Optimized**: Structured data and meta tags for search engines

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3 (Tailwind CSS), Vanilla JavaScript
- **Hosting**: Firebase Hosting
- **Build Tools**: Node.js, npm
- **Version Control**: Git

## 📁 Project Structure

```
src/
├── assets/
│   ├── documents/          # PDFs and documentation
│   └── images/            # Images and graphics
├── blog/                  # Blog posts and articles
├── scripts/               # JavaScript modules
├── styles/                # CSS and styling
├── index.html            # Main homepage
├── robots.txt            # Search engine directives
└── sitemap.xml           # Site structure for SEO
```

## 🔧 Development

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase CLI (for deployment)

### Local Development

1. Clone the repository:
```bash
git clone <repository-url>
cd cin-starter
```

2. Install dependencies:
```bash
npm install
```

3. Start local development server:
```bash
npm run dev
```

4. Open http://localhost:3000 in your browser

### Building for Production

```bash
npm run build
```

## 🚀 Deployment

### Firebase Hosting

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase (if not already done):
```bash
firebase init hosting
```

4. Deploy to Firebase:
```bash
firebase deploy
```

### GitHub Actions (CI/CD)

The project includes GitHub Actions workflow for automatic deployment to Firebase when pushing to the main branch.

## 📝 Content Management

### Adding New Content

- **Blog Posts**: Add new HTML files in `src/blog/`
- **Images**: Place in `src/assets/images/`
- **Documents**: Place PDFs in `src/assets/documents/`

### Updating Favicon

Run the favicon generation script:
```bash
node generate-favicon.js
```

## 🎨 Customization

### Styling

The project uses Tailwind CSS for styling. Main configuration is in `tailwind.config.js`.

### JavaScript

Modular JavaScript files are located in `src/scripts/`:
- `main.js` - Main application logic
- `animations.js` - Animation and interaction handlers
- `expandable.js` - Expandable content functionality
- Additional utility modules

## 🔍 SEO & Analytics

- Structured data markup for rich snippets
- Open Graph and Twitter Card meta tags
- Google Analytics integration
- Sitemap and robots.txt included

## 📊 Performance

- Lazy loading for images
- Optimized asset delivery
- Minimal JavaScript footprint
- Core Web Vitals monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Contact

- Website: https://cin-foundation.org
- Email: contact@cin-foundation.org

## 🙏 Acknowledgments

Built with modern web standards and best practices for performance, accessibility, and user experience.