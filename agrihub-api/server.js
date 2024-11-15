const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const app = express();

// Constants
const PORT = 4000;
const UPLOAD_DIR = path.join(__dirname, "public", "images");
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Routes
const baseRoutes = ["/products", "/api/products"];

// GET all products
app.get(baseRoutes, (req, res) => {
  try {
    const db = getDb();
    const productsWithImageUrls = db.products.map((product) => ({
      ...product,
      imageUrl: getImageUrl(product.imageFilename),
    }));
    res.json(productsWithImageUrls);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// GET single product
app.get([...baseRoutes.map((route) => `${route}/:id`)], (req, res) => {
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
    res.status(500).json({ error: "Failed to fetch product" });
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
      createdAt: new Date().toISOString(),
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
      updatedAt: new Date().toISOString(),
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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(
    `Images can be accessed at http://localhost:${PORT}/public/images/[filename]`
  );
});
