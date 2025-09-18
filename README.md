<div align="center">
  <h1>🚀 Social Content AI Generator</h1>
  <p><strong>Generate amazing social media content ideas with AI-powered intelligence</strong></p>
  
  [![Production Ready](https://img.shields.io/badge/Production-Ready-green.svg)](https://github.com/gerardoriarte-bt/social-content-ai-generator)
  [![Material Design](https://img.shields.io/badge/UI-Material%20Design-blue.svg)](https://mui.com/)
  [![Docker](https://img.shields.io/badge/Deploy-Docker-blue.svg)](https://www.docker.com/)
  [![Backup](https://img.shields.io/badge/Backup-Automated-green.svg)](https://github.com/gerardoriarte-bt/social-content-ai-generator)
</div>

## ✨ Features

- 🎨 **Modern Material Design UI** with light/dark mode
- 🏢 **Company Management** - Create and organize your companies
- 📈 **Business Line Management** - Define content strategies per business line
- 🤖 **AI-Powered Content Generation** using Google Gemini AI
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🔒 **Production Ready** - Complete deployment automation
- 💾 **Automated Backups** - Daily backups with 30-day retention
- 🚀 **One-Click Deployment** - Automated server setup and deployment

## 🚀 Quick Start

### Development

```bash
# Clone the repository
git clone https://github.com/gerardoriarte-bt/social-content-ai-generator.git
cd social-content-ai-generator

# Install dependencies
npm install

# Set up environment variables
cp env.example .env.local
# Edit .env.local with your Gemini API key

# Run development environment
docker-compose -f docker-compose.dev.yml up -d
```

### Production Deployment

```bash
# Quick deployment (5 steps)
curl -fsSL https://raw.githubusercontent.com/gerardoriarte-bt/social-content-ai-generator/main/scripts/setup-server.sh | bash
cp env.production.template .env.production
# Edit .env.production with your configuration
./scripts/pre-deploy-check.sh
./scripts/deploy-production.sh deploy
```

## 📋 Prerequisites

- **Development**: Node.js 18+, Docker, Docker Compose
- **Production**: Ubuntu 20.04+, 2GB RAM, 5GB disk space

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Material-UI (MUI), Vite
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: MySQL 8.0
- **AI**: Google Gemini API
- **Deployment**: Docker, Docker Compose
- **Monitoring**: Automated health checks and logging

## 📚 Documentation

- 📖 [Complete Deployment Guide](DEPLOYMENT-PRODUCTION.md)
- ⚡ [Quick Deployment Instructions](QUICK-DEPLOY.md)
- 🔧 [Development Setup](DEVELOPER_GUIDE.md)
- 🐳 [Docker Configuration](DOCKER.md)

## 🔧 Configuration

### Environment Variables

```bash
# Required
GEMINI_API_KEY=your_gemini_api_key
MYSQL_PASSWORD=your_secure_password
JWT_SECRET=your_jwt_secret_32_chars_minimum

# Optional
ALLOWED_ORIGINS=https://yourdomain.com
RATE_LIMIT_MAX_REQUESTS=1000
```

### Database Schema

The application automatically creates and migrates the database schema:
- Companies table
- Business lines table
- Content ideas table
- Users table
- AI parameters table

## 🚀 Deployment Options

### 1. Automated Deployment (Recommended)

```bash
# Complete server setup and deployment
./scripts/setup-server.sh setup
./scripts/deploy-production.sh deploy
```

### 2. Manual Deployment

```bash
# Step by step deployment
docker-compose -f docker-compose.prod.yml up -d
```

### 3. Cloud Deployment

The application is ready for deployment on:
- AWS EC2
- Google Cloud Platform
- DigitalOcean
- Any VPS with Docker support

## 💾 Backup & Recovery

### Automated Backups

- **Daily backups** at 2:00 AM
- **30-day retention** policy
- **Database and configuration** backup
- **One-click restore** capability

### Manual Backup

```bash
# Create backup
./scripts/backup-production.sh backup

# Restore backup
./scripts/backup-production.sh restore /path/to/backup.sql.gz
```

## 🔒 Security Features

- **Firewall configuration** (UFW)
- **Fail2ban protection** against brute force attacks
- **Rate limiting** on API endpoints
- **CORS configuration** for domain security
- **Secure password hashing** with bcrypt
- **JWT authentication** with secure secrets

## 📊 Monitoring

- **Health checks** for all services
- **Resource monitoring** (CPU, memory, disk)
- **Application logs** with rotation
- **Error tracking** and alerting
- **Performance metrics**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📖 Check the [documentation](DEPLOYMENT-PRODUCTION.md)
- 🐛 Report issues on [GitHub Issues](https://github.com/gerardoriarte-bt/social-content-ai-generator/issues)
- 💬 Join our community discussions

## 🎯 Roadmap

- [ ] Multi-language support
- [ ] Advanced AI model selection
- [ ] Content scheduling
- [ ] Analytics dashboard
- [ ] Team collaboration features
- [ ] API rate limiting improvements
- [ ] Mobile app development

---

<div align="center">
  <p>Made with ❤️ by <a href="https://github.com/gerardoriarte-bt">Gerardo Riarte</a></p>
  <p>⭐ Star this repository if you found it helpful!</p>
</div>

## 🤖 Multi-Provider AI Support

The application now supports multiple AI providers for content generation:

### Supported Providers

- **🟦 Google Gemini** - Advanced AI model by Google (default)
- **🟢 OpenAI GPT** - Powerful conversational AI by OpenAI
- **🟠 Anthropic Claude** - Advanced AI assistant by Anthropic

### Configuration

To use different AI providers, configure the following environment variables:

```bash
# Gemini (already configured)
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash

# OpenAI
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4

# Claude
CLAUDE_API_KEY=your_claude_api_key
CLAUDE_MODEL=claude-3-sonnet-20240229
```

### Features

- **Provider Selection**: Choose your preferred AI provider in the interface
- **Connection Testing**: Test connectivity to each provider
- **Automatic Fallback**: System falls back to backup ideas if providers fail
- **Retry Logic**: Automatic retries for failed requests
- **Cost Optimization**: Switch providers based on your budget and needs

### Usage

1. Select your preferred AI provider in the content generation interface
2. Test the connection to ensure the provider is working
3. Generate content ideas using your selected provider
4. Switch providers anytime based on your needs

## 🚀 Deployment Scripts

The repository includes automated deployment scripts:

- `scripts/deploy-to-server.sh` - Complete server deployment automation
- `scripts/deploy-simple.sh` - Simplified deployment process

### Quick Deployment

```bash
# Make script executable
chmod +x scripts/deploy-to-server.sh

# Deploy to your server
./scripts/deploy-to-server.sh
```

