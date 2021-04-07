import { Avatar, Button, Paper, TextField } from "@material-ui/core";
import React, { useCallback, useState, useContext } from "react";
import { useHistory } from "react-router-dom";
import { AppContext } from "../";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import api from "../services/APIService";
import Tooltip from "@material-ui/core/Tooltip";
import {ValidationService, fieldValidation} from "../services/ValidationService";
import ValidationError from "../errors/ValidationError";

export const useStyles = makeStyles(() => ({
  root: {
    margin: "50px auto",
    maxWidth: "450px",
    padding: "30px",
  },
  avatar: {
    width: "200px",
    height: "200px",
    margin: "40px auto",
  },
  textField: {
    marginBottom: "40px",
  },
  button: {
    margin: "auto",
    width: "200px",
  },
}));

function Login({ setUsername }) {
  const [textField, setText] = useState("");
  const onChangeUsername = useCallback(
    (event) => setText(event.target.value),
    []
  );
  const history = useHistory();
  const classes = useStyles();
  const { alertContent } = useContext(AppContext);

  const inputFieldValidation = () => {
    try {
          ValidationService.validateUsername(textField);
    } catch (e) {
        if (e instanceof ValidationError) {
            alertContent.handler({
                alertOpen: true,
                alertMessage: e.message,
                type: "error",
            });
            return false;
        }
    }

    return true;
  };

  const handler = (event) => {
    event.preventDefault();

    if (inputFieldValidation()) {
      api
          .userLogin(JSON.stringify({username: textField}))
          .then((response_data) => {
            if (response_data === null) {
              alertContent.handler({
                alertOpen: true,
                alertMessage: "Such user does not exists!",
                type: "error",
              });
            } else {
              alertContent.handler({
                alertOpen: true,
                alertMessage: "Success login!",
                type: "success",
              });
              const {username, token, id} = response_data;
              sessionStorage.setItem("token", token);
              sessionStorage.setItem("id", id);
              sessionStorage.setItem("username", username);
              setUsername(username);
              history.push("/");
            }
          });
    }
  };
  return (
    <Paper elevation={3} className={classes.root}>
      <form noValidate autoComplete="on" onSubmit={handler}>
        <Grid container direction={"column"}>
          <Typography variant={"h3"} style={{ margin: "auto" }}>
            Sign In
          </Typography>
          <Avatar className={classes.avatar} id="avatar" />
          <TextField
            id="filled-basic"
            value={textField}
            onChange={onChangeUsername}
            autoFocus={true}
            label="Username"
            error={fieldValidation(textField, ValidationService.validateUsername)}
            variant="filled"
            className={classes.textField}
          />
          <Tooltip title="Login to this site">
            <Button type="submit" variant="outlined" className={classes.button}>
              Sign In
            </Button>
          </Tooltip>
        </Grid>
      </form>
    </Paper>
  );
}

export default Login;
