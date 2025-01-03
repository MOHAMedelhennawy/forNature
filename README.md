# Furniture Website Project

## Project Overview
This project is a furniture e-commerce website that enables users to browse, search, and purchase furniture. It includes features such as user authentication, product categorization, cart management, and wishlist functionality. The project is built using Node.js, Express.js, Prisma ORM, and a PostgreSQL database.

---

## Features
- User authentication and authorization using JWT.
- Integration with Google for third-party login.
- Product management with categories and subcategories.
- Cart and wishlist functionality.
- API design following RESTful standards.

---

## Installation and Setup
Follow these steps to set up and run the project locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/MOHAMedelhennawy/forNature.git
   cd furniture-website
   ```

2. Create an `.env` file with the following content:
   ```bash
   ./install.sh
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
├── controllers/     # Route handlers
├── models/          # Prisma schema and database models
├── routes/          # API routes
├── utils/           # Utility functions (e.g., fake data generation)
├── views/           # EJS templates for frontend rendering
├── public/          # Static assets (CSS, JS, images)
├── .env             # Environment variables
├── docker-compose.yml # Docker configuration
└── server.js        # Application entry point
```

---

## Prerequisites
- Node.js v14 or higher
- Docker
- PostgreSQL

---

## License
This project is licensed under the MIT License.

---

## Acknowledgements
Special thanks to everyone who contributed to the development of this project.
