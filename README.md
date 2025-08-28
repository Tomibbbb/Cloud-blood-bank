# Blood Bank Management System

A comprehensive digital solution for managing blood donation and distribution across healthcare networks. This system facilitates the coordination between blood donors, hospitals, and NHS blood coordinators to ensure efficient blood supply management.

## Overview

The Blood Bank Management System (BBMS) is designed to modernize and streamline blood donation processes. It provides real-time inventory tracking, donor management, and request fulfillment capabilities across multiple healthcare facilities.

## Key Features

### For Donors
- **Profile Management**: Complete donor registration with medical history tracking
- **Donation Scheduling**: Easy appointment booking with preferred locations
- **Request System**: Blood request capabilities for donors in medical need
- **History Tracking**: Comprehensive donation history and eligibility status
- **Priority Benefits**: Enhanced access to blood supplies for active donors

### For Hospitals
- **Inventory Management**: Real-time blood stock monitoring and alerts
- **Request Processing**: Streamlined blood request submission and tracking
- **Donor Coordination**: Direct communication with available donors
- **Analytics Dashboard**: Comprehensive reporting and trend analysis
- **Supply Optimization**: Automated inventory level recommendations

### For NHS Coordinators
- **Network Overview**: System-wide visibility of blood supply and demand
- **Resource Allocation**: Intelligent routing of donations to hospitals
- **Quality Assurance**: Comprehensive audit trails and compliance monitoring
- **Emergency Response**: Rapid coordination during critical shortage events
- **Performance Analytics**: Network-wide performance metrics and insights

## Technology Stack

### Backend
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT-based security with role-based access control
- **API**: RESTful endpoints with comprehensive validation
- **Testing**: Jest with unit, integration, and reliability testing

### Frontend
- **Framework**: Next.js 15 with React 19
- **UI Library**: Material-UI (MUI) for consistent design
- **Styling**: Tailwind CSS for responsive layouts
- **State Management**: React Context API
- **Build Tool**: Turbopack for fast development

### Infrastructure
- **Database**: AWS RDS PostgreSQL
- **Containerization**: Docker support
- **Development**: Hot reload with comprehensive error handling

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MyAssesment
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

4. **Environment Configuration**
   
   Create `.env` files in both backend and frontend directories:
   
   **Backend (.env)**:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/blood_bank
   JWT_SECRET=your-secure-jwt-secret
   DEFAULT_SEED_PASSWORD=secure-default-password
   PORT=3000
   ```
   
   **Frontend (.env.local)**:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   ```

5. **Database Setup**
   ```bash
   cd backend
   npm run seed
   ```

### Running the Application

**Development Mode**:
```bash
# Backend (Terminal 1)
cd backend
npm run start:dev

# Frontend (Terminal 2)
cd frontend
npm run dev
```

**Production Mode**:
```bash
# Backend
cd backend
npm run build
npm run start:prod

# Frontend
cd frontend
npm run build
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3000/api
- API Documentation: http://localhost:3000/api-docs

## User Roles & Access

### Donor Access
- Registration and profile management
- Donation appointment scheduling
- Blood request submission (for eligible donors)
- Personal donation history

### Hospital Access
- Blood inventory management
- Patient blood request processing
- Donor appointment coordination
- Hospital-specific analytics

### NHS Coordinator Access
- Network-wide system administration
- Cross-hospital resource allocation
- System analytics and reporting
- Policy enforcement and compliance

## API Documentation

The system provides comprehensive RESTful APIs:

### Authentication Endpoints
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User authentication
- `GET /api/auth/profile` - User profile retrieval

### Donor Management
- `GET /api/donors` - List donors (admin only)
- `POST /api/donors` - Create donor profile
- `PUT /api/donors/:id` - Update donor profile
- `GET /api/donors/stats` - Donor statistics

### Inventory Management
- `GET /api/inventory` - Blood inventory overview
- `POST /api/inventory` - Add inventory record
- `PATCH /api/inventory/stock` - Update stock levels
- `GET /api/inventory/summary` - Inventory summary

### Request Processing
- `POST /api/requests` - Submit blood request
- `GET /api/requests` - List blood requests
- `PATCH /api/requests/:id/status` - Update request status

## Testing

The system includes comprehensive testing suites:

```bash
# Backend Tests
cd backend

# Unit tests
npm run test

# Integration tests
npm run api:test:integration

# Coverage report
npm run test:cov

# All tests
npm run api:test:all
```

## Database Schema

The system uses a relational database structure with the following key entities:

- **Users**: Core user authentication and role management
- **Donors**: Extended donor profiles with medical information
- **BloodInventory**: System-wide blood stock tracking
- **HospitalStock**: Hospital-specific inventory management
- **BloodRequests**: Blood request tracking and fulfillment
- **DonationOffers**: Donor offer management and routing

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Granular permission system
- **Data Validation**: Comprehensive input validation and sanitization
- **Password Security**: Bcrypt hashing with salt rounds
- **Environment Protection**: Secure environment variable management
- **API Rate Limiting**: Protection against abuse

## Deployment

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build
```

### Manual Deployment
1. Configure production environment variables
2. Build both frontend and backend
3. Set up PostgreSQL database
4. Deploy to your hosting platform

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes with appropriate tests
4. Submit a pull request with detailed description

## License

This project is proprietary software developed for NHS blood management operations.

## Support

For technical support or feature requests, please contact the development team through the appropriate NHS channels.

---

*This system is designed to save lives through efficient blood supply management. Every feature contributes to ensuring blood is available when and where it's needed most.*