import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";

const API_BASE_URL = "http://localhost:4000";

export default function ProductList() {
  const [allProducts, setAllProducts] = useState([]); // Store all products
  const [displayedProducts, setDisplayedProducts] = useState([]); // Store paginated products
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [paginationInfo, setPaginationInfo] = useState({
    totalProducts: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const pageSize = 5;

  //search functionality
  const [search, setSearch] = useState("");

  // sort functionality
  const [sortColumn, setSortColumn] = useState({
    column: "id",
    orderBy: "desc",
  });

  // Sort function
  function sortTable(column) {
    let orderBy = "desc";

    if (column === sortColumn.column) {
      // reverse orderBy
      orderBy = sortColumn.orderBy === "asc" ? "desc" : "asc";
    }
    setSortColumn({ column, orderBy });
    setCurrentPage(1); // Reset to first page when sorting
  }

  // Function to handle client-side pagination
  const paginateData = useCallback(
    (products, page) => {
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      return products.slice(startIndex, endIndex);
    },
    [pageSize]
  );

  const getProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const url = `${API_BASE_URL}/products?_page=${currentPage}&_limit=${pageSize}&q=${search}&_sort=${sortColumn.column}&_order=${sortColumn.orderBy}`;

      console.log("Fetching URL:", url);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const responseData = await response.json();
      console.log("Received data:", responseData);

      if (responseData.data && Array.isArray(responseData.data.products)) {
        // Update the products
        setDisplayedProducts(responseData.data.products);

        // Update pagination info from server response
        const { pagination } = responseData.data;
        setTotalPages(pagination.totalPages);
        setPaginationInfo({
          totalProducts: pagination.totalProducts,
          hasNextPage: pagination.hasNextPage,
          hasPrevPage: pagination.hasPrevPage,
        });
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      alert("Unable to get the data");
      setDisplayedProducts([]);
      setTotalPages(1);
      setPaginationInfo({
        totalProducts: 0,
        hasNextPage: false,
        hasPrevPage: false,
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, search, sortColumn.column, sortColumn.orderBy]);
  // Update displayed products when page changes
  // useEffect(() => {
  //   if (allProducts.length > 0) {
  //     setDisplayedProducts(paginateData(allProducts, currentPage));
  //     setPaginationInfo((prev) => ({
  //       ...prev,
  //       hasNextPage: currentPage < totalPages,
  //       hasPrevPage: currentPage > 1,
  //     }));
  //   }
  // }, [currentPage, allProducts, totalPages, paginateData, sortColumn]);

  useEffect(() => {
    getProducts();
  }, [getProducts, sortColumn]);
  const deleteProduct = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      // If we're on the last page and delete the last item, go to previous page
      const newProducts = allProducts.filter((product) => product.id !== id);
      const newTotalPages = Math.ceil(newProducts.length / pageSize);

      if (displayedProducts.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else if (currentPage > newTotalPages) {
        setCurrentPage(newTotalPages);
      }

      // Refresh the products
      getProducts();
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
    const buttons = [];
    const maxButtons = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    if (startPage > 1) {
      buttons.push(
        <li className="page-item" key={1}>
          <button className="page-link" onClick={() => handlePageChange(1)}>
            1
          </button>
        </li>
      );
      if (startPage > 2) {
        buttons.push(
          <li className="page-item disabled" key="ellipsis1">
            <span className="page-link">...</span>
          </li>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <li
          className={`page-item ${i === currentPage ? "active" : ""}`}
          key={i}
        >
          <button
            className="page-link"
            onClick={() => handlePageChange(i)}
            disabled={isLoading}
          >
            {i}
          </button>
        </li>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <li className="page-item disabled" key="ellipsis2">
            <span className="page-link">...</span>
          </li>
        );
      }
      buttons.push(
        <li className="page-item" key={totalPages}>
          <button
            className="page-link"
            onClick={() => handlePageChange(totalPages)}
          >
            {totalPages}
          </button>
        </li>
      );
    }

    return buttons;
  };

  //search functionallity
  function handleSearch(event) {
    event.preventDefault();

    let text = event.target.search.value;
    setSearch(text);
    setCurrentPage(1);
  }

  function sortTable(column) {
    let orderBy = "desc";

    if (column === sortColumn.column) {
      // reverse orderBy
      if (sortColumn.orderBy === "asc") orderBy = "desc";
      else orderBy = "asc";
    }
    setSortColumn({ column: column, orderBy: orderBy });
  }
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
        <div className="col">
          <form className="d-flex" onSubmit={handleSearch}>
            <input
              className="form-control me-2"
              type="search"
              placeholder="Search"
              name="search"
            />
            <button className="btn btn-outline-success" type="submit">
              Search
            </button>
          </form>
        </div>
        <div className="col text-end">
          <span className="me-2">
            Total Products: {paginationInfo.totalProducts}
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <>
          <table className="table">
            <thead>
              <tr>
                <th
                  style={{ cursor: "pointer" }}
                  onClick={() => sortTable("id")}
                >
                  ID{" "}
                  <SortArrow
                    column="id"
                    sortColumn={sortColumn.column}
                    orderBy={sortColumn.orderBy}
                  />
                </th>
                <th
                  style={{ cursor: "pointer" }}
                  onClick={() => sortTable("name")}
                >
                  Name{" "}
                  <SortArrow
                    column="name"
                    sortColumn={sortColumn.column}
                    orderBy={sortColumn.orderBy}
                  />
                </th>
                <th
                  style={{ cursor: "pointer" }}
                  onClick={() => sortTable("brand")}
                >
                  Brand{" "}
                  <SortArrow
                    column="brand"
                    sortColumn={sortColumn.column}
                    orderBy={sortColumn.orderBy}
                  />
                </th>
                <th
                  style={{ cursor: "pointer" }}
                  onClick={() => sortTable("category")}
                >
                  Category{" "}
                  <SortArrow
                    column="category"
                    sortColumn={sortColumn.column}
                    orderBy={sortColumn.orderBy}
                  />
                </th>
                <th
                  style={{ cursor: "pointer" }}
                  onClick={() => sortTable("price")}
                >
                  Price{" "}
                  <SortArrow
                    column="price"
                    sortColumn={sortColumn.column}
                    orderBy={sortColumn.orderBy}
                  />
                </th>
                <th>Image</th>
                <th
                  style={{ cursor: "pointer" }}
                  onClick={() => sortTable("createAt")}
                >
                  Created At{" "}
                  <SortArrow
                    column="createAt"
                    sortColumn={sortColumn.column}
                    orderBy={sortColumn.orderBy}
                  />
                </th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {displayedProducts && displayedProducts.length > 0 ? (
                displayedProducts.map((product) => (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td>{product.name}</td>
                    <td>{product.brand}</td>
                    <td>{product.category}</td>
                    <td>Ksh {product.price}</td>
                    <td>
                      {product.imageFilename ? (
                        <img
                          src={`${API_BASE_URL}/public/images/${product.imageFilename}`}
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
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

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
                  disabled={!paginationInfo.hasPrevPage || isLoading}
                >
                  Previous
                </button>
              </li>
              {renderPaginationButtons()}
              <li
                className={`page-item ${
                  !paginationInfo.hasNextPage ? "disabled" : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!paginationInfo.hasNextPage || isLoading}
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

// SortArrow component
function SortArrow({ column, sortColumn, orderBy }) {
  if (column !== sortColumn) {
    return <i className="bi bi-arrow-down-up"></i>; // default unsorted state
  }

  if (orderBy === "asc") {
    return <i className="bi bi-arrow-up"></i>;
  }

  return <i className="bi bi-arrow-down"></i>;
}
