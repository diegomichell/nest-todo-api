# Tasky - Task Management API

A production-ready NestJS REST API for task management with user authentication, built with TypeScript, PostgreSQL, and deployable to AWS ECS using CDK.

## Features

- JWT-based authentication (register, login, profile)
- CRUD operations for tasks
- User-task relationship (each task belongs to a user)
- PostgreSQL database with TypeORM
- Docker containerization
- AWS ECS deployment with CDK
- GitHub Actions CI/CD pipeline
- Comprehensive unit tests
- Database seeding
- PgAdmin for database management

## Tech Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Authentication**: JWT (Passport)
- **Validation**: class-validator, class-transformer
- **Containerization**: Docker, Docker Compose
- **Infrastructure as Code**: AWS CDK
- **CI/CD**: GitHub Actions
- **Testing**: Jest

## Project Structure

```
.
├── src/
│   ├── auth/                 # Authentication module
│   │   ├── dto/             # Data transfer objects
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── jwt.strategy.ts
│   │   └── jwt-auth.guard.ts
│   ├── tasks/               # Tasks module
│   │   ├── dto/
│   │   ├── tasks.controller.ts
│   │   ├── tasks.service.ts
│   │   └── tasks.module.ts
│   ├── entities/            # Database entities
│   │   ├── user.entity.ts
│   │   └── task.entity.ts
│   ├── database/            # Database utilities
│   │   └── seed.ts
│   ├── app.module.ts
│   └── main.ts
├── cdk/                     # AWS CDK infrastructure
│   ├── bin/
│   │   └── cdk.ts
│   └── lib/
│       └── tasky-stack.ts
├── test/                    # E2E tests
├── docker-compose.yml
├── Dockerfile
└── README.md
```

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/profile` - Get user profile (protected)

### Tasks (All protected routes)

- `GET /api/v1/todos` - Get all tasks for authenticated user
- `POST /api/v1/todos` - Create a new task
- `GET /api/v1/todos/:id` - Get a specific task
- `PUT /api/v1/todos/:id` - Update a task
- `DELETE /api/v1/todos/:id` - Delete a task

## Getting Started

### Prerequisites

- Node.js 20+
- Docker and Docker Compose
- npm or yarn

### Local Development

1. **Clone the repository**

```bash
git clone <repository-url>
cd Tasky
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Update the values as needed.

4. **Start services with Docker Compose**

```bash
docker-compose up -d postgres pgadmin
```

This starts:
- PostgreSQL on port 5432
- PgAdmin on port 5050 (http://localhost:5050)

5. **Run database migrations (auto with synchronize in dev)**

The database schema is automatically synced in development mode.

6. **Seed the database (optional)**

```bash
npm run seed
```

This creates:
- 2 test users (john.doe@example.com, jane.smith@example.com)
- 7 sample tasks
- Default password: `password123`

7. **Start the development server**

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000/api/v1`

### Using Docker Compose for Full Stack

To run the entire stack (app, database, pgadmin):

```bash
docker-compose up --build
```

## Testing

### Run unit tests

```bash
npm test
```

### Run unit tests with coverage

```bash
npm run test:cov
```

### Run e2e tests

```bash
npm run test:e2e
```

### Run linter

```bash
npm run lint
```

## Database Management

Access PgAdmin at `http://localhost:5050`:

- Email: `admin@tasky.com`
- Password: `admin`

Add a new server connection:
- Host: `postgres`
- Port: `5432`
- Username: `postgres`
- Password: `postgres`
- Database: `tasky`

## AWS Deployment

### Prerequisites

- AWS Account
- AWS CLI configured
- AWS CDK CLI installed (`npm install -g aws-cdk`)

### Setup

1. **Configure AWS credentials**

```bash
aws configure
```

2. **Bootstrap CDK (first time only)**

```bash
cd cdk
npm run bootstrap
```

3. **Deploy the infrastructure**

```bash
npm run deploy
```

This creates:
- VPC with public, private, and isolated subnets
- ECR repository for Docker images
- ECS Fargate cluster and service
- RDS PostgreSQL database
- Application Load Balancer
- Auto-scaling configuration
- Secrets Manager for database and JWT credentials

4. **Push Docker image to ECR**

```bash
# Get ECR login
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build and tag image
docker build -t tasky-api .
docker tag tasky-api:latest <ecr-repository-uri>:latest

# Push to ECR
docker push <ecr-repository-uri>:latest
```

5. **Update ECS service**

The GitHub Actions pipeline handles this automatically on push to main.

## CI/CD Pipeline

### GitHub Actions Workflows

1. **Test Workflow** (`.github/workflows/test.yml`)
   - Runs on pull requests and non-main branches
   - Executes linting, unit tests, and e2e tests
   - Uploads coverage reports

2. **Deploy Workflow** (`.github/workflows/deploy.yml`)
   - Runs on push to main branch
   - Builds and tests the application
   - Builds Docker image and pushes to ECR
   - Updates ECS service with new image

### Setup Required Secrets

Add these secrets to your GitHub repository:

- `AWS_ROLE_ARN`: ARN of the IAM role for GitHub Actions

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `5432` |
| `DB_USERNAME` | Database username | `postgres` |
| `DB_PASSWORD` | Database password | `postgres` |
| `DB_DATABASE` | Database name | `tasky` |
| `JWT_SECRET` | JWT secret key | - |
| `JWT_EXPIRATION` | JWT token expiration | `7d` |
| `PORT` | Application port | `3000` |
| `NODE_ENV` | Environment | `development` |

## API Usage Examples

### Register a new user

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Create a task

```bash
curl -X POST http://localhost:3000/api/v1/todos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "title": "Complete project",
    "description": "Finish the API implementation",
    "status": "TODO",
    "dueDate": "2025-12-31T23:59:59Z"
  }'
```

### Get all tasks

```bash
curl -X GET http://localhost:3000/api/v1/todos \
  -H "Authorization: Bearer <your-jwt-token>"
```

### Update a task

```bash
curl -X PUT http://localhost:3000/api/v1/todos/<task-id> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "status": "DONE"
  }'
```

### Delete a task

```bash
curl -X DELETE http://localhost:3000/api/v1/todos/<task-id> \
  -H "Authorization: Bearer <your-jwt-token>"
```

## Task Statuses

- `TODO` - Task is pending
- `IN_PROGRESS` - Task is being worked on
- `DONE` - Task is completed

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation with class-validator
- SQL injection protection with TypeORM
- CORS enabled
- Request data transformation and sanitization

## AWS Architecture

```
Internet
    |
    v
Application Load Balancer (Public Subnets)
    |
    v
ECS Fargate Tasks (Private Subnets)
    |
    v
RDS PostgreSQL (Isolated Subnets)
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the UNLICENSED License.

## Support

For support, please open an issue in the repository.
