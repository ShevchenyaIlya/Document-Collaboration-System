import React, { useEffect, useContext } from "react";
import "../css/base.css";
import { Link } from "react-router-dom";
import { useHistory } from "react-router-dom";
import { AppContext } from "../";
import AppBar from "@material-ui/core/AppBar";
import { makeStyles } from "@material-ui/core/styles";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import Tooltip from "@material-ui/core/Tooltip";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: "rgb(56,56,56)",
  },
  menuButton: {
    marginRight: "10px",
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

  const moveProfile = (event) => {
    event.preventDefault();
    history.push("/profile");
  };

  useEffect(() => {
    setUsername(sessionStorage.getItem("username"));
  }, []);

  return (
    <AppBar position="static" component={"nav"} className={classes.root}>
      <Toolbar>
        <Tooltip title="Main page">
          <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            aria-label="menu"
            onClick={moveHome}
          >
            <MenuIcon />
          </IconButton>
        </Tooltip>
        <Typography variant="h6" className={classes.title} onClick={moveHome}>
          <Link
            to="/"
            className={`${classes.linkDecoration} ${classes.whiteText}`}
          >
            Home
          </Link>
        </Typography>
        {username ? (
          <>
            <Button variant={"contained"} className={classes.menuButton} onClick={moveProfile}>
              <AccountCircleIcon /> {username}
            </Button>
            <Button variant={"contained"} onClick={logoutUser}>
              <ExitToAppIcon /> Log out
            </Button>
          </>
        ) : (
          <Link to="/login" className={classes.linkDecoration}>
            <Button variant={"contained"}>Login</Button>
          </Link>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
