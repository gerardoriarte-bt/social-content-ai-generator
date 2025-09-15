# 🚀 Deployment Guide

## 📋 Pre-Deployment Checklist

### 1. **Environment Setup**
- [ ] Copy `.env.example` to `.env` and configure variables
- [ ] Ensure Docker and Docker Compose are installed
- [ ] Verify all required environment variables are set

### 2. **Code Validation**
- [ ] Run schema validation: `node scripts/validate-schemas.js`
- [ ] Run migration validation: `node scripts/migration-helper.js validate`
- [ ] Test builds locally: `./scripts/pre-deploy-check.sh`

### 3. **Database Preparation**
- [ ] Backup existing database (if applicable)
- [ ] Verify migration scripts are MySQL-compatible
- [ ] Test migrations on development database

## 🔧 Deployment Process

### **Option 1: Robust Deployment (Recommended)**
```bash
./scripts/deploy-robust.sh
```

### **Option 2: Standard Deployment**
```bash
./scripts/deploy-fixed.sh
```

### **Option 3: Manual Deployment**
```bash
# Stop existing containers
docker-compose down

# Remove old images
docker-compose down --rmi all

# Build and start services
docker-compose up -d --build

# Wait for services to be ready
sleep 30

# Verify deployment
curl http://localhost:3001/health
curl -I http://localhost:80
```

## 🧪 Post-Deployment Verification

### **Health Checks**
```bash
# Backend health
curl http://localhost:3001/health

# Frontend response
curl -I http://localhost:80

# Database connection
docker-compose exec backend node -e "
const mysql = require('mysql2/promise');
const connection = mysql.createConnection({
  host: 'mysql',
  port: 3306,
  user: 'social_content_user',
  password: 'social_content_password',
  database: 'social_content_ai'
});
connection.then(() => console.log('DB OK')).catch(console.error);
"
```

### **Service URLs**
- **Frontend:** http://localhost:80
- **Backend API:** http://localhost:3001/api
- **Health Check:** http://localhost:3001/health

## 🛠️ Troubleshooting

### **Common Issues**

#### **1. MySQL ARM64 Compatibility**
**Problem:** `no matching manifest for linux/arm64/v8`
**Solution:** Use `platform: linux/amd64` in docker-compose.yml

#### **2. Migration Failures**
**Problem:** SQL syntax errors in migrations
**Solution:** Use MySQL-compatible syntax with prepared statements

#### **3. Schema Validation Issues**
**Problem:** Validation rules too restrictive
**Solution:** Run `node scripts/validate-schemas.js` to check rules

#### **4. Container Health Check Failures**
**Problem:** Services not responding to health checks
**Solution:** Increase `start_period` and `timeout` values

### **Debug Commands**
```bash
# Check container logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mysql

# Check container status
docker-compose ps

# Check resource usage
docker stats

# Access container shell
docker-compose exec backend sh
docker-compose exec mysql mysql -u root -p
```

## 📊 Monitoring

### **Log Monitoring**
```bash
# Follow all logs
docker-compose logs -f

# Follow specific service
docker-compose logs -f backend
```

### **Performance Monitoring**
```bash
# Container resource usage
docker stats

# Database performance
docker-compose exec mysql mysqladmin -u root -p status
```

## 🔄 Rollback Procedure

### **Quick Rollback**
```bash
# Stop current deployment
docker-compose down

# Restore previous images (if available)
docker-compose pull

# Start previous version
docker-compose up -d
```

### **Database Rollback**
```bash
# Restore database backup
docker-compose exec mysql mysql -u root -p social_content_ai < backup.sql
```

## 📝 Best Practices

### **1. Schema Design**
- Use reasonable validation limits (5-500 characters for descriptions)
- Test validation rules before deployment
- Use MySQL-compatible migration syntax

### **2. Migration Management**
- Always test migrations on development first
- Use prepared statements for conditional operations
- Include rollback procedures

### **3. Environment Configuration**
- Use environment variables for all configuration
- Never commit sensitive data to version control
- Use `.env.example` for documentation

### **4. Health Monitoring**
- Implement comprehensive health checks
- Monitor logs for errors
- Set up alerting for critical issues

## 🚨 Emergency Procedures

### **Service Down**
1. Check container status: `docker-compose ps`
2. Check logs: `docker-compose logs [service]`
3. Restart service: `docker-compose restart [service]`
4. If persistent, full redeploy: `./scripts/deploy-robust.sh`

### **Database Issues**
1. Check MySQL logs: `docker-compose logs mysql`
2. Test connection: `docker-compose exec mysql mysqladmin ping`
3. Restore from backup if needed

### **Performance Issues**
1. Check resource usage: `docker stats`
2. Scale services if needed
3. Optimize database queries
4. Check for memory leaks

## 📞 Support

For deployment issues:
1. Check this documentation
2. Review logs for error messages
3. Test individual components
4. Contact development team with specific error details
