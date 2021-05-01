import React, { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { Paper } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import api from "../services/APIService";
import { AppContext } from "../index";
import LinearProgress from "@material-ui/core/LinearProgress";

export const useStyles = makeStyles(() => ({
  profileContainer: {
    maxWidth: "400px",
    margin: "auto",
  },
  root: {
    "& > div, p": {
      marginBottom: "20px",
    },
  },
  username: {
    textTransform: "uppercase",
    margin: "auto",
  },
  userRole: {
    margin: "0 auto 20px",
  },
}));

export default function Profile() {
  const [userInfo, setUserInfo] = useState(null);
  const { alertContent } = useContext(AppContext);
  const history = useHistory();
  const classes = useStyles();

  useEffect(() => {
    const fetchData = async () => {
      await api.userProfile().then((data) => {
        if (data !== null) {
          setUserInfo(data);
        } else {
          history.push("/login");
        }
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
      fetchData().then();
    }
  }, []);

  return (
    <Paper elevation={3} style={{ marginTop: "20px" }}>
      <Grid>
        {userInfo ? (
          <Grid className={classes.profileContainer}>
            <Grid
              container
              direction={"column"}
              alignItems={"flex-start"}
              className={classes.root}
            >
              <Typography variant={"h2"} className={classes.username}>
                {userInfo.username}
              </Typography>
              <Typography variant="h6" className={classes.userRole}>
                {userInfo.role}
              </Typography>
              <Typography>Email: {userInfo.email}</Typography>
              <Typography>Company name: {userInfo.company}</Typography>
            </Grid>
          </Grid>
        ) : (
          <LinearProgress />
        )}
      </Grid>
    </Paper>
  );
}
