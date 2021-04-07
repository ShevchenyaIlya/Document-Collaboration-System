import React, {useCallback, useContext, useEffect, useState} from "react";
import _ from "lodash";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import TextField from "@material-ui/core/TextField";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import api from "../services/APIService";
import {fieldValidation, ValidationService} from "../services/ValidationService";
import ValidationError from "../errors/ValidationError";
import { AppContext } from "../";

export default function EditCommentDialog({
  openedComment,
  setOpen,
  comments,
  setComments,
  document,
}) {
  const [newCommentText, commentChange] = useState("");
  const {alertContent} = useContext(AppContext);

  const onChangeComment = useCallback(
    (event) => commentChange(event.target.value),
    []
  );

  const inputFieldValidation = () => {
    try {
          ValidationService.validateComment(newCommentText);
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

  const updateCommentHandler = () => {
    if (inputFieldValidation()) {
      api
          .updateComment(
              document,
              openedComment.comment._id,
              JSON.stringify({comment: newCommentText})
          )
          .then();
      const commentIndex = _.findIndex(comments, function (element) {
        return element._id === openedComment.comment._id;
      });
      comments[commentIndex].comment = newCommentText;
      setComments(comments);
      handleClose();
    }
  };

  const deleteCommentHandler = () => {
    api.deleteComment(document, openedComment.comment._id).then();
    _.remove(comments, function (element) {
      return element._id === openedComment.comment._id;
    });
    setComments(comments);
    handleClose();
  };

  const handleClose = () => {
    setOpen({ open: false, comment: null });
  };

  useEffect(() => {
    if (openedComment.comment !== null) {
      commentChange(openedComment.comment.comment);
    }
  }, [openedComment.comment]);

  return (
    <Dialog
      open={openedComment.open}
      fullWidth={true}
      maxWidth="sm"
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{"Comment details!"}</DialogTitle>
      <DialogContent>
        {openedComment.comment && (
          <>
            <DialogContentText>
              Author: {openedComment.comment.author}
            </DialogContentText>
            <DialogContentText>
              Date: {openedComment.comment.creation_date}
            </DialogContentText>
            <DialogContentText>
              Commented text: {openedComment.comment.commented_text}
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="comment"
              label="Comment"
              value={newCommentText}
              onChange={onChangeComment}
              error={fieldValidation(newCommentText, ValidationService.validateComment)}
              fullWidth
              disabled={
                openedComment.comment.author !==
                sessionStorage.getItem("username")
              }
            />
          </>
        )}
      </DialogContent>

      <DialogActions>
        {openedComment.comment &&
          openedComment.comment.author ===
            sessionStorage.getItem("username") && (
            <>
              <Button onClick={deleteCommentHandler} color="primary">
                Delete
              </Button>
              <Button onClick={updateCommentHandler} color="primary">
                Edit
              </Button>
            </>
          )}
        <Button onClick={handleClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
