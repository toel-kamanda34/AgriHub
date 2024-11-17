import { useContext } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { AppContext } from "../../AppContext";

export default function Login() {
  const navigate = useNavigate();

  const { userCredentials, setUserCredentials } = useContext(AppContext);

  if (userCredentials) {
    return <Navigate to="/" />;
  }
  async function handleSubmit(event) {
    event.preventDefault();

    let email = event.target.email.value;
    let password = event.target.password.value;

    if (!email || !password) {
      alert("Please fill the login form");
      return;
    }

    const credentials = { email, password };

    try {
      const response = await fetch("http://localhost:4000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("server response: ", data);
        setUserCredentials(data);
        //redirect the user
        navigate("/");
      } else {
        alert("Unable to login: " + data);
      }
    } catch (error) {
      alert("Unable to connect to the server");
    }
  }
  return (
    <div className="container my-4">
      <div className="mx-auto rounded border p-4" style={{ width: "400px" }}>
        <h2 className="text-center mb-5">Welcome, please login</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input className="form-control" name="email" />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input className="form-control" name="password" type="password" />
          </div>

          <div className="row">
            <div className="col d-grid">
              <button type="submit" className="btn btn-primary">
                {" "}
                Login
              </button>
            </div>
            <div className="col d-grid">
              <Link className="btn btn-otline-primary" to="/" role="button">
                Cancel
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
