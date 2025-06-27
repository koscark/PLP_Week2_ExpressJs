# PLP Express API

This is a RESTful API built with Express.js for managing a product catalog. It supports CRUD operations, middleware for logging, authentication, and validation, error handling with custom error classes, and advanced features like filtering, pagination, search, and statistics.

## Setup

1. **Clone the Repository**:

   git clone cd plp_express_api

2. **Install Dependencies**:

   npm install

3. **Set Up Environment Variables**:
   Create a `.env` file in the project root with:

   PORT=3000 API_KEY=my-secret-api-key

4. **Run the Server**:

   node server.js
   The server will run on `http://localhost:3000`.

## Environment Variables

Create a `.env` file in the project root with:

PORT=3000API_KEY=my-secret-api-key

## API Endpoints

- `GET /`: Returns "Hello World".
- `GET /api/products`: Returns a paginated list of products, optionally filtered by category.
- `GET /api/products/:id`: Returns a specific product by ID.
- `POST /api/products`: Creates a new product.
- `PUT /api/products/:id`: Updates an existing product.
- `DELETE /api/products/:id`: Deletes a product.
- `GET /api/products/search`: Searches products by name.
- `GET /api/products/stats`: Returns product counts by category.

## Middleware

- **Logger**: Logs request method, URL, and timestamp for all requests.
- **JSON Parser**: Parses JSON request bodies using `body-parser`.
- **Authentication**: Requires an `x-api-key` header with value `my-secret-api-key` for all `/api/` routes.
- **Validation**: Validates product data for `POST /api/products` and `PUT /api/products/:id` routes.

## Error Handling

- **Global Error Handler**: Catches all errors and returns JSON responses with `error` (error type) and `message`.
- **Custom Error Classes**:
  - `NotFoundError` (404): For resources not found (e.g., invalid product ID).
  - `ValidationError` (400): For invalid input in `POST /api/products`, `PUT /api/products/:id`, or query parameters.
  - Generic `Error` (401): For authentication failures.
  - Unhandled errors return 500 with `ServerError`.
- All routes are wrapped with an async handler to catch asynchronous errors.

## Example Requests and Responses

All `/api/` routes require the header `-H "x-api-key: my-secret-api-key"`.

- **GET /**:

  - Request: `curl http://localhost:3000`
  - Response: `Hello World`

- **GET /api/products (with filtering and pagination)**:

  - Request: `curl -H "x-api-key: my-secret-api-key" "http://localhost:3000/api/products?category=electronics&page=1&limit=1"`
  - Response:
    ```json
    {
      "page": 1,
      "limit": 1,
      "total": 2,
      "products": [
        {
          "id": "1",
          "name": "Laptop",
          "description": "High-performance laptop with 16GB RAM",
          "price": 1200,
          "category": "electronics",
          "inStock": true
        }
      ]
    }
    ```
  - Response (invalid pagination):
    ```json
    {
      "error": "ValidationError",
      "message": "Page and limit must be positive integers"
    }
    ```

- **GET /api/products/:id**:

  - Request: `curl -H "x-api-key: my-secret-api-key" http://localhost:3000/api/products/1`
  - Response:
    ```json
    {
      "id": "1",
      "name": "Laptop",
      "description": "High-performance laptop with 16GB RAM",
      "price": 1200,
      "category": "electronics",
      "inStock": true
    }
    ```
  - Response (not found):
    ```json
    {
      "error": "NotFoundError",
      "message": "Product not found"
    }
    ```

- **POST /api/products**:

  - Request: `curl -X POST -H "Content-Type: application/json" -H "x-api-key: my-secret-api-key" -d "{\"name\":\"Toaster\",\"description\":\"Two-slice toaster\",\"price\":30,\"category\":\"kitchen\",\"inStock\":true}" http://localhost:3000/api/products`
  - Response:
    ```json
    {
      "id": "<uuid>",
      "name": "Toaster",
      "description": "Two-slice toaster",
      "price": 30,
      "category": "kitchen",
      "inStock": true
    }
    ```
  - Response (invalid input):
    ```json
    {
      "error": "ValidationError",
      "message": "All fields (name, description, price, category, inStock) are required and must be valid"
    }
    ```

- **PUT /api/products/:id**:

  - Request: `curl -X PUT -H "Content-Type: application/json" -H "x-api-key: my-secret-api-key" -d "{\"name\":\"Updated Laptop\",\"description\":\"Upgraded laptop\",\"price\":1500,\"category\":\"electronics\",\"inStock\":false}" http://localhost:3000/api/products/1`
  - Response:
    ```json
    {
      "id": "1",
      "name": "Updated Laptop",
      "description": "Upgraded laptop",
      "price": 1500,
      "category": "electronics",
      "inStock": false
    }
    ```
  - Response (not found):
    ```json
    {
      "error": "NotFoundError",
      "message": "Product not found"
    }
    ```

- **DELETE /api/products/:id**:

  - Request: `curl -X DELETE -H "x-api-key: my-secret-api-key" http://localhost:3000/api/products/1`
  - Response:
    ```json
    {
      "message": "Product deleted",
      "product": {
        "id": "1",
        "name": "Laptop",
        "description": "High-performance laptop with 16GB RAM",
        "price": 1200,
        "category": "electronics",
        "inStock": true
      }
    }
    ```
  - Response (not found):
    ```json
    {
      "error": "NotFoundError",
      "message": "Product not found"
    }
    ```

- **GET /api/products/search**:

  - Request: `curl -H "x-api-key: my-secret-api-key" "http://localhost:3000/api/products/search?q=laptop"`
  - Response:
    ```json
    [
      {
        "id": "1",
        "name": "Laptop",
        "description": "High-performance laptop with 16GB RAM",
        "price": 1200,
        "category": "electronics",
        "inStock": true
      }
    ]
    ```
  - Response (missing query):
    ```json
    {
      "error": "ValidationError",
      "message": "Search query (q) is required"
    }
    ```

- **GET /api/products/stats**:

  - Request: `curl -H "x-api-key: my-secret-api-key" http://localhost:3000/api/products/stats`
  - Response:
    ```json
    {
      "electronics": 2,
      "kitchen": 1
    }
    ```

- **Any /api/\* route without API key**:
  - Request: `curl http://localhost:3000/api/products`
  - Response:
    ```json
    {
      "error": "Error",
      "message": "Invalid or missing API key"
    }
    ```
