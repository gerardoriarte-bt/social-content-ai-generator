# 🎮 GUÍA PARA NIÑOS: Cómo poner tu app en Internet

## 🎯 ¿Qué vamos a hacer?
Vamos a poner tu aplicación de generación de ideas en Internet para que todo el mundo pueda usarla, ¡como Netflix o YouTube!

## 🏠 Paso 1: Crear tu "casa" en Internet (5 minutos)

### 1.1 Ir a Amazon Web Services (AWS)
1. Ve a: https://aws.amazon.com
2. Haz clic en "Sign In" (Iniciar sesión)
3. Usa tu cuenta de Amazon (o crea una nueva)

### 1.2 Crear una "casa" (EC2 Instance)
1. Busca "EC2" en el buscador de AWS
2. Haz clic en "Launch Instance" (Crear instancia)
3. Elige "Ubuntu Server 22.04 LTS" (es como el sistema operativo)
4. Elige "t2.micro" (es la casa más pequeña y barata)
5. Crea una "Key Pair" (es como la llave de tu casa)
6. Haz clic en "Launch Instance"

### 1.3 Configurar la "puerta" de tu casa (Security Group)
1. Ve a "Security Groups" en el menú de la izquierda
2. Busca tu instancia y haz clic en "Edit inbound rules"
3. Agrega estas reglas:
   - **SSH (22)**: Tu IP solamente
   - **HTTP (80)**: 0.0.0.0/0 (todo el mundo)
   - **HTTPS (443)**: 0.0.0.0/0 (todo el mundo)
4. Guarda los cambios

## 🚪 Paso 2: Entrar a tu casa (2 minutos)

### 2.1 Conectar por SSH
1. Copia la "Public IP" de tu instancia
2. Abre tu terminal (o usa PuTTY si estás en Windows)
3. Escribe este comando (cambia "tu-ip" por tu IP real):
```bash
ssh -i tu-llave.pem ubuntu@tu-ip
```

## 🛠️ Paso 3: Instalar las herramientas (10 minutos)

### 3.1 Actualizar tu casa
```bash
sudo apt update && sudo apt upgrade -y
```

### 3.2 Instalar Docker (es como una caja mágica)
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu
```

### 3.3 Instalar Docker Compose (es como el manual de las cajas)
```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 3.4 Instalar Git (es como un cartero digital)
```bash
sudo apt install -y git curl wget
```

## 📁 Paso 4: Traer tu proyecto (5 minutos)

### 4.1 Crear una carpeta
```bash
sudo mkdir -p /opt/social-content-ai
sudo chown ubuntu:ubuntu /opt/social-content-ai
cd /opt/social-content-ai
```

### 4.2 Traer tu código
```bash
git clone https://github.com/tu-usuario/social-content-ai-generator.git .
```

### 4.3 Crear carpetas necesarias
```bash
mkdir -p ssl logs backups
```

## ⚙️ Paso 5: Configurar las "llaves" (5 minutos)

### 5.1 Crear archivo de configuración
```bash
cp env.production.example .env.production
nano .env.production
```

### 5.2 Cambiar estas cosas importantes:
```bash
# Cambia estas líneas:
MYSQL_ROOT_PASSWORD=mi_password_super_secreto_123
MYSQL_PASSWORD=mi_password_mysql_456
JWT_SECRET=mi_jwt_secret_muy_largo_y_seguro_789
GEMINI_API_KEY=tu_api_key_de_gemini
ALLOWED_ORIGINS=https://tu-dominio.com
```

**💡 Tip**: Presiona `Ctrl + X`, luego `Y`, luego `Enter` para guardar

## 🚀 Paso 6: ¡Poner todo en marcha! (5 minutos)

### 6.1 Hacer los scripts ejecutables
```bash
chmod +x scripts/*.sh
```

### 6.2 ¡Desplegar!
```bash
./scripts/deploy.sh
```

**🎉 ¡Espera 2-3 minutos y tu app estará en Internet!**

## 🌐 Paso 7: Ver tu app en Internet

### 7.1 Sin dominio (usando IP)
Ve a: `http://tu-ip-publica`

### 7.2 Con dominio (más profesional)
1. Compra un dominio (como GoDaddy o Namecheap)
2. Apunta tu dominio a tu IP
3. Ejecuta: `./scripts/setup-ssl.sh`

## 🔍 Paso 8: Verificar que todo funciona

### 8.1 Ver el estado
```bash
./scripts/monitoring.sh
```

### 8.2 Ver los "logs" (como un diario)
```bash
docker-compose -f docker-compose.micro.yml logs -f
```

## 🆘 Si algo sale mal (Solución de problemas)

### Problema: "No puedo conectar"
**Solución**: Verifica que tu Security Group tenga las reglas correctas

### Problema: "La app no carga"
**Solución**: 
```bash
docker-compose -f docker-compose.micro.yml ps
docker-compose -f docker-compose.micro.yml logs
```

### Problema: "Se queda sin memoria"
**Solución**: 
```bash
# Reiniciar todo
docker-compose -f docker-compose.micro.yml restart
```

## 🎯 Comandos que necesitas recordar

```bash
# Ver qué está pasando
docker-compose -f docker-compose.micro.yml ps

# Ver los "diarios" (logs)
docker-compose -f docker-compose.micro.yml logs -f

# Reiniciar todo
docker-compose -f docker-compose.micro.yml restart

# Parar todo
docker-compose -f docker-compose.micro.yml down

# Encender todo
docker-compose -f docker-compose.micro.yml up -d
```

## 💰 ¿Cuánto cuesta?

- **t2.micro**: ~$8-10 por mes
- **Dominio**: ~$10-15 por año
- **Total**: ~$10-15 por mes

## 🎉 ¡Felicitaciones!

¡Has puesto tu aplicación en Internet! Ahora todo el mundo puede:
- ✅ Crear cuentas
- ✅ Generar ideas con IA
- ✅ Guardar y editar ideas
- ✅ Usar tu app desde cualquier lugar

**¡Eres un desarrollador de verdad ahora!** 🚀

---

## 📞 Si necesitas ayuda

1. Revisa los logs: `docker-compose -f docker-compose.micro.yml logs`
2. Verifica el estado: `./scripts/monitoring.sh`
3. Pregunta en GitHub o foros de desarrollo

**¡Recuerda: No hay preguntas tontas, solo preguntas sin hacer!** 😊
