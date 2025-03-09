# User Management, Authentication, and Document Ingestion Service

This service provides user authentication, management, and document ingestion functionalities.

## Features
- **User Management**: Create, update, delete, and fetch user details (admin restricted actions included).
- **Authentication**: User registration, login, logout, and profile retrieval with JWT authentication.
- **Document**: Document CRUD operation done
- **Document Ingestion**: used mock service to do ingestion
- **Microservice Architecture**: Designed to communicate with other services using internal API calls.
- **Security**: Implements JWT-based authentication and CORS handling for  same domain communication.

## Tech Stack
- **Backend Framework**: NestJS (TypeScript)
- **Database**: Postgress (or any supported DB via TypeORM/Mongoose)
- **Authentication**: JWT-based authentication with cookies
- **Deployment**: Render
- **API Documentation**: Swagger

## Installation

### Prerequisites
- Node.js (>=16.x)
- MongoDB (local or cloud-based like MongoDB Atlas)

### Steps
1. Clone the repository:
   ```sh
   git clone https://github.com/udhai-20/user_management
   cd user_management
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Configure environment variables:
   - Create a `.env` file in the root directory
   - Add the following variables:
     ```env
     PORT=3000
     DATABASE_URL=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     JWT_EXPIRATION=time
     INGESTION_URL=interal service url
     COOKIE_SECRET=your_cookie_secret
     ```
4. Run the application:
   ```sh
   npm run start
   ```

## API Endpoints

### Authentication (`/auth`)
- **POST `/auth/register`** - Register a new user
- **POST `/auth/login`** - Login and receive an access token
- **POST `/auth/logout`** - Logout and clear the session cookie
- **GET `/auth/profile`** - Fetch user profile (Requires authentication)

### User Management (`/users`)
- **GET `/users/:id`** - Get user details by ID
- **GET `/users`** - Get all users (Admin only)
- **DELETE `/users/:id`** - Delete a user (Admin only)
- **PATCH `/users/:id/role`** - Update user role (Admin only)

### Document Ingestion (`/documents`)
- **POST `/documents`** - upload and after that it will call internally to ingestion_mock service Start document ingestion
actually i have used mock response once that ingestion service called immediately get response as processing afet 5000ms
based on the Math.random() > 0.2; os it will renturn 0 b/w 1 and 80% we will get as success result
- **GET `/documents/:id`** - get document by id (viewer,editor)
- **PATCH `/documents/:id`** - update document only by editor
- **GET `/documents`** - get All document (only by Admin)
- **DELETE `/documents/:id`** - delete  document by id(only by editor)
- **GET `/documents/reprocess/:id`** - process again the document if suppose that has been failed in first time-> refer first point it again to same process
- **GET `/documents/id`** - get document status by id


## CORS Configuration
This service allows cross-origin requests from specific domains to support microservices communication.

### Allowed Origins:
- `https://ingestion-mock.onrender.com`
- `http://localhost:3000`
- `http://localhost:3001`

### Handling Credentials
- Cookies are set with `SameSite=true; Secure` to allow olnly same domain authentication.
- API requests must include `credentials: true`.

## Deployment
This service is deployed on **Render** 
deployed Url:https://user-management-5e76.onrender.com/
for api doc swagger:https://user-management-5e76.onrender.com/api

### Running with Docker
```sh
docker build -t user-management-service .
docker run -p 3000:3000 user-management-service
```






