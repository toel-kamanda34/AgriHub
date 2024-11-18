import { useContext, useState } from "react";
import { AppContext } from "../AppContext";

export default function UserProfile() {
  const [action, setAction] = useState("default");
  return (
    <div className="container my-4">
      <div className="row">
        {action === "default" && (
          <div className="col-lg-8 mx-auto rounded border p-4 ">
            <h2 className="mb-3">User Profile</h2>

            <hr />
            <Details />
            <hr />

            <button
              className="btn btn-primary btn-sm me-2"
              onClick={() => setAction("update_profile")}
            >
              Update Profile
            </button>
            <button
              className="btn btn-warning btn-sm "
              onClick={() => setAction("update_password")}
            >
              Update Password
            </button>
          </div>
        )}

        {action === "update_profile" && (
          <div className="col-lg-8 mx-auto rounded border p-4 ">
            <h2 className="mb-3 text-center">Update Profile</h2>

            <hr />
            <hr />

            <div className="text-center">
              <button
                type="button"
                className="btn btn-link text-decoration-none"
                onClick={() => setAction("default")}
              >
                Back to Profile
              </button>
            </div>
          </div>
        )}

        {action === "update_password" && (
          <div className="col-lg-5 mx-auto rounded border p-4 ">
            <h2 className="mb-3 text-center">Update Password</h2>

            <hr />
            <hr />

            <div className="text-center">
              <button
                type="button"
                className="btn btn-link text-decoration-none"
                onClick={() => setAction("default")}
              >
                Back to Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Details() {
  const { userCredentials } = useContext(AppContext);
  return (
    <>
      <div className="row mb-3">
        <div className="col-sm-3">First Name</div>
        <div className="col-sm-6">{userCredentials.user.firstname}</div>
      </div>
      <div className="row mb-3">
        <div className="col-sm-3">Last Name</div>
        <div className="col-sm-6">{userCredentials.user.lastname}</div>
      </div>

      <div className="row mb-3">
        <div className="col-sm-3">Email</div>
        <div className="col-sm-6">{userCredentials.user.email}</div>
      </div>

      <div className="row mb-3">
        <div className="col-sm-3">Phone Number</div>
        <div className="col-sm-6">{userCredentials.user.phone}</div>
      </div>

      <div className="row mb-3">
        <div className="col-sm-3">Address</div>
        <div className="col-sm-6">{userCredentials.user.address}</div>
      </div>

      <div className="row mb-3">
        <div className="col-sm-3">Role</div>
        <div className="col-sm-6">
          {userCredentials.user.role === "admin" ? "Admin" : "Client"}
        </div>
      </div>
    </>
  );
}
