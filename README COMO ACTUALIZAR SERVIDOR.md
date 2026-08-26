# Guía de Despliegue en Servidor Ubuntu (Nginx + PM2)

Esta guía contiene todos los comandos necesarios para poner tu aplicación `proCard` en producción en un servidor Ubuntu.

## 1. Preparar el Servidor (Solo la primera vez)

Si tu servidor es nuevo, instala lo esencial:

```bash
# Actualizar el sistema
sudo apt update && sudo apt upgrade -y

# Instalar Nginx, Git y Curl
sudo apt install nginx git curl -y

# Instalar Node.js (Versión 20 LTS recomendada)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar PM2 globalmente
sudo npm install -g pm2
```

## 2. Configurar el Proyecto

Clona tu repositorio o sube tus archivos a la carpeta `~/proCard`.

```bash
cd ~/proCard

# Si usas git:
# git pull origin main
git clone -b digitalocean https://github.com/CristianPumaES6/proCard.git
```

### Configurar Variables de Entorno (.env)
Este paso es CRÍTICO. Crea el archivo `.env` con tus datos de producción.

```bash
nano .env
```
Contenido de ejemplo:
```env
DATABASE_URL="file:./prod.db"
NEXT_PUBLIC_API_URL="https://tu-dominio.com"
PORT=3000
NODE_ENV=production
```
*(Guarda con `Ctrl+O`, Enter, y sal con `Ctrl+X`)*

## 3. Instalar y Construir (Build)

Ejecuta estos comandos cada vez que actualices el código:

```bash
# 1. Instalar dependencias limpias
npm ci

# 2. Generar cliente de base de datos (¡Muy importante!)
npx prisma generate


   Este comando le dice a Prisma que cree la estructura (tablas) en tu base de datos nueva.
    ```bash
    npx prisma db push
    ```

# 3. Construir la aplicación
# Si tu servidor tiene poca RAM (1GB), crea Swap antes o esto puede fallar.
npm run build
```

## 4. Ejecutar con PM2

Una vez termine el build, inicia la aplicación en segundo plano.

```bash
# Iniciar la aplicación ejecutando directamente el script (RECOMENDADO)
pm2 start run-prod.js --name "procard"

# O usando npm (alternativa)
pm2 start npm --name "procard" -- run prod

# Guardar la lista de procesos para que inicien al reiniciar el servidor
pm2 save
pm2 startup
```
*(Copia y pega el comando que te muestre `pm2 startup`)*

## 5. Configurar Nginx (Reverse Proxy)

Para que tu web sea accesible desde el puerto 80 (HTTP) en lugar del 3000.

1.  Crear archivo de configuración:
    ```bash
    sudo nano /etc/nginx/sites-available/procard
    ```

2.  Pegar esto (cambia `tu-dominio.com` por tu dominio real):
    ```nginx
    server {
        listen 80;
        server_name procard.iaper.us; # Tu dominio aquí

        # AUMENTAR LÍMITE DE SUBIDA (Importante para evitar error 413)
        client_max_body_size 25M;

        location / {
            proxy_pass http://localhost:14021; # El puerto de tu .env
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```

3.  Activar el sitio y reiniciar Nginx:
    ```bash
    sudo ln -s /etc/nginx/sites-available/procard /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl restart nginx
    ```

## 6. (Opcional) Activar HTTPS con Certbot

Para tener el candado de seguridad:

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d procard.iaper.us
```
---

## Comandos Útiles para Mantenimiento

*   **Ver logs:** `pm2 logs procard`
*   **Reiniciar después de cambios:**
    ```bash
    rm -rf .next
    git pull
    npm ci 
    npx prisma generate
    npm run build
    pm2 restart procard
    ```
