# Developer Guide

## 🏗️ Architecture Overview

The Social Content AI Generator is built with a modern, scalable architecture:

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **UI Library**: Material-UI (MUI) v5
- **Build Tool**: Vite
- **State Management**: React Hooks
- **Styling**: Material Design system with custom themes

### Backend (Node.js + TypeScript)
- **Framework**: Express.js with TypeScript
- **Database**: MySQL with mysql2 driver
- **Authentication**: JWT-based authentication
- **Validation**: Zod schemas
- **AI Integration**: Multi-provider support (Gemini, OpenAI, Claude)

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Database**: MySQL 8.0
- **Reverse Proxy**: Nginx
- **Deployment**: Automated scripts for server deployment

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- MySQL 8.0+
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/gerardoriarte-bt/social-content-ai-generator.git
   cd social-content-ai-generator
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd backend && npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development environment**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

5. **Run migrations**
   ```bash
   cd backend && npm run migrate
   ```

## 🤖 AI Provider Integration

### Adding a New AI Provider

1. **Update the AIService**
   ```typescript
   // In backend/src/services/aiService.ts
   export type AIProvider = 'gemini' | 'openai' | 'claude' | 'your-provider';
   
   private static async generateWithYourProvider(request: IdeaGenerationRequest): Promise<ContentIdea[]> {
     // Implementation here
   }
   ```

2. **Add environment variables**
   ```bash
   YOUR_PROVIDER_API_KEY=your_api_key
   YOUR_PROVIDER_MODEL=your_model
   ```

3. **Update the frontend selector**
   ```typescript
   // In components/AIProviderSelector.tsx
   const providerConfig = {
     // ... existing providers
     yourProvider: {
       name: 'Your Provider',
       description: 'Description of your provider',
       icon: <YourIcon />,
       color: '#your-color',
     },
   };
   ```

### Provider Configuration

Each provider requires:
- **API Key**: Authentication credential
- **Model**: Specific model identifier
- **Endpoint**: API endpoint URL
- **Request Format**: Request body structure
- **Response Parser**: Response parsing logic

## 🗄️ Database Schema

### Core Tables
- **users**: User authentication and profiles
- **companies**: Company information and settings
- **business_lines**: Business line definitions
- **ai_params**: AI configuration parameters
- **content_ideas**: Generated content ideas

### Relationships
- Users → Companies (1:many)
- Companies → Business Lines (1:many)
- Business Lines → AI Params (1:1)
- Business Lines → Content Ideas (1:many)

## 🔧 API Endpoints

### Companies
- `GET /api/companies` - List all companies
- `POST /api/companies` - Create new company
- `PUT /api/companies/:id` - Update company
- `DELETE /api/companies/:id` - Delete company

### Business Lines
- `GET /api/companies/:id/business-lines` - List business lines
- `POST /api/companies/:id/business-lines` - Create business line
- `PUT /api/business-lines/:id` - Update business line
- `DELETE /api/business-lines/:id` - Delete business line

### AI Parameters
- `GET /api/companies/:id/business-lines/:id/ai-params` - Get AI params
- `POST /api/companies/:id/business-lines/:id/ai-params` - Create AI params
- `PUT /api/ai-params/:id` - Update AI params

### Content Ideas
- `POST /api/ideas/companies/:id/business-lines/:id/generate` - Generate ideas
- `GET /api/ideas/companies/:id/business-lines/:id/ideas` - List ideas
- `POST /api/ideas/companies/:id/business-lines/:id/ideas` - Create idea
- `PUT /api/ideas/:id` - Update idea
- `DELETE /api/ideas/:id` - Delete idea

## 🐳 Docker Configuration

### Development
```yaml
# docker-compose.dev.yml
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: social_content_ai
    ports:
      - "3306:3306"
  
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
    volumes:
      - ./backend:/app
      - /app/node_modules
```

### Production
```yaml
# docker-compose.prod.yml
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: ${DB_NAME}
    volumes:
      - mysql_data:/var/lib/mysql
  
  backend:
    build: ./backend
    environment:
      - NODE_ENV=production
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - CLAUDE_API_KEY=${CLAUDE_API_KEY}
```

## 🚀 Deployment

### Automated Deployment
```bash
# Deploy to server
./scripts/deploy-to-server.sh
```

### Manual Deployment
1. **Prepare server**
   ```bash
   sudo apt update && sudo apt upgrade -y
   sudo apt install docker.io docker-compose git
   ```

2. **Clone repository**
   ```bash
   git clone https://github.com/gerardoriarte-bt/social-content-ai-generator.git
   cd social-content-ai-generator
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env.production
   # Edit .env.production with production values
   ```

4. **Deploy**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
npm test
```

### Integration Tests
```bash
# Test API endpoints
curl -X GET http://localhost:3001/api/health
curl -X POST http://localhost:3001/api/companies \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Company","description":"Test Description","industry":"Technology"}'
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Style
- Use TypeScript for type safety
- Follow Material Design principles
- Use meaningful variable names
- Add comments for complex logic
- Follow the existing code structure

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check MySQL service status
   - Verify connection credentials
   - Ensure database exists

2. **AI Provider Errors**
   - Verify API keys are correct
   - Check provider status
   - Review rate limits

3. **Docker Issues**
   - Check Docker service status
   - Verify Docker Compose version
   - Review container logs

### Logs
```bash
# View backend logs
docker-compose logs backend

# View database logs
docker-compose logs mysql

# View all logs
docker-compose logs
```

## 📚 Additional Resources

- [Material-UI Documentation](https://mui.com/)
- [React Documentation](https://reactjs.org/)
- [Express.js Documentation](https://expressjs.com/)
- [Docker Documentation](https://docs.docker.com/)
- [MySQL Documentation](https://dev.mysql.com/doc/)

