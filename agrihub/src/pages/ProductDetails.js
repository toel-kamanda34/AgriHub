import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

export default function ProductDetails() {
  const params = useParams();
  const [product, setProduct] = useState({});

  async function getProductDetails() {
    try {
      let response = await fetch("http://localhost:4000/products/" + params.id);
      let data = await response.json();

      if (response.ok) {
        setProduct(data);
      } else {
        alert("Unable to get the product details");
      }
    } catch (error) {
      alert("Unable to connect to the server");
    }
  }

  useEffect(() => {
    getProductDetails();
  }, []);

  return (
    <div className="container my-4">
      <div className="row">
        <div className="col-md-4 text-center">
          <img
            src={"http://localhost:4000/public/images/" + product.imageFilename}
            className="img-fluid mb-3"
            alt="..."
            style={{ width: "350px", height: "450px" }}
          />
        </div>
        <div className="col-md-8">
          <h3 className="mb-3">{product.name}</h3>
          <h3 className="mb-3">ksh {product.price}</h3>
          <button type="button" className="btn btn-warning btn-sm">
            Add to Cart <i className="bi bi-cart4"></i>
          </button>

          <hr />

          <div className="row">
            <div className="col-sm-3 fw-bold">Brand</div>
            <div className="col-sm-9">{product.brand}</div>
          </div>

          <div className="row">
            <div className="col-sm-3 fw-bold">Category</div>
            <div className="col-sm-9">{product.category} </div>
          </div>

          <div className="fw-bold">Description</div>
          <div style={{ whiteSpace: "pre-line" }}>{product.description}</div>
        </div>
      </div>
    </div>
  );
}
