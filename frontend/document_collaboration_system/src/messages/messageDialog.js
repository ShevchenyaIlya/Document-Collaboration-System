import React, { useCallback, useContext, useState } from "react";
import { AppContext } from "../";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import { TextField } from "@material-ui/core";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import api from "../services/APIService";
import {
  fieldValidation,
  ValidationService,
} from "../services/ValidationService";

export default function SendMessageDialog({
  openDialog,
  setOpen,
  messageMode,
  users,
}) {
  const [choice, setChoice] = useState("");
  const [message, setMessage] = useState("");
  const { alertContent } = useContext(AppContext);
  const onChangeMessage = useCallback(
    (event) => setMessage(event.target.value),
    []
  );

  const handleChange = (event) => {
    setChoice(event.target.value);
  };

  const handleClose = () => {
    setMessage("");
    setOpen(false);
  };

  const sendMessage = (users, messageText) => {
    api
      .postMessage(JSON.stringify({ to_users: users, message: messageText }))
      .then((response) => {
        if (typeof response.message !== "undefined") {
          alertContent.handler({
            alertOpen: true,
            alertMessage: response.message,
            type: "error",
          });
        }
      });
  };

  const handleSend = () => {
    if (!fieldValidation(message, ValidationService.validateMessage)) {
      if (messageMode) {
        if (message !== "" && choice !== "") {
          sendMessage([choice], message);
        }
      } else {
        let usersId = [];
        for (let i = 0; i < users.length; i++) {
          usersId.push(users[i]._id);
        }

        if (message !== "") {
          sendMessage(usersId, message);
        }
      }
      handleClose();
    } else {
      alertContent.handler({
        alertOpen: true,
        alertMessage: "Invalid message text",
        type: "error",
      });
    }
  };

  return (
    <Dialog
      open={openDialog}
      fullWidth={true}
      maxWidth="sm"
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="form-dialog-title">Message</DialogTitle>
      <DialogContent>
        {!messageMode && <DialogContentText>Group message</DialogContentText>}
        {messageMode && (
          <>
            <DialogContentText>Personal message</DialogContentText>
            <FormControl style={{ width: "160px", marginBottom: "10px" }}>
              <InputLabel id="demo-simple-select-label">Choose user</InputLabel>
              <Select
                labelId="demo-mutiple-chip-label"
                id="demo-mutiple-chip"
                value={choice}
                onChange={handleChange}
              >
                {users.map((user) => (
                  <MenuItem key={user._id} value={user._id}>
                    {user.username}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
        )}
        <TextField
          id="outlined-basic"
          label="Message"
          variant="outlined"
          fullWidth={true}
          multiline={true}
          value={message}
          error={fieldValidation(message, ValidationService.validateMessage)}
          onChange={onChangeMessage}
        />
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={handleSend}>
          Send
        </Button>
      </DialogActions>
    </Dialog>
  );
}
