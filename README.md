# Online Blood Bank Management System (OBBMS)

A secure, scalable, cloud-based web application that allows donors, hospitals, and admins to manage blood donations, inventory tracking, and blood requests in real-time.

## Project Overview

This application enables:
- **Donors**: Register profiles, schedule donations, view donation history
- **Hospitals**: Request blood units, manage patient requirements, track request status
- **Admins**: Manage blood inventory, approve/reject requests, oversee system operations

## Architecture

### Modular and Scalable Architecture
- **Frontend**: Next.js with Tailwind CSS
- **Backend**: NestJS with modular design
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT with role-based access control (RBAC)

### Containerization with Docker
- Docker Compose for orchestrating multi-container setup
- Dockerfile for each service
- Volume management for data persistence

### Cloud Deployment Ready
- AWS EC2 for application hosting
- AWS RDS for PostgreSQL database
- PM2 for process management

## Technical Stack

### Backend
- **Framework**: NestJS 11
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT with role-based access (admin, donor, hospital)
- **API Documentation**: Swagger
- **Testing**: Jest

### Frontend
- **Framework**: Next.js 15
- **Styling**: Tailwind CSS 4
- **State Management**: React hooks

### DevOps
- **Containerization**: Docker
- **Process Management**: PM2
- **Cloud**: AWS (EC2, RDS, S3)

## Database Schema

### Core Entities
- **Users**: Donors, hospitals, and admins with role-based permissions
- **Blood Inventory**: Real-time tracking of available blood units
- **Blood Requests**: Hospital requests for blood with priority levels
- **Donations**: Donor contribution tracking and history

### Key Features
- Role-based access control (admin, donor, hospital)
- Blood type compatibility checking
- Inventory expiry date tracking
- Request priority management
- Real-time status updates

## Getting Started

### Prerequisites
- Node.js 20+
- Docker and Docker Compose
- PostgreSQL (or use the containerized version)

### Environment Setup

Create a `.env` file in the backend directory:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=blood_bank
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
```

### Running with Docker (Recommended)

```bash
# Navigate to backend directory
cd backend

# Build and start the entire application
docker-compose up --build

# Access the application at:
# - Backend API: http://localhost:3000
# - API Documentation: http://localhost:3000/api
```

### Local Development

#### Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Start PostgreSQL (or use Docker)
docker run --name postgres-blood-bank -e POSTGRES_PASSWORD=password -e POSTGRES_DB=blood_bank -p 5432:5432 -d postgres:15-alpine

# Start the development server
npm run start:dev
```

#### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:3000" > .env.local

# Start the development server
npm run dev
```

## API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile

### Blood Inventory (Admin only)
- `GET /inventory` - Get all blood inventory
- `POST /inventory` - Add blood inventory
- `PUT /inventory/:id` - Update inventory
- `DELETE /inventory/:id` - Remove inventory

### Blood Requests (Hospital)
- `GET /requests` - Get requests (filtered by role)
- `POST /requests` - Create blood request
- `PUT /requests/:id` - Update request status
- `DELETE /requests/:id` - Cancel request

### Donations (Donor)
- `GET /donations` - Get donation history
- `POST /donations` - Schedule donation
- `PUT /donations/:id` - Update donation status

## User Roles

### Donor
- Register and manage profile
- Schedule blood donations
- View donation history
- Update personal information

### Hospital
- Request blood units for patients
- Specify priority levels and requirements
- Track request status
- Manage patient information

### Admin
- Manage blood inventory
- Approve/reject blood requests
- Oversee all system operations
- Generate reports and analytics

## Testing

```bash
# Backend tests
cd backend
npm run test        # Unit tests
npm run test:e2e    # End-to-end tests
npm run test:cov    # Test coverage

# Frontend tests
cd frontend
npm test
```

## Deployment

### AWS Deployment
1. **EC2 Setup**: Deploy application using PM2
2. **RDS Setup**: Configure PostgreSQL database
3. **Security**: Configure security groups and IAM roles
4. **Monitoring**: Set up CloudWatch for monitoring

### Docker Production
```bash
# Build production images
docker-compose -f docker-compose.prod.yml up --build

# Scale services
docker-compose up --scale api=3
```

## Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Input validation and sanitization
- SQL injection prevention with TypeORM
- CORS configuration
- Environment variable protection

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.