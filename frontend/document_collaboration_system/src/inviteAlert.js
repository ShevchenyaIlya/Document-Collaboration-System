import React from "react";
import Button from "@material-ui/core/Button";
import Snackbar from "@material-ui/core/Snackbar";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import api from "./services/APIService";

export default function InviteSnackbar({ notification }) {
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    closeSnackbar();
  };

  const closeSnackbar = () => {
    notification.setOpen({
      open: false,
      setOpen: notification.setOpen,
      documentName: "",
      documentId: "",
      inviteId: "",
    });
  };

  const undoInvite = () => {
    api.deleteInvite(notification.inviteId).then();
    closeSnackbar();
  };

  const confirmInvite = () => {
    api
      .approveInvite(
        notification.inviteId,
        JSON.stringify({ document_id: notification.documentId })
      )
      .then();
    closeSnackbar();
  };

  return (
    <div>
      <Snackbar
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        open={notification.open}
        autoHideDuration={10000}
        onClose={handleClose}
        message={"You invited to '" + notification.documentName + "'!"}
        action={
          <React.Fragment>
            <Button color="secondary" size="small" onClick={confirmInvite}>
              Accept
            </Button>
            <Button color="secondary" size="small" onClick={undoInvite}>
              Undo
            </Button>
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleClose}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </React.Fragment>
        }
      />
    </div>
  );
}
