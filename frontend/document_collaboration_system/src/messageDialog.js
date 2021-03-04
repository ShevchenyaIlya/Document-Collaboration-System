import React, { useContext } from "react";
import { AppContext } from "./index";
import { send_request } from "./send_request";
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

export default function SendMessageDialog({
  openDialog,
  setOpen,
  messageMode,
  users,
}) {
  const [message, setMessage] = React.useState("");
  const [choice, setChoice] = React.useState("");
  const { alertContent } = useContext(AppContext);

  const handleChange = (event) => {
    setChoice(event.target.value);
  };

  const handleClose = () => {
    setMessage("");
    setOpen(false);
  };

  const handleSend = () => {
    if (messageMode) {
      if (message !== "" && choice !== "") {
        send_request(
          "POST",
          "message",
          JSON.stringify({ to_users: choice, message: message })
        ).then((response) => {
          if (typeof response.message !== "undefined") {
            alertContent.handler({
              alertOpen: true,
              alertMessage: response.message,
              type: "error",
            });
          }
        });
      }
    } else {
      let usersId = [];
      for (let i = 0; i < users.length; i++) {
        usersId.push(users[i]._id);
      }
      if (message !== "") {
        send_request(
          "POST",
          "message",
          JSON.stringify({ to_users: usersId, message: message })
        ).then((response) => {
          if (typeof response.message !== "undefined") {
            alertContent.handler({
              alertOpen: true,
              alertMessage: response.message,
              type: "error",
            });
          }
        });
      }
    }
    handleClose();
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
          onChange={(event) => setMessage(event.target.value)}
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
