import React, {useEffect, useContext}  from "react";
import "../css/base.css";
import { Link } from "react-router-dom";
import { useHistory } from "react-router-dom";
import { AppContext } from "../";
import AppBar from '@material-ui/core/AppBar';
import { makeStyles } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: "rgb(56,56,56)"
  },
  menuButton: {
    marginRight: "10px"
  },
  title: {
    flexGrow: 1,
  },
  linkDecoration: {
    textDecoration: "none",
  },
  whiteText: {
    color: "white",
  },
}));

function Navbar() {
  const classes = useStyles();
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

  const moveHome = (event) => {
    event.preventDefault();
    history.push("/");
  };

  useEffect(() => {
    setUsername(sessionStorage.getItem("username"));
  }, []);

  return (
      <AppBar position="static" component={"nav"} className={classes.root}>
        <Toolbar>
          <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu" onClick={moveHome}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title} onClick={moveHome}>
              <Link to="/" className={`${classes.linkDecoration} ${classes.whiteText}`}>Home</Link>
          </Typography>
          {
            username ? (
              <>
                <Button variant={"contained"} className={classes.menuButton}><AccountCircleIcon /> {username}</Button>
                <Button variant={"contained"} onClick={logoutUser}><ExitToAppIcon /> Log out</Button>
              </>
            ) : (
              <Link to="/login" className={classes.linkDecoration}>
                <Button variant={"contained"}>Login</Button>
              </Link>
            )
          }
        </Toolbar>
      </AppBar>
    // <nav className="navbar">
    //   <div>
    //     <Link className="active link" to="/">
    //       <i className="fa fa-fw fa-home"></i> Home
    //     </Link>
    //     <Link className="link" to="/api/documents">
    //       <i className="fa fa-fw fa-book"></i> Documents
    //     </Link>
    //     <Link className="link" to="/api/messages">
    //       <i className="fa fa-fw fa-comments"></i> Messages
    //     </Link>
    //     {username ? (
    //       <>
    //         <Link className="link right" to="#" onClick={logoutUser}>
    //           <i className="fa fa-sign-out"></i> Log out
    //         </Link>
    //         <Link className="link right" to="#" onClick={logoutUser}>
    //           <i className="fa fa-fw fa-user-circle"></i> {username}
    //         </Link>
    //       </>
    //     ) : (
    //       <Link className="link right" to="/login">
    //         <i className="fa fa-fw fa-user"></i> Sign In
    //       </Link>
    //     )}
    //   </div>
    // </nav>
  );
}

export default Navbar;
