# 👨‍💻 Guía del Desarrollador - Social Content AI Generator

## 🚀 **Configuración del Entorno de Desarrollo**

### **Requisitos Previos**
- Node.js 18+ 
- Docker y Docker Compose
- MySQL 8.0+
- Git

### **Instalación Local**
```bash
# 1. Clonar repositorio
git clone https://github.com/tu-usuario/social-content-ai-generator.git
cd social-content-ai-generator

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# 4. Iniciar base de datos
docker-compose up -d mysql

# 5. Ejecutar migraciones
npm run migrate

# 6. Iniciar desarrollo
npm run dev
```

---

## 🏗️ **Arquitectura del Sistema**

### **Estructura de Directorios**
```
social-content-ai-generator/
├── backend/                 # API Node.js
│   ├── src/
│   │   ├── controllers/     # Lógica de negocio
│   │   ├── models/         # Modelos de datos
│   │   ├── routes/         # Definición de rutas
│   │   ├── services/       # Servicios externos
│   │   ├── middleware/     # Middleware personalizado
│   │   └── config/         # Configuraciones
│   └── database/           # Migraciones SQL
├── components/             # Componentes React
├── services/              # Servicios frontend
├── types.ts              # Definiciones TypeScript
└── docker-compose.yml    # Configuración Docker
```

### **Stack Tecnológico**
- **Frontend:** React 18 + TypeScript + Tailwind CSS
- **Backend:** Node.js + Express + TypeScript
- **Base de datos:** MySQL 8.0
- **IA:** Google Gemini AI
- **Contenedores:** Docker + Docker Compose
- **Proxy:** Nginx

---

## 🗄️ **Base de Datos**

### **Esquema Principal**
```sql
-- Usuarios del sistema
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Empresas de los usuarios
CREATE TABLE companies (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    industry VARCHAR(255) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Líneas de negocio por empresa
CREATE TABLE business_lines (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    company_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Ideas de contenido generadas
CREATE TABLE content_ideas (
    id VARCHAR(36) PRIMARY KEY,
    business_line_id VARCHAR(36) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    rationale TEXT NOT NULL,
    platform VARCHAR(50) NOT NULL DEFAULT 'Instagram',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (business_line_id) REFERENCES business_lines(id) ON DELETE CASCADE
);

-- Hashtags asociados a ideas
CREATE TABLE hashtags (
    id VARCHAR(36) PRIMARY KEY,
    content_idea_id VARCHAR(36) NOT NULL,
    tag VARCHAR(100) NOT NULL,
    FOREIGN KEY (content_idea_id) REFERENCES content_ideas(id) ON DELETE CASCADE
);

-- Parámetros de IA por business line
CREATE TABLE ai_params (
    id VARCHAR(36) PRIMARY KEY,
    business_line_id VARCHAR(36) NOT NULL,
    tone VARCHAR(100) NOT NULL,
    character_type VARCHAR(100) NOT NULL,
    target_audience VARCHAR(255) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    social_network VARCHAR(50) NOT NULL,
    content_format VARCHAR(50) NOT NULL,
    objective VARCHAR(50) NOT NULL,
    focus TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (business_line_id) REFERENCES business_lines(id) ON DELETE CASCADE
);
```

### **Datos de Prueba**
```sql
-- Usuario demo
INSERT INTO users (id, name, email, avatar_url) 
VALUES ('demo-user-123', 'Demo User', 'demo@example.com', NULL);

-- Empresa de ejemplo
INSERT INTO companies (id, name, description, industry, user_id)
VALUES ('company-123', 'Tech Startup', 'Innovative technology company', 'Technology', 'demo-user-123');
```

---

## 🔌 **APIs y Endpoints**

### **Autenticación**
```typescript
// Deshabilitada temporalmente - siempre retorna usuario demo
POST /api/auth/login
POST /api/auth/register
GET /api/auth/me
```

### **Empresas**
```typescript
GET    /api/companies              // Listar empresas
POST   /api/companies              // Crear empresa
GET    /api/companies/:id          // Obtener empresa
PUT    /api/companies/:id          // Actualizar empresa
DELETE /api/companies/:id          // Eliminar empresa
```

### **Business Lines**
```typescript
GET    /api/companies/:id/business-lines              // Listar business lines
POST   /api/companies/:id/business-lines              // Crear business line
GET    /api/companies/:id/business-lines/:blId        // Obtener business line
PUT    /api/companies/:id/business-lines/:blId        // Actualizar business line
DELETE /api/companies/:id/business-lines/:blId        // Eliminar business line
```

### **Ideas de Contenido**
```typescript
POST   /api/ideas/companies/:id/business-lines/:blId/generate  // Generar ideas
GET    /api/ideas/companies/:id/business-lines/:blId/ideas     // Listar ideas
GET    /api/ideas/companies/:id/business-lines/:blId/ideas/:ideaId  // Obtener idea
PUT    /api/ideas/companies/:id/business-lines/:blId/ideas/:ideaId  // Actualizar idea
DELETE /api/ideas/companies/:id/business-lines/:blId/ideas/:ideaId  // Eliminar idea
```

### **Parámetros AI**
```typescript
GET    /api/companies/:id/business-lines/:blId/ai-params       // Obtener parámetros
POST   /api/companies/:id/business-lines/:blId/ai-params       // Crear parámetros
PUT    /api/companies/:id/business-lines/:blId/ai-params       // Actualizar parámetros
```

---

## 🤖 **Integración con IA**

### **Configuración de Gemini**
```typescript
// backend/src/services/geminiService.ts
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
```

### **Generación de Ideas**
```typescript
// Flujo de generación
1. Validar parámetros AI del business line
2. Construir prompt contextualizado
3. Llamar a Gemini API
4. Validar respuesta de IA
5. Guardar ideas en base de datos
6. Retornar ideas al frontend
```

### **Manejo de Errores**
```typescript
// Errores comunes y respuestas
503 Service Unavailable → "Gemini AI con alta demanda"
429 Too Many Requests → "Límite de solicitudes excedido"
400 Bad Request → "Parámetros inválidos"
500 Internal Server Error → "Error interno del servidor"
```

---

## 🎨 **Frontend y Componentes**

### **Estructura de Componentes**
```
components/
├── App.tsx                    # Componente principal
├── Header.tsx                 # Header de la aplicación
├── CompanyManager.tsx         # Gestión de empresas
├── BusinessLineManager.tsx    # Gestión de business lines
├── IdeaGenerator.tsx          # Generación de ideas
├── AIParamsForm.tsx          # Formulario de parámetros AI
├── Modal.tsx                 # Modal reutilizable
└── icons.tsx                 # Iconos SVG
```

### **Estados y Props**
```typescript
// Tipos principales
interface Company {
  id: string;
  name: string;
  description: string;
  industry: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface BusinessLine {
  id: string;
  name: string;
  description: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

interface ContentIdea {
  id: string;
  businessLineId: string;
  title: string;
  description: string;
  rationale: string;
  platform: string;
  hashtags: string[];
  createdAt: string;
  updatedAt: string;
}
```

### **Servicios Frontend**
```typescript
// services/companyService.ts
export class CompanyService {
  static async getCompanies(): Promise<Company[]>
  static async createCompany(company: CreateCompanyData): Promise<Company>
  static async updateCompany(id: string, data: UpdateCompanyData): Promise<Company>
  static async deleteCompany(id: string): Promise<void>
}

// services/ideaService.ts
export class IdeaService {
  static async generateIdeas(companyId: string, businessLineId: string, numberOfIdeas: number): Promise<ContentIdea[]>
  static async testGeminiConnection(): Promise<boolean>
}
```

---

## 🐳 **Docker y Despliegue**

### **Docker Compose**
```yaml
# docker-compose.deploy.yml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: ${MYSQL_DATABASE}
    volumes:
      - mysql_data:/var/lib/mysql

  backend:
    build: ./backend
    environment:
      - DB_HOST=mysql
      - DB_USER=${MYSQL_USER}
      - DB_PASSWORD=${MYSQL_PASSWORD}
      - DB_NAME=${MYSQL_DATABASE}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    depends_on:
      - mysql

  frontend:
    build: 
      context: .
      dockerfile: Dockerfile.frontend
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    depends_on:
      - frontend
      - backend
```

### **Comandos de Despliegue**
```bash
# Desarrollo local
docker-compose up -d

# Producción
docker-compose -f docker-compose.deploy.yml up -d

# Reconstruir servicios
docker-compose -f docker-compose.deploy.yml build --no-cache
docker-compose -f docker-compose.deploy.yml up -d

# Limpiar todo
docker-compose -f docker-compose.deploy.yml down -v
docker system prune -f
```

---

## 🧪 **Testing**

### **Backend Testing**
```bash
# Ejecutar tests
npm run test

# Tests con coverage
npm run test:coverage

# Tests de integración
npm run test:integration
```

### **Frontend Testing**
```bash
# Tests unitarios
npm run test

# Tests E2E
npm run test:e2e

# Linting
npm run lint
```

### **Testing de APIs**
```bash
# Health check
curl http://localhost:3001/health

# Test de empresas
curl -X POST http://localhost:3001/api/companies \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Company","description":"Test","industry":"Tech"}'

# Test de generación de ideas
curl -X POST http://localhost:3001/api/ideas/companies/ID/business-lines/ID/generate \
  -H "Content-Type: application/json" \
  -d '{"numberOfIdeas":1}'
```

---

## 🔧 **Troubleshooting**

### **Problemas Comunes**

#### **Error de Conexión a Base de Datos**
```bash
# Verificar que MySQL esté corriendo
docker-compose ps mysql

# Revisar logs
docker-compose logs mysql

# Reiniciar MySQL
docker-compose restart mysql
```

#### **Error de Docker Compose ContainerConfig**
```bash
# Limpiar completamente
docker-compose down -v
docker system prune -f
docker-compose up -d
```

#### **Error de Gemini API**
```bash
# Verificar API key
echo $GEMINI_API_KEY

# Test de conexión
curl http://localhost:3001/api/ideas/test-gemini
```

#### **Frontend no carga**
```bash
# Reconstruir frontend
docker-compose build --no-cache frontend
docker-compose up -d frontend

# Verificar nginx
docker-compose logs nginx
```

### **Logs y Debugging**
```bash
# Logs de todos los servicios
docker-compose logs

# Logs de un servicio específico
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mysql

# Logs en tiempo real
docker-compose logs -f backend
```

---

## 📚 **Recursos Adicionales**

### **Documentación Externa**
- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [Google Gemini AI](https://ai.google.dev/)

### **Herramientas de Desarrollo**
- **IDE:** VS Code con extensiones TypeScript y React
- **API Testing:** Postman o Insomnia
- **Database:** MySQL Workbench o DBeaver
- **Version Control:** Git con GitHub

### **Monitoreo y Observabilidad**
- **Logs:** Docker logs + console.log
- **Métricas:** Tiempo de respuesta de APIs
- **Health Checks:** Endpoints /health
- **Error Tracking:** Console errors + try/catch

---

## 🤝 **Contribución**

### **Flujo de Desarrollo**
1. **Fork del repositorio**
2. **Crear branch feature:** `git checkout -b feature/nueva-funcionalidad`
3. **Desarrollar y testear**
4. **Commit con mensaje descriptivo:** `git commit -m "feat: agregar nueva funcionalidad"`
5. **Push y crear Pull Request**

### **Estándares de Código**
- **TypeScript:** Tipado estricto
- **ESLint:** Configuración estándar
- **Prettier:** Formateo automático
- **Commits:** Conventional Commits
- **Testing:** Cobertura mínima 80%

---

*Guía actualizada el 10 de Septiembre, 2025*
*Versión: 1.0*
*Mantenido por: Equipo de Desarrollo*
