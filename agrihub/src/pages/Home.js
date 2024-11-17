import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState({
    totalPages: 0,
    totalProducts: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [filters, setFilters] = useState({
    brand: "",
    category: "",
    sortOption: "0",
  });

  const getProducts = useCallback(() => {
    setLoading(true);

    // Construct the base URL
    let url = new URL("http://localhost:4000/products");

    // Add pagination parameters
    url.searchParams.append("_page", currentPage);
    url.searchParams.append("_limit", "8");

    // Add sorting
    if (filters.sortOption === "1") {
      url.searchParams.append("_sort", "price");
      url.searchParams.append("_order", "asc");
    } else if (filters.sortOption === "2") {
      url.searchParams.append("_sort", "price");
      url.searchParams.append("_order", "desc");
    } else {
      url.searchParams.append("_sort", "id");
      url.searchParams.append("_order", "desc");
    }

    // Add filters if they exist
    if (filters.brand) {
      url.searchParams.append("brand", filters.brand);
    }
    if (filters.category) {
      url.searchParams.append("category", filters.category);
    }
    console.log("Fetching URL:", url.toString());

    fetch(url.toString())
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((responseData) => {
        console.log("Raw API Response:", responseData);
        setProducts(responseData.data.products);
        setPaginationInfo(responseData.data.pagination);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        alert("Unable to get the data. Please try again later.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [currentPage, filters]);

  useEffect(() => {
    getProducts();
  }, [getProducts]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleFilterChange = (type, value) => {
    setFilters((prev) => ({
      ...prev,
      [type]: value,
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };
  return (
    <>
      <div style={{ backgroundColor: "#08618d", minHeight: "200px" }}>
        <div className="container text-white py-5">
          <div className="row align-items-center g-5">
            <div className="col-md-6">
              <h1 className="mb-5 display-2">
                <strong>Best Store for Fresh Farm Products</strong>
              </h1>
              <p>
                Browse our marketplace of quality local produce, connect with
                trusted farmers, and get farm-fresh food delivered to your
                doorstep.
              </p>
            </div>
            <div className="col-md-6 text-center">
              <img src="images/hero.png" className="img-fluid" alt="hero" />
            </div>
          </div>
        </div>
      </div>
      <div className="bg-light">
        <div className="container py-5">
          <div className="row mb-5 g-2">
            <div className="col-md-6">
              <h4>Products</h4>
            </div>
            <div className="col-md-2">
              <select
                className="form-select"
                value={filters.brand}
                onChange={(e) => handleFilterChange("brand", e.target.value)}
                aria-label="Select brand"
              >
                <option value="">All Brands</option>
                <option value="Murang'a Fresh">Murang'a Fresh</option>
                <option value="Nandi Hills">Nandi Hills</option>
                <option value="Kitui Farmers">Kitui Farmers</option>
                <option value="Embu Farms">Embu Farms</option>
              </select>
            </div>
            <div className="col-md-2">
              <select
                className="form-select"
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                aria-label="Select category"
              >
                <option value="">All Categories</option>
                <option value="Fruits">Fruits</option>
                <option value="Cash Crops">Cash Crops</option>
                <option value="Legumes">Legumes</option>
                <option value="Nuts">Nuts</option>
              </select>
            </div>
            <div className="col-md-2">
              <select
                className="form-select"
                value={filters.sortOption}
                onChange={(e) =>
                  handleFilterChange("sortOption", e.target.value)
                }
                aria-label="Select sort order"
              >
                <option value="0">Order By Newest</option>
                <option value="1">Price: Low to High</option>
                <option value="2">Price: High to Low</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <>
              <div className="row g-4">
                {products.map((product) => (
                  <div
                    className="col-12 col-sm-6 col-md-4 col-lg-3"
                    key={product.id}
                  >
                    <ProductItem product={product} />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="row mt-4">
                <div className="col">
                  <nav aria-label="Product pagination">
                    <ul className="pagination justify-content-center">
                      <li
                        className={`page-item ${
                          !paginationInfo.hasPrevPage ? "disabled" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={!paginationInfo.hasPrevPage}
                        >
                          Previous
                        </button>
                      </li>
                      {[...Array(paginationInfo.totalPages)].map((_, index) => (
                        <li
                          key={index + 1}
                          className={`page-item ${
                            currentPage === index + 1 ? "active" : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(index + 1)}
                          >
                            {index + 1}
                          </button>
                        </li>
                      ))}
                      <li
                        className={`page-item ${
                          !paginationInfo.hasNextPage ? "disabled" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={!paginationInfo.hasNextPage}
                        >
                          Next
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
            </>
          )}

          {!loading && products.length === 0 && (
            <div className="text-center py-4">
              <p>No products found.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function ProductItem({ product }) {
  return (
    <div className="rounded border shadow p-4 text-center h-100">
      <img
        src={"http://localhost:4000/public/images/" + product.imageFilename}
        className="img-fluid mb-3"
        alt={product.name}
        style={{ height: "220px", objectFit: "contain" }}
      />
      <hr />
      <h4 className="py-2">{product.name}</h4>
      <p>
        Brand: {product.brand}, Category: {product.category} <br />
        {product.description?.substr(0, 50)}...
      </p>
      <h4 className="mb-2">Ksh {product.price}</h4>
      <Link
        className="btn btn-primary btn-sm m-2"
        to={`/products/${product.id}`}
        role="button"
      >
        Details
      </Link>
    </div>
  );
}
