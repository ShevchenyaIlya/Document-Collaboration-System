import React, { useCallback, useContext, useState } from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import { AppContext } from "../";
import api from "../services/APIService";
import {fieldValidation, ValidationService} from "../services/ValidationService";
import ValidationError from "../errors/ValidationError";

export default function FormDialog({
  openModalWindow,
  setOpen,
  document,
  selectedText,
}) {
  const [comment, setComment] = useState("");
  const onChangeComment = useCallback(
    (event) => setComment(event.target.value),
    []
  );

  const { alertContent } = useContext(AppContext);

  const handleClose = () => {
    setOpen(false);
  };

  const inputFieldValidation = () => {
    try {
          ValidationService.validateComment(comment);
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

  const handleLeave = () => {
    if (inputFieldValidation()) {
      api
          .postComment(
              document,
              JSON.stringify({comment: comment, target: selectedText})
          )
          .then((response_data) => {
            if (response_data !== null) {
              alertContent.handler({
                alertOpen: true,
                alertMessage: "Comments created!",
                type: "success",
              });
            } else {
              alertContent.handler({
                alertOpen: true,
                alertMessage: "Something went wrong!",
                type: "error",
              });
            }
          });
      setComment("");
      handleClose();
    }
  };

  return (
    <div>
      <Dialog
        open={openModalWindow}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Comment</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To leave a comment, please write text in field under.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Comment message"
            type="text"
            fullWidth
            error={fieldValidation(comment, ValidationService.validateComment)}
            value={comment}
            onChange={onChangeComment}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleLeave} color="primary">
            Leave
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
