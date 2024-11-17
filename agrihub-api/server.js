const express = require("express");
const jsonServer = require("json-server");
const auth = require("json-server-auth");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

// Constants
const PORT = 4000;
const UPLOAD_DIR = path.join(__dirname, "public", "images");
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Create express app and json-server router
const app = express();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

// /!\ Bind the router db to the app

app.db = router.db;
// Middleware setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(middlewares);

// Static file serving
app.use(express.static(path.join(__dirname)));
app.use("/public/images", express.static(UPLOAD_DIR));

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const imageFilename = `${timestamp}${ext}`;
    req.body.imageFilename = imageFilename;
    cb(null, imageFilename);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
  limits: { fileSize: MAX_FILE_SIZE },
});

// Auth rules
const rules = auth.rewriter({
  users: 660,
  products: 664, // Allow read for all, write for authenticated users
});

// Apply authentication rules before routes
app.use(rules);
app.use(auth);

// Database operations
const getDb = () => {
  try {
    return JSON.parse(fs.readFileSync("db.json", "utf8"));
  } catch (error) {
    return { products: [] };
  }
};

const saveDb = (data) => {
  fs.writeFileSync("db.json", JSON.stringify(data, null, 2));
};

// Validation middleware
const validateProduct = (req, res, next) => {
  const errors = {};

  if (!req.body.name?.trim()) errors.name = "Name is required";
  if (!req.body.brand?.trim()) errors.brand = "Brand is required";
  if (!req.body.category?.trim()) errors.category = "Category is required";
  if (!req.body.price) errors.price = "Price is required";
  if (req.body.price && parseFloat(req.body.price) < 1) {
    errors.price = "Price must be at least 1";
  }
  if (!req.body.description?.trim())
    errors.description = "Description is required";

  if (Object.keys(errors).length > 0) {
    return res.status(400).json(errors);
  }

  next();
};

// Helper functions
const getImageUrl = (filename) => {
  return filename ? `http://localhost:${PORT}/public/images/${filename}` : null;
};

const deleteImageFile = (filename) => {
  if (filename) {
    const imagePath = path.join(UPLOAD_DIR, filename);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  }
};
app.get("/products/:id", (req, res) => {
  try {
    const db = getDb();
    const product = db.products.find((p) => p.id === parseInt(req.params.id));

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({
      ...product,
      imageUrl: getImageUrl(product.imageFilename),
    });
  } catch (error) {
    console.error("Error fetching single product:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// Routes
const baseRoutes = ["/products", "/api/products"];

// Replace your existing GET products endpoint with this one
app.get(baseRoutes, (req, res) => {
  try {
    // Get query parameters
    const page = parseInt(req.query._page) || 1;
    const limit = parseInt(req.query._limit) || 5;
    const search = req.query.q || "";
    const sortColumn = req.query._sort || "id";
    const sortOrder = req.query._order || "desc";
    const category = req.query.category;
    const brand = req.query.brand;

    let db = getDb();
    let products = [...db.products]; // Create a copy to work with
    // Check if we're requesting a single product

    // Apply category filter if category parameter exists
    if (category) {
      products = products.filter(
        (product) => product.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Apply brand filter if brand parameter exists
    if (brand) {
      products = products.filter(
        (product) => product.brand.toLowerCase() === brand.toLowerCase()
      );
    }
    // Apply search filter if search term exists
    if (search) {
      products = products.filter(
        (product) =>
          product.name.toLowerCase().includes(search.toLowerCase()) ||
          product.brand.toLowerCase().includes(search.toLowerCase()) ||
          product.category.toLowerCase().includes(search.toLowerCase()) ||
          product.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply sorting
    products.sort((a, b) => {
      let aValue = a[sortColumn];
      let bValue = b[sortColumn];

      // Handle numeric values
      if (sortColumn === "price" || sortColumn === "id") {
        aValue = Number(aValue);
        bValue = Number(bValue);
      } else {
        // Convert to lowercase strings for string comparison
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }

      if (sortOrder.toLowerCase() === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Calculate total before pagination
    const totalProducts = products.length;
    const totalPages = Math.ceil(totalProducts / limit);

    // Apply pagination after sorting
    const startIndex = (page - 1) * limit;
    const paginatedProducts = products.slice(startIndex, startIndex + limit);

    // Add image URLs to products
    const productsWithImageUrls = paginatedProducts.map((product) => ({
      ...product,
      imageUrl: getImageUrl(product.imageFilename),
    }));

    // Send response with pagination metadata and total count
    res.json({
      data: {
        products: productsWithImageUrls,
        pagination: {
          currentPage: page,
          totalPages,
          totalProducts,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          limit,
        },
      },
    });
  } catch (error) {
    console.error("Error in GET products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// POST new product
app.post(baseRoutes, upload.single("image"), validateProduct, (req, res) => {
  try {
    const db = getDb();
    const newProduct = {
      id: Date.now(),
      name: req.body.name.trim(),
      brand: req.body.brand.trim(),
      category: req.body.category,
      price: parseFloat(req.body.price),
      description: req.body.description.trim(),
      imageFilename: req.file ? req.file.filename : null,
      createAt: new Date().toISOString(),
    };

    db.products.push(newProduct);
    saveDb(db);

    res.status(201).json({
      ...newProduct,
      imageUrl: getImageUrl(newProduct.imageFilename),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create product" });
  }
});

// UPDATE product (PATCH/PUT)
const updateHandler = async (req, res) => {
  try {
    const db = getDb();
    const productIndex = db.products.findIndex(
      (p) => p.id === parseInt(req.params.id)
    );

    if (productIndex === -1) {
      return res.status(404).json({ message: "Product not found" });
    }

    const currentProduct = db.products[productIndex];

    // Handle image update
    if (req.file) {
      deleteImageFile(currentProduct.imageFilename);
    }

    const updatedProduct = {
      ...currentProduct,
      name: req.body.name?.trim() || currentProduct.name,
      brand: req.body.brand?.trim() || currentProduct.brand,
      category: req.body.category || currentProduct.category,
      price: req.body.price ? parseFloat(req.body.price) : currentProduct.price,
      description: req.body.description?.trim() || currentProduct.description,
      imageFilename: req.file
        ? req.file.filename
        : currentProduct.imageFilename,
      updateAt: new Date().toISOString(),
    };

    db.products[productIndex] = updatedProduct;
    saveDb(db);

    res.json({
      ...updatedProduct,
      imageUrl: getImageUrl(updatedProduct.imageFilename),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update product" });
  }
};

// Support both PATCH and PUT methods
app.patch(
  [...baseRoutes.map((route) => `${route}/:id`)],
  upload.single("image"),
  validateProduct,
  updateHandler
);
app.put(
  [...baseRoutes.map((route) => `${route}/:id`)],
  upload.single("image"),
  validateProduct,
  updateHandler
);

// DELETE product
app.delete([...baseRoutes.map((route) => `${route}/:id`)], (req, res) => {
  try {
    const db = getDb();
    const productIndex = db.products.findIndex(
      (p) => p.id === parseInt(req.params.id)
    );

    if (productIndex === -1) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete associated image file
    const product = db.products[productIndex];
    deleteImageFile(product.imageFilename);

    // Remove product from database
    db.products.splice(productIndex, 1);
    saveDb(db);

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete product" });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ image: "File size should be less than 5MB" });
    }
    return res.status(400).json({ image: "Error uploading file" });
  }

  res.status(500).json({
    message: "An unexpected error occurred",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});
app.use(router);

app.use(auth);
// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(
    `Images can be accessed at http://localhost:${PORT}/public/images/[filename]`
  );
});
