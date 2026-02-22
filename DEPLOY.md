# ExploreMate Deployment Guide

## Project Architecture

ExploreMate uses a **microservices architecture**:

- **Frontend**: React + TypeScript + Vite (port 80)
- **API Gateway**: Spring Cloud Gateway (port 9080)
- **Auth Service**: Authentication & User Management (port 8080)
- **Trip Service**: Trip Management (port 8083)
- **Email Service**: Email Notifications (port 9090)
- **Service Discovery**: Eureka Server (port 8761)
- **Kafka**: Message Broker (port 9092)

## Quick Start with Docker Compose

### Prerequisites
- Docker
- Docker Compose

### Run All Services
```bash
cd exploreMate
docker-compose up --build
```

### Access the Application
- Frontend: http://localhost
- API Gateway: http://localhost:9080
- Auth Service: http://localhost:8080/api
- Service Discovery: http://localhost:8761

## Environment Variables

Create a `.env` file in the exploreMate folder:

```env
# MongoDB (using existing Atlas cluster or local)
MONGODB_URI=mongodb+srv://exploremate:Arunabasnet1703%23%23@exploremate-dev.tcprkds.mongodb.net/exploremate?retryWrites=true&w=majority

# Email (Gmail app password)
EMAIL_USERNAME=exploremate13@gmail.com
EMAIL_PASSWORD=your_app_password

# Kafka (use managed service or local)
KAFKA_URI=kafka:9092
```

## Deploy to Render

### Backend (Microservices)

1. Push the `exploreMate` folder to GitHub
2. Create a new Blueprint on Render using `exploreMate/render.yaml`
3. Add the required environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `KAFKA_URI`: Kafka broker URL
   - `EMAIL_USERNAME`: Gmail account
   - `EMAIL_PASSWORD`: Gmail app password

### Frontend

1. Push the `exploremate (1)` folder to GitHub
2. Create a new Web Service on Render
3. Set Environment to `Docker`
4. Build Command: `docker build -t frontend .`
5. Start Command: `docker run -p 80:8080 -e VITE_API_BASE_URL=https://your-api-gateway-url frontend`
6. Add environment variable:
   - `VITE_API_BASE_URL`: Your API Gateway URL (e.g., https://exploremate-api-gateway.onrender.com)

## API Endpoints

After deployment, the API is accessible through the API Gateway:

| Service | Endpoint | Description |
|---------|----------|-------------|
| Auth | POST /api/auth/register | Register new user |
| Auth | POST /api/auth/login | User login |
| Auth | GET /api/auth/me | Get current user |
| Trip | GET /api/trips | Get all trips |
| Trip | POST /api/trips | Create new trip |
| Trip | DELETE /api/trips/{id} | Delete trip |

## Project Structure

```
exploreMate/                         # Backend (Microservices)
├── api-gateway/api-gateway/        # API Gateway service
├── auth-service/auth-service/      # Authentication service
├── trip-service/trip-service/      # Trip management service
├── email-service/email-service/    # Email notification service
├── service-discovery/              # Eureka service discovery
├── docker-compose.yml               # Docker compose for local dev
├── render.yaml                      # Render deployment config
└── Dockerfile                       # (for each service)

exploremate (1)/                     # Frontend (React)
├── src/                            # React source code
├── Dockerfile                      # Frontend Docker image
├── nginx.conf                      # Nginx configuration
├── docker-compose.yml              # Frontend only compose
└── render.yaml                     # Render deployment config
```

## Default Users (Development)

| Email | Password | Role |
|-------|----------|------|
| demo@exploremate.app | Password@123 | USER |

## Production Recommendations

1. **Database**: MongoDB Atlas (already configured)
2. **Kafka**: Use managed Kafka service (Confluent Cloud, etc.)
3. **Security**:
   - Configure CORS properly
   - Use HTTPS
   - Set secure JWT secret
4. **Email**: Use a proper email service in production

## Troubleshooting

### CORS Errors
- Ensure API Gateway CORS is configured properly

### Service Discovery Issues
- Check if Eureka is running and accessible

### MongoDB Connection
- Verify connection string is correct
- Check network access settings in MongoDB Atlas
