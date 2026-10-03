# Library Management Backend

This is a Spring Boot REST API for managing the library catalogue.

## Features

- Add, retrieve, update, and delete a book
- Track physical copy totals and current availability
- Store book cover references and optional digital reading text

## Book Entity

- id: Long (auto-generated)
- title: String
- author: String
- category: String
- type: `physical` or `virtual`
- image: cover URL or uploaded image data
- total: total physical copies
- available: physical copies currently available
- content: optional digital reading text

## API Endpoints

- GET /api/books - Get all books
- GET /api/books/{id} - Get one book
- POST /api/books - Add a new book (JSON body)
- PUT /api/books/{id} - Update a book (JSON body)
- DELETE /api/books/{id} - Delete a book by ID

## Running the Application

1. Ensure you have Java 17 and Maven installed.
2. Navigate to the backend directory.
3. Run `mvn spring-boot:run`

The application will start on port 8080.

## Database

Uses an H2 in-memory database, so catalogue data is reset when the backend restarts. H2 console is available at http://localhost:8080/h2-console.
