import React, { useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { Typography } from "@material-ui/core";
import { Link, useHistory } from "react-router-dom";
import DescriptionOutlinedIcon from "@material-ui/icons/DescriptionOutlined";
import MessageOutlinedIcon from "@material-ui/icons/MessageOutlined";
import CreateOutlinedIcon from "@material-ui/icons/CreateOutlined";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    marginTop: "20px",
  },
  paper: {
    height: 300,
    width: 300,
    marginTop: "20px",
    padding: "10px",
  },
  pageTitle: {
    margin: "10px auto",
    textAlign: "center",
  },
  cursor: {
    cursor: "pointer",
  },
  link: {
    textDecoration: "none",
  },
  media: {
    height: 250,
    width: 300,
  },
}));

export default function Main() {
  const classes = useStyles();
  const history = useHistory();

  useEffect(() => {
    if (sessionStorage.getItem("token") === null) {
      history.push("/login");
    }
  }, [history]);

  return (
    <>
      <Grid container className={classes.root} spacing={2}>
        <Grid item xs={12}>
          <Grid container justify="center" spacing={6}>
            <Grid item>
              <Link to="/api" className={classes.link}>
                <Paper
                  className={classes.paper}
                  elevation={3}
                  title="Document operations"
                >
                  <Typography variant={"h5"} className={classes.pageTitle}>
                    Operations
                  </Typography>
                  <CreateOutlinedIcon className={classes.media} />
                </Paper>
              </Link>
            </Grid>
            <Grid item>
              <Link to="/api/documents" className={classes.link}>
                <Paper
                  className={classes.paper}
                  elevation={3}
                  title="Documents list"
                >
                  <Typography variant={"h5"} className={classes.pageTitle}>
                    Documents
                  </Typography>
                  <DescriptionOutlinedIcon className={classes.media} />
                </Paper>
              </Link>
            </Grid>
            <Grid item>
              <Link to="api/messages" className={classes.link}>
                <Paper className={classes.paper} elevation={3} title="Messages">
                  <Typography variant={"h5"} className={classes.pageTitle}>
                    Messages
                  </Typography>
                  <MessageOutlinedIcon className={classes.media} />
                </Paper>
              </Link>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
