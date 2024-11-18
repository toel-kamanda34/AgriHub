import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../../../AppContext";

export default function UserList() {
  const [users, setUsers] = useState([]);

  const { userCredentials, setUserCredentials } = useContext(AppContext);

  const navigate = useNavigate();

  async function getUsers() {
    try {
      const response = await fetch("http://localhost:4000/users", {
        method: "GET",
        headers: {
          Authorization: "Bearer " + userCredentials.accessToken,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setUsers(data);
      } else if (response.status === 401) {
        //unathorized response
        setUserCredentials(null);
        //redirect user to home page
        navigate("/auth/login");
      } else {
        alert("Unable to read the data: " + data);
      }
    } catch (error) {
      alert("Unable to connect to the server");
    }
  }

  useEffect(() => {
    getUsers();
  }, []);
  return (
    <div className="container my-4">
      <h2 className="text-center mb-5">List of users</h2>

      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => {
            return (
              <tr key={index}>
                <td>{user.id}</td>
                <td>{user.firstname}</td>
                <td>{user.lastname}</td>
                <td>{user.email}</td>
                <td>
                  {user.role === "admin" ? (
                    <span className="badge text-bg-warning">Admin</span>
                  ) : (
                    <span className="badge text-bg-success">Client</span>
                  )}
                </td>
                <td>
                  {" "}
                  <Link
                    className="btn btn-primary btn-sm"
                    to={"/admin/users/details/" + user.id}
                    role="button"
                  >
                    Details
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
