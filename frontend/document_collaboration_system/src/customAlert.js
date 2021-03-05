import React, { useContext } from "react";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";
import { makeStyles } from "@material-ui/core/styles";
import { AppContext } from "./";

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    height: "0px",
  },
}));

export default function CustomizedSnackbars() {
  const classes = useStyles();
  const { alertContent } = useContext(AppContext);
  const { configurations, handler } = alertContent;
  const { alertOpen, alertMessage, type } = configurations;

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    handler({ alertOpen: false, alertMessage: "", type: type });
  };

  return (
    <div className={classes.root}>
      <Snackbar open={alertOpen} autoHideDuration={2000} onClose={handleClose}>
        <Alert onClose={handleClose} severity={type}>
          "{alertMessage}"
        </Alert>
      </Snackbar>
    </div>
  );
}
