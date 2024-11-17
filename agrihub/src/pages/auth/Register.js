import { useContext } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { AppContext } from "../../AppContext";

export default function Register() {
  const navigate = useNavigate();
  const { userCredentials, setUserCredentials } = useContext(AppContext);

  if (userCredentials) {
    return <Navigate to="/" />;
  }
  async function handleSubmit(event) {
    event.preventDefault();

    let formData = new FormData(event.target);
    let user = Object.fromEntries(formData.entries());

    if (!user.firstname || !user.lastname || !user.email || !user.password) {
      alert("Please fill all the required fields");
      return;
    }

    if (user.password !== user.confirm_password) {
      alert("Password and confirm password do not match");
      return;
    }

    delete user.confirm_password;

    try {
      const response = await fetch("http://localhost:4000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("server response: ", data);
        setUserCredentials(data);
        //redirect the user
        navigate("/ ");
      } else {
        alert("Unable to register: " + data);
      }
    } catch (error) {
      alert("Unable to connect to server");
    }
  }
  return (
    <div className="container my-4">
      <div className="row">
        <div className="col-lg-8 mx-auto rounded border p-4">
          <h2 className="text-center mb-5">Create New Account</h2>

          <form onSubmit={handleSubmit}>
            <div className="row mb-3">
              <label className="col-sm-4 col-form-label">First Name *</label>

              <div className="col-sm-8">
                <input className="form-control" name="firstname" />
              </div>
            </div>

            <div className="row mb-3">
              <label className="col-sm-4 col-form-label">Last Name *</label>

              <div className="col-sm-8">
                <input className="form-control" name="lastname" />
              </div>
            </div>

            <div className="row mb-3">
              <label className="col-sm-4 col-form-label">Email *</label>

              <div className="col-sm-8">
                <input className="form-control" name="email" />
              </div>
            </div>

            <div className="row mb-3">
              <label className="col-sm-4 col-form-label">Phone</label>

              <div className="col-sm-8">
                <input className="form-control" name="phone" />
              </div>
            </div>

            <div className="row mb-3">
              <label className="col-sm-4 col-form-label">Address</label>

              <div className="col-sm-8">
                <input className="form-control" name="address" />
              </div>
            </div>

            <div className="row mb-3">
              <label className="col-sm-4 col-form-label">Password *</label>

              <div className="col-sm-8">
                <input
                  className="form-control"
                  type="password"
                  name="password"
                />
              </div>
            </div>

            <div className="row mb-3">
              <label className="col-sm-4 col-form-label">
                Confirm Password *
              </label>

              <div className="col-sm-8">
                <input
                  className="form-control"
                  type="password"
                  name="confirm_password"
                />
              </div>
            </div>

            <div className="row">
              <div className="offset-sm-4 col-sm-4 d-grid">
                <button type="submit" className="btn btn-primary">
                  {" "}
                  Register
                </button>
              </div>
              <div className="col-sm-4 d-grid">
                <Link className="btn btn-otline-primary" to="/" role="button">
                  Cancel
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
