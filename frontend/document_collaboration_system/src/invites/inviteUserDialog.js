import React, { useCallback, useContext, useState } from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import { TextField } from "@material-ui/core";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import api from "../services/APIService";
import { AppContext } from "../";

export default function InviteUserDialog({ openDialog, setOpen, document }) {
  const [username, setUsername] = useState("");
  const { alertContent } = useContext(AppContext);
  const onChangeUsername = useCallback(
    (event) => setUsername(event.target.value),
    []
  );

  const handleClose = () => {
    setOpen(false);
    setUsername("");
  };

  const inviteUser = () => {
    const body = JSON.stringify({ document: document, username: username });
    api.postInvite(body).then((response) => {
      if (response !== null && typeof response.message !== "undefined") {
        alertContent.handler({
          alertOpen: true,
          alertMessage: response.message,
          type: "warning",
        });
      }
    });
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
      <DialogContent>
        <TextField
          id="outlined-basic"
          label="Username"
          variant="outlined"
          fullWidth={true}
          value={username}
          onChange={onChangeUsername}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={inviteUser} color="primary">
          Invite
        </Button>
      </DialogActions>
    </Dialog>
  );
}
