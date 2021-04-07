import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import CommentIcon from "@material-ui/icons/Comment";
import ListItemText from "@material-ui/core/ListItemText";
import React from "react";

export default function DialogListItem({ clickHandler, single_comment }) {
  const { creation_date, author, comment, commented_text } = single_comment;
  return (
    <ListItem button onClick={clickHandler}>
      <ListItemIcon>
        <CommentIcon />
      </ListItemIcon>
      <ListItemText
        primary={author}
        secondary={new Date(creation_date).toDateString()}
      />
      <ListItemText primary="Selected:" secondary={commented_text} />
      <ListItemText primary="Comment:" secondary={comment} />
    </ListItem>
  );
}
