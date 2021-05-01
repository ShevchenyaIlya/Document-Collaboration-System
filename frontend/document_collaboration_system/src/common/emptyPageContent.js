import Paper from "@material-ui/core/Paper";
import SentimentVeryDissatisfiedIcon from "@material-ui/icons/SentimentVeryDissatisfied";
import { Typography } from "@material-ui/core";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles(() => ({
  root: {
    margin: "50px auto",
    maxWidth: "450px",
    padding: "30px",
  },
  icon: {
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

export default function EmptyPageContent({ page, message }) {
  const classes = useStyles();

  return (
    <Paper className={classes.root}>
      <SentimentVeryDissatisfiedIcon className={classes.icon} />
      <Typography variant={"h4"} className={classes.pageHeader}>
        {page}
      </Typography>
      <Typography variant={"h5"} className={classes.pageHeader}>
        {message}
      </Typography>
    </Paper>
  );
}
