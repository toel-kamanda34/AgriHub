import React, { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Footer, Navbar } from "./components/layout";
import Home from "./pages/Home";
import Contact from "./pages/Contat";
import NotFound from "./pages/NotFound";
import ProductList from "./pages/admin/products/ProductList";
import CreateProduct from "./pages/admin/products/CreateProduct";
import EditProduct from "./pages/admin/products/EditProduct";
import ProductDetails from "./pages/ProductDetails";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import { AppContext } from "./AppContext";
import { AdminRoute } from "./components/authorization";

function App() {
  function getStoredCredentials() {
    let data = localStorage.getItem("credentials");
    if (data) {
      let json = JSON.parse(data);

      return json;
    }
    return null;
  }

  const [userCredentials, setUserCredentials] = useState(
    getStoredCredentials()
  );

  useEffect(() => {
    let str = JSON.stringify(userCredentials);
    localStorage.setItem("credentials", str);
  }, [userCredentials]);

  return (
    <AppContext.Provider value={{ userCredentials, setUserCredentials }}>
      <BrowserRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/products/:id" element={<ProductDetails />} />

          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/login" element={<Login />} />
          <Route
            path="/admin/products"
            element={
              <AdminRoute>
                <ProductList />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/products/create"
            element={
              <AdminRoute>
                <CreateProduct />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/products/edit/:id"
            element={
              <AdminRoute>
                <EditProduct />
              </AdminRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </AppContext.Provider>
  );
}

export default App;
