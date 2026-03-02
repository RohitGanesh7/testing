# 🚀 Production-Ready FastAPI Application

A complete, production-ready FastAPI application following industry best practices with async support, Redis caching, PostgreSQL database, background task processing with Celery, JWT authentication, and rate limiting.

## 📋 Features

- ✅ **Async FastAPI** with full async/await support
- ✅ **PostgreSQL** with async SQLAlchemy
- ✅ **Redis** for caching and rate limiting
- ✅ **JWT Authentication** (stateless, horizontally scalable)
- ✅ **Celery** for background tasks (emails, notifications, reports)
- ✅ **Rate Limiting** via Redis
- ✅ **Database Migrations** with Alembic
- ✅ **Pydantic V2** for request/response validation
- ✅ **CORS** middleware configured
- ✅ **Health Check** endpoint
- ✅ **Proper Error Handling**
- ✅ **Clean Architecture** with separated concerns

## 🏗️ Architecture

```
Users → FastAPI (Async) → Redis (Cache/Rate Limit) → PostgreSQL (DB)
                      ↓
              Background Workers (Celery)
```

## 📁 Project Structure

```
fastapi_project/
├── app/
│   ├── __init__.py
│   ├── main.py                    # FastAPI app entry point
│   ├── worker.py                  # Celery worker configuration
│   ├── api/
│   │   ├── __init__.py
│   │   ├── router.py              # Main API router
│   │   ├── dependencies.py        # Auth dependencies
│   │   └── endpoints/
│   │       ├── __init__.py
│   │       ├── auth.py            # Login, register, refresh token
│   │       ├── users.py           # User management
│   │       ├── products.py        # Product CRUD with caching
│   │       ├── orders.py          # Order management
│   │       └── health.py          # Health check
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py              # Settings & configuration
│   │   ├── database.py            # Database connection
│   │   ├── redis.py               # Redis connection & cache utils
│   │   └── security.py            # JWT & password hashing
│   ├── middleware/
│   │   ├── __init__.py
│   │   └── rate_limit.py          # Rate limiting middleware
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py                # User model
│   │   ├── product.py             # Product model
│   │   └── order.py               # Order model
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── user.py                # User Pydantic schemas
│   │   ├── product.py             # Product Pydantic schemas
│   │   └── order.py               # Order Pydantic schemas
│   └── tasks/
│       ├── __init__.py
│       ├── email_tasks.py         # Email background tasks
│       └── order_tasks.py         # Order processing tasks
├── alembic/
│   ├── env.py                     # Alembic environment
│   ├── script.py.mako             # Migration template
│   └── versions/                  # Migration files
├── alembic.ini                    # Alembic configuration
├── docker-compose.yml             # PostgreSQL + Redis setup
├── requirements.txt               # Python dependencies
├── .env.example                   # Environment variables template
└── README.md                      # This file
```

## 🚀 Quick Start

### 1. Clone and Setup Environment

```bash
# Copy environment variables
cp .env.example .env

# Edit .env with your settings (especially SECRET_KEY)
nano .env
```

### 2. Start PostgreSQL and Redis (and optionally the entire stack)

You can start only the database/Redis using the existing compose file:

```bash
# from project root
docker-compose up -d postgres redis
```

If you'd prefer to run **backend and frontend** inside containers as well, we added services and Dockerfiles. The full stack can be brought up with a single command:

```bash
# start all services (postgres, redis, backend, frontend)
docker-compose up --build -d
```

The backend will be available on port 8000 and the frontend on port 3000.

Use `docker-compose logs -f <service>` to inspect output or `docker-compose down` to stop everything.

### 3. Install Dependencies

```bash
# Create virtual environment (use python3 if python isn't available)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies from requirements.txt
pip install -r requirements.txt
```

> **Important:** before running migrations or starting the app, make sure `DATABASE_URL` (and any other secrets) are defined in your environment or in a `.env` file. When using the compose stack the URL should point at the `postgres` service and reference the `fastapi_db` database.
> 
> Example `.env` entries:
> ```
> DATABASE_URL=postgresql+asyncpg://postgres:postgres@postgres:5432/fastapi_db
> REDIS_URL=redis://redis:6379/0
> SECRET_KEY=... 
> ```
> The database itself is created by the `postgres` container when `docker-compose up` runs; if you change the name be sure the database exists before running `alembic upgrade head`.

### 4. Run Database Migrations

```bash
# Create initial migration
alembic revision --autogenerate -m "Initial migration"

# Apply migrations
alembic upgrade head
```

### 5. Start the Application

```bash
# Start FastAPI server
python -m app.main

# Or with uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 6. Start Celery Worker (Optional - for background tasks)

```bash
# In a new terminal
celery -A app.worker.celery_app worker --loglevel=info

# Monitor with Flower (optional)
celery -A app.worker.celery_app flower
```

## 📝 API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health


## 🏠 Frontend

A simple React frontend is included in the `../frontend` directory. It uses Vite and communicates with the API via the `/api` proxy. Instructions for running it are in `frontend/README.md`.

## 🧪 Testing with Postman

### 1. Register a New User

```http
POST http://localhost:8000/api/v1/auth/register
Content-Type: application/json

{
    "email": "test@example.com",
    "username": "testuser",
    "password": "password123",
    "full_name": "Test User"
}
```

### 2. Login

```http
POST http://localhost:8000/api/v1/auth/login
Content-Type: application/json

{
    "username": "testuser",
    "password": "password123"
}
```

**Response:**
```json
{
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc...",
    "token_type": "bearer"
}
```

### 3. Get Current User (Authenticated)

```http
GET http://localhost:8000/api/v1/users/me
Authorization: Bearer <your_access_token>
```

### 4. Create a Product (Admin Only)

First, you need to create an admin user. You can do this by directly updating the database:

```sql
UPDATE users SET is_superuser = true WHERE username = 'testuser';
```

Then:

```http
POST http://localhost:8000/api/v1/products/
Authorization: Bearer <your_access_token>
Content-Type: application/json

{
    "name": "Laptop",
    "description": "High-performance laptop",
    "price": 1299.99,
    "stock_quantity": 50,
    "category": "Electronics"
}
```

### 5. Get All Products

```http
GET http://localhost:8000/api/v1/products/?page=1&page_size=10
```

### 6. Create an Order

```http
POST http://localhost:8000/api/v1/orders/
Authorization: Bearer <your_access_token>
Content-Type: application/json

{
    "product_id": 1,
    "quantity": 2
}
```

### 7. Get My Orders

```http
GET http://localhost:8000/api/v1/orders/?page=1&page_size=10
Authorization: Bearer <your_access_token>
```

## 🔧 Configuration

Key settings in `.env`:

```env
# Database
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/fastapi_db

# Redis
REDIS_URL=redis://localhost:6379/0

# JWT
SECRET_KEY=your-super-secret-key-change-this-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_PERIOD=60

# Celery
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2
```

## 🎯 Key Features Explained

### 1. **Async Everything**
- All database operations use async SQLAlchemy
- Redis operations are async
- FastAPI endpoints are async
- Handles thousands of concurrent connections

### 2. **Redis Caching**
- Product list/detail endpoints cached
- Automatic cache invalidation on updates
- Reduces database load significantly

### 3. **Rate Limiting**
- Redis-based rate limiting per IP/user
- Configurable limits (100 requests per minute by default)
- Automatic 429 responses when exceeded

### 4. **JWT Authentication**
- Stateless authentication (horizontally scalable)
- Access tokens (30 min) and refresh tokens (7 days)
- Secure password hashing with bcrypt

### 5. **Background Tasks**
- Welcome emails on user registration
- Order confirmation emails
- Heavy processing moved to background
- Celery workers can scale independently

### 6. **Database Migrations**
- Alembic for version control
- Easy rollback/upgrade
- Autogenerate from models

## 📊 Monitoring

### Health Check
```bash
curl http://localhost:8000/health
```

**Response:**
```json
{
    "status": "healthy",
    "database": "connected",
    "redis": "connected"
}
```

### Celery Monitoring (Flower)
```bash
# Start Flower
celery -A app.worker.celery_app flower

# Visit: http://localhost:5555
```

## 🔐 Security Best Practices

1. **Change SECRET_KEY** in production
2. **Use HTTPS** in production
3. **Set strong database passwords**
4. **Configure CORS** properly
5. **Enable rate limiting**
6. **Use environment variables** for secrets
7. **Regular security updates**

## 🚀 Production Deployment

### Environment Variables
- Set `DEBUG=False`
- Set `ENVIRONMENT=production`
- Use strong `SECRET_KEY`
- Configure proper CORS origins

### Running with Multiple Workers
```bash
# Use Gunicorn with Uvicorn workers
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Scaling Strategy
1. **Horizontal Scaling**: Add more FastAPI instances behind a load balancer
2. **Database**: Use PostgreSQL connection pooling
3. **Redis**: Use Redis Cluster for high availability
4. **Workers**: Scale Celery workers independently

## 📈 Performance Tips

1. **Redis caching** reduces database queries by ~80%
2. **Async operations** allow 1000+ concurrent connections per instance
3. **Background tasks** keep API responses fast
4. **Connection pooling** optimizes database performance
5. **Rate limiting** protects against abuse

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker-compose ps

# View logs
docker-compose logs postgres
```

### Redis Connection Issues
```bash
# Test Redis connection
redis-cli ping

# Should return: PONG
```

### Migration Issues
```bash
# Reset database (WARNING: deletes all data)
alembic downgrade base
alembic upgrade head
```

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Celery Documentation](https://docs.celeryq.dev/)
- [Redis Documentation](https://redis.io/documentation)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - Feel free to use this in your projects!

---

**Built with ❤️ using FastAPI, PostgreSQL, Redis, and Celery**