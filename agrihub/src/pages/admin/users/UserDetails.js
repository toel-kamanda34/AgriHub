import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

export default function UserDetails() {
  const [user, setUser] = useState({});
  return (
    <div className="container my-4">
      <h2 className="mb-3">User Details</h2>
      <hr />
      <div className="row mb-3">
        <div className="col-4">ID</div>
        <div className="col-8">{user.id}</div>
      </div>

      <div className="row mb-3">
        <div className="col-4">First Name</div>
        <div className="col-8">{user.firstname}</div>
      </div>

      <div className="row mb-3">
        <div className="col-4">Last Name</div>
        <div className="col-8">{user.lastname}</div>
      </div>

      <div className="row mb-3">
        <div className="col-4">Email</div>
        <div className="col-8">{user.email}</div>
      </div>

      <div className="row mb-3">
        <div className="col-4">Phone</div>
        <div className="col-8">{user.phone}</div>
      </div>

      <div className="row mb-3">
        <div className="col-4">Address</div>
        <div className="col-8">{user.address}</div>
      </div>

      <div className="row mb-3">
        <div className="col-4">Role</div>
        <div className="col-8">
          {!user.id ? (
            ""
          ) : user.role === "admin" ? (
            <span className="badge text-bg-warning">Admin</span>
          ) : (
            <span className="badge text-bg-success">Client</span>
          )}
        </div>
      </div>

      <hr />

      <Link
        className="btn btn-secondary btn-sm"
        to="/admin/users"
        role="button"
      >
        Back
      </Link>
    </div>
  );
}
