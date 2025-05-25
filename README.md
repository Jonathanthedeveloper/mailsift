# Mail Sift

A backend service providing authentication, email validation, and API key management for Mail Sift.

## Api Documentation

You can find our detailed API documentation [here](https://documenter.getpostman.com/view/23284775/2sB2qcC11J). We've created comprehensive guides to help you integrate with our services easily.

## Features

- **Authentication System**
  - User registration and login
  - JWT-based authentication with refresh tokens
  - Password reset functionality

- **Email Validation**
  - Check if emails are disposable/temporary

- **API Key Management**
  - Generate API keys for external service integration
  - Revoke existing keys
  - Track API usage through detailed logs (PENDING)

- **User Management**
  - User CRUD operations
  - Soft-delete functionality

## Setup and Installation

### Prerequisites

- Node.js 16.x or later
- NPM or Yarn
- SQLite (default database) or PostgreSQL

### Installation Steps

1. Clone the repository

   ```bash
   https://github.com/Jonathanthedeveloper/mailsift
   cd mailsift
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Set up environment variables

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration

4. Generate Prisma client

   ```bash
   npm run prisma:generate
   ```

5. Run database migrations

   ```bash
   npm run migrate:dev
   ```

6. Start the development server

   ```bash
   npm run start:dev
   ```

The API will be available at [http://localhost:8000/api/v1/](http://localhost:8000/api/v1/)
