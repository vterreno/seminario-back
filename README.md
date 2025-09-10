# ⚙️ Backend - Proyecto MatePymes
Este repositorio contiene la parte del backend desarrollada en NestJS.
## 📋 Requisitos previos
Antes de comenzar, asegurate de tener instalado en tu máquina:
  - [Node.js](https://nodejs.org/) (versión recomendada: 18 o superior)
  - [npm](https://www.npmjs.com/) (se instala junto con Node)
  - [Docker](https://www.docker.com/) (si vas a usar contenedores para la base de datos)

## 📂 Clonar el repositorio
```
git clone https://github.com/vterreno/seminario-back.git
cd seminario-back
```

## 📦 Instalar dependencias
```
npm install
```
## 🛠️ Configurar la base de datos

Asegurate de configurar tu archivo .env con los datos de conexión a la base de datos:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=1234
DB_NAME=mate_pymes
```
Si usás Docker, podés levantar un contenedor de postgre:
```
docker run --name matepymes-db -e POSTGRES_PASSWORD=1234 -e POSTGRES_DB=mate_pymes -p 5432:5432 -d postgres:15
```
## 🛠️ Integración con Zoho Mail

El backend del proyecto utiliza **Zoho Mail** como servicio de correo oficial para envíos automáticos de emails, como confirmaciones de reservas, notificaciones de cambios o alertas del sistema.  

Antes de levantar el backend, necesitás configurar tu archivo `.env` con las variables correctas. Algunas, como la conexión a la base de datos y las credenciales de Zoho, deben pedirse a algún miembro del equipo.  

Ejemplo de `.env`:

```env
# Configuración de la base de datos PostgreSQL
DATABASE_HOST=localhost          # Host donde corre la base de datos
DATABASE_PORT=5432               # Puerto de PostgreSQL (5432 por defecto)
DATABASE_USER=postgres           # Usuario de la base de datos
DATABASE_PASSWORD=postgres       # Contraseña del usuario
DATABASE_NAME=mate_pymes         # Nombre de la base de datos

# Configuración del backend
APP_URL=http://localhost:5001    # URL base del backend

# Integración con Zoho Mail
ZOHO_USER=matepymes@zohomail.com  # Usuario de Zoho Mail
ZOHO_PASS=                         # Contraseña de Zoho Mail
```
## ▶️ Ejecutar migraciones
```
npm run migration:run
```
Esto aplicará las migraciones pendientes a tu base de datos.

##  🌱 Ejecutar seeders

Los seeders permiten cargar datos iniciales en la base de datos (roles, usuarios de prueba, configuraciones básicas, etc.).

Para ejecutar los seeders:
```
npm run seed:run
```
Si querés generar un nuevo seeder:
```
npm run seed:generate <nombre>
```
## ▶️ Levantar el servidor en modo desarrollo
```
npm run start:dev
```
Por defecto, el backend quedará corriendo en:
```
http://localhost:5001
```
## 🛠️ Scripts disponibles
  - npm run start:dev → Levanta el servidor en modo desarrollo
    
  - npm run build → Genera la versión compilada del backend
    
  - npm run migration:run → Ejecuta las migraciones pendientes
    
  - npm run migration:generate <nombre> → Genera una nueva migración
