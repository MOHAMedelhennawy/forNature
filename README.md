# Furniture Website Project
This project is a furniture e-commerce website that enables users to browse, search, and purchase furniture. It includes features such as user authentication, product categorization, cart management, and wishlist functionality. The project is built using Node.js, Express.js, Prisma ORM, and a PostgreSQL database.

[[<!-- Uploading "07.01.2025_18.14.10_REC.mp4"... -->](https://github.com/user-attachments/assets/9182251c-ef96-42bd-886f-2f0573c3a416)](https://github.com/user-attachments/assets/22f56c35-786d-4ba8-9327-cf106669d15b)

---

## Features
- User authentication and authorization using JWT.
- Integration with Google for third-party login.
- Product management with categories and subcategories.
- Admin dashboard to view orders.
- Cart and wishlist functionality.
- API design following RESTful standards.

---

## Installation and Setup
Follow these steps to set up and run the project locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/MOHAMedelhennawy/forNature.git
   cd forNature
   ```

2. Create an `.env` file with the following example:
   ```
   PORT=8000

   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=elhennawy
   DB_PASSWORD=0000
   DB_NAME=furNature

   DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}

   JWT_SECRET=<uuid4>

   GOOGLE_CLIENT_ID=<CLIENT_ID>
   GOOGLE_CLIENT_SECRET=<CLIENT_SECRET>
   ```

3. Install the required packages:
   ```bash
   npm install
   ```

4. Install and run the Docker image:
   ```bash
   docker-compose up
   ```

5. Set up the database:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init --create-only
   npx prisma migrate deploy
   ```

6. Populate the database with fake data:
   ```bash
   node utils/fakeProductsData.js
   ```

7. Start the application:
   ```bash
   npm start
   ```

---

## Project Structure
```
├── config/            # Configuration files
├── controller/        # Application logic for routes
├── middleware/        # Express middleware functions
├── prisma/            # Prisma schema and migrations
├── public/            # Static assets (CSS, JS, images)
├── routes/            # API route definitions
├── services/          # Service layer for business logic
├── test/              # Testing files
├── utils/             # Utility functions (e.g., fake data generation)
├── validators/        # Validation logic for inputs
├── views/             # EJS templates for frontend rendering
├── docker-compose.yml # Docker configuration
├── jest.config.mjs    # Jest configuration for testing
├── package.json       # Node.js dependencies and scripts
├── server.js          # Application entry point
└── tsconfig.json      # TypeScript configuration
```

---

## Prerequisites
- Node.js v14 or higher
- Docker
- PostgreSQL

---

## License
This project is licensed under the MIT License.
