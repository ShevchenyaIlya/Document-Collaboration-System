import { Avatar, Button, Paper, TextField } from "@material-ui/core";
import React, { useCallback, useContext, useState } from "react";
import "./css/login.css";
import { Link, useHistory } from "react-router-dom";
import { AppContext } from "./";
import api from "./service";

function Login() {
  const [textField, setText] = useState("");
  const onChangeUsername = useCallback(
    (event) => setText(event.target.value),
    []
  );
  const history = useHistory();
  const { alertContent } = useContext(AppContext);

  const handler = (event) => {
    event.preventDefault();

    api.userLogin(textField).then((response_data) => {
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
        const { username, token, id } = response_data;
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("id", id);
        sessionStorage.setItem("username", username);
        history.push("/api");
      }
    });
  };
  return (
    <Paper elevation={3} className="loginPaperStyle">
      <form
        noValidate
        autoComplete="off"
        onSubmit={handler}
        className="loginForm"
      >
        <h1>Sign In</h1>
        <Avatar id="avatar" />
        <TextField
          id="filled-basic"
          label="Login"
          value={textField}
          onChange={onChangeUsername}
          variant="filled"
          className="loginInput"
        />
        <Button type="submit" variant="outlined">
          Login
        </Button>
        <Link to="/api">Home</Link>
      </form>
    </Paper>
  );
}

export default Login;
