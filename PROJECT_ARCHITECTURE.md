# Artwork E-commerce Platform - Complete Technical Documentation

## Project Overview

The **Artwork E-commerce Platform** is a full-stack web application designed for buying and selling digital artwork. It features a modern React frontend with TypeScript and a robust Spring Boot backend with JWT-based authentication, role-based access control, and comprehensive artwork management capabilities.

## Architecture Overview

```
┌─────────────────┐    HTTP/HTTPS     ┌─────────────────┐
│   React Frontend │ ◄────────────────► │ Spring Boot API │
│   (Port 3000)    │    REST API       │   (Port 8080)   │
└─────────────────┘                   └─────────────────┘
                                              │
                                              ▼
                    ┌─────────────────┐    ┌─────────────────┐
                    │   MySQL DB      │    │   Redis Cache   │
                    │   (Port 3306)   │    │   (Port 6379)   │
                    └─────────────────┘    └─────────────────┘
```

## Frontend Architecture

### Technology Stack
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 7.0.6
- **Routing**: React Router DOM 7.7.1
- **State Management**: React Context API + useReducer
- **UI Framework**: Tailwind CSS 3.4.1
- **HTTP Client**: Axios 1.11.0
- **Form Management**: Formik 2.4.6 with Yup 1.6.1 validation
- **Notifications**: React Toastify 11.0.5
- **Icons**: Lucide React 0.344.0

### Project Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── artwork/           # Artwork-specific components
│   │   │   ├── ArtworkCard.tsx
│   │   │   └── ArtworkGrid.tsx
│   │   ├── common/            # Shared components
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── RoleBasedRedirect.tsx
│   │   └── debug/             # Development tools
│   │       ├── AuthDebugger.tsx
│   │       └── TokenDebugger.tsx
│   ├── context/
│   │   └── AppContext.tsx     # Global state management
│   ├── pages/
│   │   ├── auth/              # Authentication pages
│   │   │   ├── LoginPage.tsx
│   │   │   └── RegisterPage.tsx
│   │   ├── dashboard/         # Role-based dashboards
│   │   │   ├── admin/
│   │   │   ├── artist/
│   │   │   └── customer/
│   │   └── *.tsx              # Public pages
│   ├── services/              # API services
│   │   ├── api.ts             # Main API client
│   │   ├── adminAPI.ts
│   │   ├── artistAPI.ts
│   │   ├── artistsAPI.ts
│   │   ├── debugAPI.ts
│   │   └── tokenRefresh.ts
│   ├── types/
│   │   └── index.ts           # TypeScript type definitions
│   └── utils/                 # Utility functions
│       ├── authConsistencyChecker.ts
│       ├── authDebug.ts
│       ├── debugLocalStorage.ts
│       ├── debugToken.ts
│       └── tokenManager.ts
├── public/                    # Static assets and test files
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

### Key Features
1. **Authentication System**
   - JWT-based authentication with automatic refresh
   - Role-based access control (Customer, Artist, Admin)
   - Persistent login state with localStorage
   - Authentication consistency checking

2. **State Management**
   - Centralized state with React Context
   - useReducer for complex state logic
   - Persistent cart and wishlist in localStorage
   - Real-time token management

3. **Security Features**
   - Automatic token refresh
   - Protected routes with role validation
   - CSRF protection
   - XSS prevention measures

## Backend Architecture

### Technology Stack
- **Framework**: Spring Boot 3.2.5
- **Language**: Java 17
- **Database**: MySQL 8.0.33
- **Cache**: Redis (Spring Data Redis)
- **Security**: Spring Security with JWT
- **ORM**: JPA/Hibernate
- **Documentation**: Swagger/OpenAPI 3
- **Build Tool**: Maven 3.11.0
- **Email**: Spring Mail
- **Testing**: Spring Boot Test, Mockito 5.2.0

### Maven Dependencies
```xml
Key Dependencies:
- spring-boot-starter-web
- spring-boot-starter-data-jpa
- spring-boot-starter-security
- spring-boot-starter-validation
- spring-boot-starter-data-redis
- spring-boot-starter-mail
- jjwt (JWT library) 0.11.5
- mysql-connector-j 8.0.33
- modelmapper 3.2.0
- springdoc-openapi 2.3.0
- lombok 1.18.30
```

### Project Structure
```
backend/src/main/java/com/artwork/
├── config/                    # Configuration classes
│   ├── SecurityConfig.java    # Spring Security configuration
│   ├── SwaggerConfig.java     # API documentation
│   ├── WebConfig.java         # CORS and web configuration
│   ├── ModelMapperConfig.java
│   ├── PasswordEncoderConfig.java
│   └── StaticResourceConfig.java
├── controller/                # REST Controllers
│   ├── AuthController.java
│   ├── ArtworkController.java
│   ├── UserController.java
│   ├── OrderController.java
│   ├── CartController.java
│   ├── WishlistController.java
│   ├── ReviewController.java
│   ├── AdminController.java
│   ├── ArtistController.java
│   ├── DebugController.java
│   └── HealthCheckController.java
├── dto/                       # Data Transfer Objects
│   ├── AuthResponse.java
│   ├── LoginRequest.java
│   ├── RegisterRequest.java
│   ├── UserDto.java
│   ├── ArtworkDto.java
│   └── ...
├── entity/                    # JPA Entities
│   ├── User.java
│   ├── Artwork.java
│   ├── Order.java
│   ├── OrderItem.java
│   ├── CartItem.java
│   ├── WishlistItem.java
│   ├── Review.java
│   ├── Artist.java
│   └── enums/
├── repository/                # JPA Repositories
│   ├── UserRepository.java
│   ├── ArtworkRepository.java
│   ├── OrderRepository.java
│   └── ...
├── security/                  # Security components
│   ├── JwtAuthenticationFilter.java
│   ├── CustomUserDetailsService.java
│   └── JwtUtil.java
├── service/                   # Business logic services
│   ├── AuthService.java
│   ├── ArtworkService.java
│   ├── UserService.java
│   ├── OrderService.java
│   └── ...
└── util/                      # Utility classes
    └── FileUploadUtil.java
```

### Database Schema

#### Core Entities
1. **Users Table**
   - Primary Key: UUID
   - Fields: email (unique), password, firstName, lastName, role, status
   - Relationships: One-to-Many with Artworks, Orders, Reviews, Cart, Wishlist

2. **Artworks Table**
   - Primary Key: UUID
   - Fields: title, description, price, category, medium, dimensions
   - Relationships: Many-to-One with User (artist)

3. **Orders Table**
   - Primary Key: UUID
   - Fields: customerId, status, totalAmount, shippingAddress
   - Relationships: One-to-Many with OrderItems

4. **Supporting Tables**
   - CartItems, WishlistItems, Reviews, OrderItems

### Security Implementation

#### JWT Authentication
```java
Key Security Features:
- BCrypt password encoding
- JWT token generation with claims
- Refresh token mechanism
- Role-based access control
- CORS configuration for frontend integration
- Session stateless configuration
```

#### Role-Based Access Control
- **CUSTOMER**: Cart, wishlist, order management
- **ARTIST**: Artwork creation and management, order viewing
- **ADMIN**: User management, analytics, system administration

#### API Endpoints Security Matrix
```
Public Endpoints:
- POST /api/auth/login
- POST /api/auth/register
- GET /api/artworks (public browsing)
- GET /api/artists (public listing)

Authenticated Endpoints:
- GET /api/auth/verify
- GET /api/debug/** (troubleshooting)

Role-Specific Endpoints:
- /api/cart/** → CUSTOMER only
- /api/wishlist/** → CUSTOMER only
- /api/orders/** → CUSTOMER, ARTIST
- /api/dashboard/artist/** → ARTIST only
- /api/dashboard/admin/** → ADMIN only
- POST /api/artworks → ARTIST, ADMIN only
```

## Deployment Architecture

### Railway Deployment Configuration

#### Backend Deployment
```json
railway.json Configuration:
- Builder: NIXPACKS
- Build Command: mvn clean package -DskipTests
- Health Check: /health endpoint
- Environment: Railway managed MySQL and Redis
```

#### Environment Variables
```bash
Production (Railway):
- MYSQLHOST, MYSQLPORT, MYSQL_DATABASE
- MYSQLUSER, MYSQLPASSWORD
- REDISHOST, REDISPORT, REDISPASSWORD
- JWT_SECRET, JWT_EXPIRATION
- PORT (Railway managed)

Local Development:
- MySQL: localhost:3306/artworkdb
- Redis: localhost:6379
- Server: localhost:8081
```

#### File Structure for Deployment
```
backend/
├── Procfile                   # Railway process definition
├── railway.json               # Railway deployment config
├── system.properties          # Java version specification
├── railway-debug.sh           # Debug script
└── src/main/resources/
    ├── application.properties         # Local config
    ├── application-railway.properties # Production config
    └── application-local.properties   # Local development
```

### Frontend Deployment
```javascript
Vite Configuration:
- Development: localhost:3000
- Production build: npm run build
- Preview: npm run preview
- API Integration: Railway backend URL
```

## Security Features

### Authentication Flow
1. **User Registration/Login**
   - Password hashing with BCrypt
   - JWT token generation
   - Refresh token for session management

2. **Token Management**
   - Access token (1 hour expiry)
   - Refresh token (7 days expiry)
   - Automatic token refresh
   - Token validation on each request

3. **Authorization**
   - Role-based route protection
   - Method-level security annotations
   - API endpoint access control

### Data Protection
- **Input Validation**: Bean validation annotations
- **SQL Injection Prevention**: JPA/Hibernate parameterized queries
- **XSS Protection**: Content Security Policy headers
- **CORS**: Configured allowed origins

## API Documentation

### Authentication Endpoints
```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/verify
```

### Artwork Management
```http
GET    /api/artworks          # Public artwork listing
GET    /api/artworks/{id}     # Public artwork details
POST   /api/artworks          # Create artwork (Artist/Admin)
PUT    /api/artworks/{id}     # Update artwork
DELETE /api/artworks/{id}     # Delete artwork
GET    /api/artworks/artist/{artistId}  # Artist's artworks
```

### User Management
```http
GET    /api/users/profile     # User profile
PUT    /api/users/profile     # Update profile
GET    /api/artists           # Public artist listing
GET    /api/artists/{id}      # Artist details
```

### E-commerce Operations
```http
# Cart Management
POST   /api/cart/add          # Add to cart
GET    /api/cart              # Get cart items
PUT    /api/cart/{id}         # Update quantity
DELETE /api/cart/{id}         # Remove item
DELETE /api/cart/clear        # Clear cart

# Orders
POST   /api/orders            # Create order
GET    /api/orders            # Get user orders
GET    /api/orders/{id}       # Order details
PUT    /api/orders/{id}/status # Update order status

# Wishlist
POST   /api/wishlist/add      # Add to wishlist
GET    /api/wishlist          # Get wishlist
DELETE /api/wishlist/{id}     # Remove from wishlist
```

### Admin Operations
```http
GET    /api/admin/users       # User management
PUT    /api/admin/users/{id}/status  # Update user status
GET    /api/admin/analytics   # System analytics
```

## Development Setup

### Prerequisites
- Java 17+
- Node.js 18+
- MySQL 8.0
- Redis 6.0+
- Maven 3.6+

### Backend Setup
```bash
# Clone repository
git clone <repository-url>
cd backend

# Configure database
mysql -u root -p
CREATE DATABASE artworkdb;

# Configure Redis
redis-server

# Run application
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Environment Configuration
```properties
# Backend (application-local.properties)
spring.datasource.url=jdbc:mysql://localhost:3306/artworkdb
spring.datasource.username=root
spring.datasource.password=your_password
spring.redis.host=localhost
spring.redis.port=6379
jwt.secret=your_jwt_secret
```

## Monitoring and Health Checks

### Health Endpoints
```http
GET /health              # Application health
GET /api/health          # API health check
GET /actuator/health     # Detailed health info
```

### Logging Configuration
```properties
# Development
logging.level.org.springframework.web=DEBUG
logging.level.org.springframework.security=DEBUG
logging.level.com.artwork=DEBUG

# Production
logging.level.root=INFO
logging.level.com.artwork=INFO
```

## Performance Considerations

### Backend Optimizations
- **Database**: Connection pooling with HikariCP
- **Caching**: Redis for session management
- **File Uploads**: Configurable size limits (5MB per file, 20MB per request)
- **Database Queries**: JPA query optimization

### Frontend Optimizations
- **Code Splitting**: Lazy loading for dashboard components
- **State Management**: Efficient re-renders with useReducer
- **API Calls**: Request/response interceptors for error handling
- **Caching**: localStorage for user data and tokens

## Testing Strategy

### Backend Testing
- Unit tests with JUnit and Mockito
- Integration tests for API endpoints
- Security testing for authentication flows

### Frontend Testing
- Component testing (can be added with React Testing Library)
- End-to-end testing setup ready
- Authentication flow testing tools included

## Future Enhancements

### Planned Features
1. **Payment Integration**: Stripe/PayPal integration
2. **Advanced Search**: Elasticsearch integration
3. **Real-time Features**: WebSocket for notifications
4. **Mobile App**: React Native implementation
5. **Analytics**: Enhanced reporting dashboard
6. **Social Features**: Artist following, artwork sharing

### Technical Improvements
1. **Microservices**: Service decomposition
2. **CDN Integration**: Static asset optimization
3. **Load Balancing**: Horizontal scaling
4. **Database Sharding**: Performance optimization
5. **CI/CD Pipeline**: Automated deployment

## Troubleshooting Guide

### Common Issues
1. **Authentication Problems**: Check JWT token expiry and refresh mechanism
2. **Database Connection**: Verify MySQL service and credentials
3. **Redis Connection**: Ensure Redis server is running
4. **CORS Issues**: Verify allowed origins in SecurityConfig
5. **File Upload Issues**: Check upload directory permissions

### Debug Tools
- Frontend: AuthDebugger component for token inspection
- Backend: Debug endpoints for authentication troubleshooting
- Logging: Comprehensive logging for request/response tracking

---

## Contact Information

**Project**: Artwork E-commerce Platform  
**Repository**: RajMandal17/productionArtGallery  
**Backend URL**: https://backend-dev-ce5d.up.railway.app  
**Frontend URL**: https://artworkgallery-dev.up.railway.app  

**Developer**: Raj Mandal  
**Email**: rajmandal147@gmail.com  

---

*Last Updated: August 12, 2025*
