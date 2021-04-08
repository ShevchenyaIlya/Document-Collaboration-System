import React, { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import {Paper} from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import api from "../services/APIService";
import {AppContext} from "../index";
import LinearProgress from "@material-ui/core/LinearProgress";

export const useStyles = makeStyles(() => ({
  profileContainer: {
      width: "400px",
      margin: "auto"
  },
  root: {
    "& > div, p": {
        marginBottom: "20px"
    }
  },
}));

export default function Profile () {
    const [userInfo, setUserInfo] = useState(null);
    const { alertContent } = useContext(AppContext);
    const history = useHistory();
    const classes = useStyles();

    useEffect(() => {
        if (sessionStorage.getItem("token") === null) {
          alertContent.handler({
            alertOpen: true,
            alertMessage: "Please login!",
            type: "warning",
          });
          history.push("/login");
        } else {
          api.userProfile().then((data) => {
            if (data !== null) {
              setUserInfo(data);
            } else {
              history.push("/login");
            }
          });
        }
      }, []);

    return (
        <Paper elevation={3} style={{marginTop: "20px"}}>
            <Grid>
                {userInfo ? (
                        <Grid className={classes.profileContainer}>
                                <Grid container direction={"column"} alignItems={"flex-start"} className={classes.root}>
                                    <Typography
                                        variant={"h2"}
                                        style={{textTransform: "uppercase", margin: "auto"}}
                                    >
                                        {userInfo.username}
                                    </Typography>
                                    <Typography variant="h6" style={{margin: "20px auto"}}>{userInfo.role}</Typography>
                                    <Typography>Email: {userInfo.email}</Typography>
                                    <Typography>Company name: {userInfo.company}</Typography>
                                </Grid>
                        </Grid>)
                    : <LinearProgress/>}
            </Grid>
        </Paper>
    );
}
