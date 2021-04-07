import React, { useContext, useEffect } from "react";
import "../css/base.css";
import { Link } from "react-router-dom";
import { useHistory } from "react-router-dom";
import { AppContext } from "../";

function Navbar() {
  const history = useHistory();
  const { name, alertContent } = useContext(AppContext);
  let [username, setUsername] = name;

  const logoutUser = (event) => {
    event.preventDefault();
    sessionStorage.clear();
    setUsername("");
    history.push("/api");
    alertContent.handler({
      alertOpen: true,
      alertMessage: "You logout!",
      type: "success",
    });
  };

  useEffect(() => {
    setUsername(sessionStorage.getItem("username"));
  }, []);

  return (
    <nav className="navbar">
      <div>
        <Link className="active link" to="/">
          <i className="fa fa-fw fa-home"></i> Home
        </Link>
        <Link className="link" to="/api/documents">
          <i className="fa fa-fw fa-book"></i> Documents
        </Link>
        <Link className="link" to="/api/messages">
          <i className="fa fa-fw fa-comments"></i> Messages
        </Link>
        {username ? (
          <>
            <Link className="link right" to="#" onClick={logoutUser}>
              <i className="fa fa-sign-out"></i> Log out
            </Link>
            <Link className="link right" to="#" onClick={logoutUser}>
              <i className="fa fa-fw fa-user-circle"></i> {username}
            </Link>
          </>
        ) : (
          <Link className="link right" to="/login">
            <i className="fa fa-fw fa-user"></i> Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
