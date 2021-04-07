import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import DescriptionIcon from "@material-ui/icons/Description";
import ListItemText from "@material-ui/core/ListItemText";
import React from "react";

export default function DocumentListItem({ single_document, history }) {
  const {
    _id,
    creator,
    document_name,
    creation_date,
    status,
  } = single_document;

  const clickHandler = (event) => {
    history.push("document/" + single_document._id);
  };

  return (
    <ListItem button onClick={clickHandler}>
      <ListItemIcon>
        <DescriptionIcon />
      </ListItemIcon>
      <ListItemText primary={document_name} secondary={creation_date} />
      <ListItemText primary={"Creator"} secondary={creator} />
      <ListItemText secondary={status} />
      <ListItemText secondary={_id} />
    </ListItem>
  );
}
