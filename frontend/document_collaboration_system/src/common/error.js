import React from "react";
import "../css/base.css";
import { useLocation } from "react-router-dom";
import SentimentVeryDissatisfiedIcon from "@material-ui/icons/SentimentVeryDissatisfied";
import { Typography } from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles(() => ({
  root: {
    margin: "50px auto",
    maxWidth: "450px",
    padding: "30px",
  },
  paperIcon: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    width: "250px",
    height: "250px",
    margin: "40px auto",
  },
  pageHeader: {
    marginBottom: "10px",
    textAlign: "center",
  },
}));

export function Error404() {
  const location = useLocation();
  const classes = useStyles();

  return (
    <Paper className={classes.root} elevation={3}>
      <SentimentVeryDissatisfiedIcon className={classes.paperIcon} />
      <Typography variant={"h4"} className={classes.pageHeader}>
        404 Resource not found
      </Typography>
      <Typography variant={"h5"} className={classes.pageHeader}>
        at '{location.pathname}'
      </Typography>
    </Paper>
  );
}
