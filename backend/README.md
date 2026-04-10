# Library Management Backend

This is a Spring Boot REST API for managing books.

## Features

- Add a book
- Get all books
- Delete a book

## Book Entity

- id: Long (auto-generated)
- title: String
- author: String
- category: String
- available: boolean

## API Endpoints

- GET /api/books - Get all books
- POST /api/books - Add a new book (JSON body)
- DELETE /api/books/{id} - Delete a book by ID

## Running the Application

1. Ensure you have Java 17 and Maven installed.
2. Navigate to the backend directory.
3. Run `mvn spring-boot:run`

The application will start on port 8080.

## Database

Uses H2 in-memory database. H2 console available at http://localhost:8080/h2-console