import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import List from "@material-ui/core/List";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import React, { useCallback } from "react";
import DialogListItem from "./dialogListItem";

export default function CommentsDialog({
  open,
  setOpen,
  comments,
  setOpenCommentEditor,
}) {
  const handleClose = () => {
    setOpen(false);
  };

  const onClickListItem = useCallback(
    (id) => () => {
      setOpenCommentEditor({
        open: true,
        comment: comments.find((element) => element._id === id),
      });
    },
    [comments, setOpenCommentEditor]
  );

  return (
    <Dialog
      open={open}
      fullWidth={true}
      maxWidth="md"
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {"Check comments for this document!"}
      </DialogTitle>
      <DialogContent>
        <List component="nav" aria-label="main mailbox folders">
          {comments.map((single_comment) => (
            <DialogListItem
              key={single_comment._id}
              clickHandler={onClickListItem(single_comment._id)}
              single_comment={single_comment}
            />
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
