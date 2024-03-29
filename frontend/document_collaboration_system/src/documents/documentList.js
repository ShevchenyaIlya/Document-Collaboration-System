import SimpleList from "./list";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles(() => ({
  root: {
    marginTop: "20px",
  },
}));

function DocumentList() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <SimpleList />
    </div>
  );
}

export default DocumentList;