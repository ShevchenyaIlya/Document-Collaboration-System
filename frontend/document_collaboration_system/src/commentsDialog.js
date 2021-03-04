import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import CommentIcon from "@material-ui/icons/Comment";
import ListItemText from "@material-ui/core/ListItemText";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import React from "react";

export default function CommentsDialog({
  open,
  setOpen,
  comments,
  setOpenCommentEditor,
}) {
  const handleClose = () => {
    setOpen(false);
  };

  const listItemClick = (id) => () => {
    setOpenCommentEditor({
      open: true,
      comment: comments.find((element) => element._id === id),
    });
  };

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
            <ListItem
              button
              key={single_comment._id}
              onClick={listItemClick(single_comment._id)}
            >
              <ListItemIcon>
                <CommentIcon />
              </ListItemIcon>
              <ListItemText
                primary={single_comment.author}
                secondary={new Date(
                  single_comment.creation_date
                ).toDateString()}
              />
              <ListItemText
                primary="Selected:"
                secondary={single_comment.commented_text}
              />
              <ListItemText
                primary="Comment:"
                secondary={single_comment.comment}
              />
            </ListItem>
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
