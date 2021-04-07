import React, { useContext, useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import { useHistory } from "react-router-dom";
import DocumentListItem from "./documentListItem";
import api from "../services/APIService";
import { AppContext } from "../";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    margin: "auto",
    backgroundColor: theme.palette.background.paper,
  },
  container: {
    minHeight: "600px",
  },
}));

export default function SimpleList() {
  const classes = useStyles();
  const history = useHistory();
  const { alertContent } = useContext(AppContext);
  let [documents, setDocuments] = useState([]);

  useEffect(() => {
    if (sessionStorage.getItem("token") === null) {
      alertContent.handler({
        alertOpen: true,
        alertMessage: "Please login!",
        type: "warning",
      });
      history.push("/login");
    } else {
      api.getDocuments().then((data) => {
        if (data !== null) {
          setDocuments(data);
        } else {
          history.push("/login");
        }
      });
    }
  }, []);

  return (
    <div className={classes.container}>
      <div className={classes.root}>
        <List component="nav" aria-label="main mailbox folders">
          {documents.map((single_document) => (
            <DocumentListItem
              key={single_document._id}
              history={history}
              single_document={single_document}
            />
          ))}
        </List>
        <Divider />
      </div>
    </div>
  );
}
