import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";

const API_BASE_URL = "http://localhost:4000";
export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const pageSize = 5;

  const getProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const url = `${API_BASE_URL}/products?_sort=id&_order=desc&_page=${currentPage}&_limit=${pageSize}`;
      console.log("Fetching URL:", url);
      const response = await fetch(url);
      console.log("Response:", response);
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const totalCount = response.headers.get("X-Total-Count");
      console.log("Total Count:", totalCount);
      const pages = Math.ceil(totalCount / pageSize);
      setTotalPages(pages);

      const data = await response.json();
      console.log("Received data:", data);
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      alert("Unable to get the data");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize]); // Add dependencies here

  useEffect(() => {
    getProducts();
  }, [getProducts]); // Only depend on the memoized function

  const deleteProduct = async (id) => {
    try {
      const response = await fetch(`http://localhost:4000/products/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      // If we're on the last page and delete the last item, go to previous page
      if (products.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        getProducts();
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Unable to delete the product");
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const renderPaginationButtons = () => {
    return Array.from({ length: totalPages }, (_, index) => index + 1).map(
      (pageNum) => (
        <li
          className={pageNum === currentPage ? "page-item active" : "page-item"}
          key={pageNum}
        >
          <button
            className="page-link"
            onClick={() => handlePageChange(pageNum)}
            disabled={isLoading}
          >
            {pageNum}
          </button>
        </li>
      )
    );
  };

  return (
    <div className="container my-4">
      <h2 className="text-center mb-4">Products</h2>

      <div className="row mb-3">
        <div className="col">
          <Link
            className="btn btn-primary me-1"
            to="/admin/products/create"
            role="button"
          >
            Create Product
          </Link>
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={() => getProducts()}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Refresh"}
          </button>
        </div>
        <div className="col"></div>
      </div>

      {isLoading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Brand</th>
                <th>Category</th>
                <th>Price</th>
                <th>Image</th>
                <th>Created At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={product.id || index}>
                  <td>{product.id}</td>
                  <td>{product.name}</td>
                  <td>{product.brand}</td>
                  <td>{product.category}</td>
                  <td>Ksh {product.price}</td>
                  <td>
                    {product.imageFilename ? (
                      <img
                        src={`http://localhost:4000/public/images/${product.imageFilename}`}
                        width="100"
                        height="100"
                        alt={product.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://placehold.co/100x100?text=No+Image";
                        }}
                      />
                    ) : (
                      <img
                        src="https://placehold.co/100x100?text=No+Image"
                        width="100"
                        height="100"
                        alt="Not available"
                      />
                    )}
                  </td>
                  <td>{product.createAt?.slice(0, 10)}</td>
                  <td style={{ width: "10px", whiteSpace: "nowrap" }}>
                    <Link
                      className="btn btn-primary btn-sm me-1"
                      to={`/admin/products/edit/${product.id}`}
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => deleteProduct(product.id)}
                      disabled={isLoading}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <nav aria-label="Product pagination">
            <ul className="pagination">
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                >
                  Previous
                </button>
              </li>
              {renderPaginationButtons()}
              <li
                className={`page-item ${
                  currentPage === totalPages ? "disabled" : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || isLoading}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </>
      )}
    </div>
  );
}
