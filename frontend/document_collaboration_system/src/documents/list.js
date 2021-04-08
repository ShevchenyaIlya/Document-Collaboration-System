import React, { useContext, useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Divider from "@material-ui/core/Divider";
import { useHistory } from "react-router-dom";
import DocumentListItem from "./documentListItem";
import api from "../services/APIService";
import { AppContext } from "../";
import LinearProgress from "@material-ui/core/LinearProgress";
import EmptyPageContent from "../common/emptyPageContent";

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
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      await api.getDocuments().then((data) => {
        if (data !== null) {
          setDocuments(data);
        } else {
          history.push("/login");
        }
        setLoading(false);
      });
    };

    if (sessionStorage.getItem("token") === null) {
      alertContent.handler({
        alertOpen: true,
        alertMessage: "Please login!",
        type: "warning",
      });
      history.push("/login");
    } else {
      setLoading(true);
      fetchData().then();
    }
  }, []);

  if (loading) {
    return <LinearProgress />;
  }

  if (documents.length < 1) {
    return (
      <EmptyPageContent
        page="Documents"
        message="Currently no documents have been created"
      />
    );
  }

  return (
    <div className={classes.container}>
      <div className={classes.root}>
        {documents.map((single_document) => (
          <DocumentListItem
            key={single_document._id}
            expanded={expanded}
            setExpanded={setExpanded}
            history={history}
            single_document={single_document}
          />
        ))}
        <Divider />
      </div>
    </div>
  );
}
