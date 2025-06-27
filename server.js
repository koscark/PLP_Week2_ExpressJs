require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = process.env.PORT || 3000;

// Custom error classes
class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = "NotFoundError";
    this.statusCode = 404;
  }
}

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
    this.statusCode = 400;
  }
}

// Middleware setup
app.use(bodyParser.json());

// Logger middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - ${req.method} ${req.url}`);
  next();
});

// Authentication middleware
const API_KEY = process.env.API_KEY;
app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    const apiKey = req.headers["x-api-key"];
    if (!apiKey || apiKey !== API_KEY) {
      return next(new Error("Invalid or missing API key"));
    }
  }
  next();
});

// Sample in-memory products database
let products = [
  {
    id: "1",
    name: "Laptop",
    description: "High-performance laptop with 16GB RAM",
    price: 1200,
    category: "electronics",
    inStock: true,
  },
  {
    id: "2",
    name: "Smartphone",
    description: "Latest model with 128GB storage",
    price: 800,
    category: "electronics",
    inStock: true,
  },
  {
    id: "3",
    name: "Coffee Maker",
    description: "Programmable coffee maker with timer",
    price: 50,
    category: "kitchen",
    inStock: false,
  },
];

// Root route
app.get("/", (req, res) => {
  res.send("Hello World");
});

// Async wrapper for handling async errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Validation middleware for product creation and update
const validateProduct = (req, res, next) => {
  const { name, description, price, category, inStock } = req.body;
  if (
    !name ||
    !description ||
    typeof price !== "number" ||
    !category ||
    typeof inStock !== "boolean"
  ) {
    return next(
      new ValidationError(
        "All fields (name, description, price, category, inStock) are required and must be valid"
      )
    );
  }
  next();
};

// RESTful routes
app.get(
  "/api/products",
  asyncHandler(async (req, res, next) => {
    const { category, page = 1, limit = 10 } = req.query;
    let filteredProducts = products;
    if (category) {
      filteredProducts = products.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase()
      );
    }
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    if (isNaN(pageNum) || isNaN(limitNum) || pageNum < 1 || limitNum < 1) {
      return next(
        new ValidationError("Page and limit must be positive integers")
      );
    }
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = pageNum * limitNum;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
    res.json({
      page: pageNum,
      limit: limitNum,
      total: filteredProducts.length,
      products: paginatedProducts,
    });
  })
);

app.get(
  "/api/products/:id",
  asyncHandler(async (req, res, next) => {
    const product = products.find((p) => p.id === req.params.id);
    if (!product) {
      return next(new NotFoundError("Product not found"));
    }
    res.json(product);
  })
);

app.post(
  "/api/products",
  validateProduct,
  asyncHandler(async (req, res) => {
    const { name, description, price, category, inStock } = req.body;
    const newProduct = {
      id: uuidv4(),
      name,
      description,
      price,
      category,
      inStock,
    };
    products.push(newProduct);
    res.status(201).json(newProduct);
  })
);

app.put(
  "/api/products/:id",
  validateProduct,
  asyncHandler(async (req, res, next) => {
    const productIndex = products.findIndex((p) => p.id === req.params.id);
    if (productIndex === -1) {
      return next(new NotFoundError("Product not found"));
    }
    const { name, description, price, category, inStock } = req.body;
    products[productIndex] = {
      id: req.params.id,
      name,
      description,
      price,
      category,
      inStock,
    };
    res.json(products[productIndex]);
  })
);

app.delete(
  "/api/products/:id",
  asyncHandler(async (req, res, next) => {
    const productIndex = products.findIndex((p) => p.id === req.params.id);
    if (productIndex === -1) {
      return next(new NotFoundError("Product not found"));
    }
    const deletedProduct = products.splice(productIndex, 1)[0];
    res.json({ message: "Product deleted", product: deletedProduct });
  })
);

// Search products by name
app.get(
  "/api/products/search",
  asyncHandler(async (req, res, next) => {
    const { q } = req.query;
    if (!q) {
      return next(new ValidationError("Search query (q) is required"));
    }
    const searchResults = products.filter((p) =>
      p.name.toLowerCase().includes(q.toLowerCase())
    );
    res.json(searchResults);
  })
);

// Get product statistics
app.get(
  "/api/products/stats",
  asyncHandler(async (req, res) => {
    const stats = products.reduce((acc, product) => {
      const category = product.category.toLowerCase();
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});
    res.json(stats);
  })
);

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(`${new Date().toISOString()} - ${err.name}: ${err.message}`);
  const statusCode =
    err.statusCode ||
    (err.message === "Invalid or missing API key" ? 401 : 500);
  res.status(statusCode).json({
    error: err.name || "ServerError",
    message: err.message || "An unexpected error occurred",
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;
