# PostgreSQL Integration for SwaedUAE Platform

This document provides comprehensive instructions for setting up and using PostgreSQL with the SwaedUAE platform.

## 🚀 Quick Start

### 1. Install PostgreSQL

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Windows:**
Download and install from [PostgreSQL official website](https://www.postgresql.org/download/windows/)

### 2. Create Database and User

```bash
# Connect to PostgreSQL as superuser
sudo -u postgres psql

# Create database
CREATE DATABASE swaeduae_db;

# Create user with password
CREATE USER swaeduae_user WITH PASSWORD 'your_secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE swaeduae_db TO swaeduae_user;

# Exit PostgreSQL
\q
```

### 3. Configure Environment Variables

Update your `.env.local` file with PostgreSQL credentials:

```env
# PostgreSQL Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=swaeduae_user
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=swaeduae_db

# Connection Pool Settings
DB_POOL_MIN=2
DB_POOL_MAX=10

# Database URL (alternative format)
DATABASE_URL=postgresql://swaeduae_user:your_secure_password@localhost:5432/swaeduae_db
```

### 4. Initialize Database Schema

Run the initialization script to create tables and insert sample data:

```bash
node scripts/init-postgres.js
```

### 5. Start the Application

```bash
pnpm dev
```

Your application will now use PostgreSQL instead of the mock database!

## 📊 Database Schema

### Core Tables

#### `profiles`
- User profiles with authentication and personal information
- Supports volunteers, students, organizations, and admins
- Includes verification status and preferences

#### `organizations`
- Registered organizations that can create events
- Includes verification workflow and contact information
- Supports multiple languages (English/Arabic)

#### `events`
- Volunteer opportunities and educational events
- Flexible scheduling with recurring event support
- Location-aware with emirate/city categorization

#### `event_registrations`
- Tracks user registrations for events
- Includes attendance status and notes
- Prevents duplicate registrations

#### `certificates`
- Digital certificates for completed volunteer hours
- Links to events and profiles
- Tracks completion hours and certificate URLs

## 🔧 Development Features

### Database Client (`lib/database.ts`)

The database client provides:
- **Server-side only execution**: PostgreSQL queries only run on the server
- **Client-side fallback**: Mock data for client-side rendering
- **Connection pooling**: Efficient database connections
- **Type safety**: Full TypeScript support

### Database Client (`lib/database.ts`)

Provides PostgreSQL database connectivity and query methods:
- Direct PostgreSQL connection using `pg` driver
- Query builder methods for common operations
- Helper functions for specific entities
- Real PostgreSQL queries under the hood

### Helper Functions

Pre-built helpers for common operations:
```typescript
import { dbHelpers } from '@/lib/database'

// Get user profile
const profile = await dbHelpers.getProfile(userId)

// Get upcoming events
const events = await dbHelpers.getEvents({ status: 'published' })

// Create new organization
const org = await dbHelpers.createOrganization(orgData)
```

## 🧪 Testing

### Test Database Connection

```bash
node scripts/test-db-integration.js
```

### Sample Queries

The platform includes sample data for testing:
- 3 organizations (UAE Red Crescent, Dubai Cares, Sharjah Volunteer Centre)
- 3 user profiles (admin, volunteer, student)
- 4 sample events across different categories
- Sample registrations and relationships

## 🔒 Security Best Practices

### Environment Variables
- Never commit `.env.local` to version control
- Use strong passwords for database users
- Restrict database user permissions to minimum required

### Connection Security
- Use SSL connections in production
- Implement connection timeouts
- Monitor connection pool usage

### Data Validation
- All inputs are parameterized to prevent SQL injection
- Type checking with TypeScript
- Validation at application layer

## 🚀 Production Deployment

### Database Configuration

For production, consider:
- **Managed PostgreSQL**: AWS RDS, Google Cloud SQL, or Azure Database
- **Connection pooling**: PgBouncer for high-traffic applications
- **Read replicas**: For read-heavy workloads
- **Backup strategy**: Automated daily backups

### Environment Variables

```env
# Production PostgreSQL
POSTGRES_HOST=your-production-host.amazonaws.com
POSTGRES_PORT=5432
POSTGRES_USER=swaeduae_prod
POSTGRES_PASSWORD=very_secure_production_password
POSTGRES_DB=swaeduae_production
DATABASE_URL=postgresql://swaeduae_prod:password@host:5432/swaeduae_production

# SSL Configuration
POSTGRES_SSL=true
POSTGRES_SSL_REJECT_UNAUTHORIZED=true

# Connection Pool (adjust based on your needs)
DB_POOL_MIN=5
DB_POOL_MAX=20
```

### Performance Optimization

1. **Indexes**: The schema includes optimized indexes for common queries
2. **Connection pooling**: Configured for efficient resource usage
3. **Query optimization**: Use EXPLAIN ANALYZE for slow queries
4. **Monitoring**: Set up database monitoring and alerting

## 🛠️ Troubleshooting

### Common Issues

**Connection Refused**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
- Ensure PostgreSQL is running: `sudo systemctl status postgresql`
- Check if PostgreSQL is listening: `sudo netstat -plunt | grep 5432`

**Authentication Failed**
```
Error: password authentication failed for user "swaeduae_user"
```
- Verify credentials in `.env.local`
- Check PostgreSQL user exists: `sudo -u postgres psql -c "\du"`

**Database Does Not Exist**
```
Error: database "swaeduae_db" does not exist
```
- Create database: `sudo -u postgres createdb swaeduae_db`
- Or run: `sudo -u postgres psql -c "CREATE DATABASE swaeduae_db;"`

**Module Not Found (Client-side)**
```
Module not found: Can't resolve 'fs'
```
- This is expected - PostgreSQL only runs server-side
- Client-side components use mock data automatically

### Debug Mode

Enable detailed logging by setting:
```env
DEBUG=true
NODE_ENV=development
```

## 📚 Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Node.js pg Driver](https://node-postgres.com/)
- [Next.js Database Integration](https://nextjs.org/docs/basic-features/data-fetching)
- [TypeScript with PostgreSQL](https://www.typescriptlang.org/docs/)

## 🤝 Contributing

When contributing to the database layer:
1. Update schema in `scripts/init-postgres.js`
2. Add corresponding TypeScript types in `lib/database.ts`
3. Update helper functions as needed
4. Test with both development and production configurations
5. Update this documentation

---

**Need Help?** Check the troubleshooting section or create an issue in the project repository.