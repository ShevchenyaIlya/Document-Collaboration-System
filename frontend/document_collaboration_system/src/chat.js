import React, { useEffect, useState } from "react";
import "./css/base.css";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import MessageIcon from "@material-ui/icons/Message";
import ListItemText from "@material-ui/core/ListItemText";
import List from "@material-ui/core/List";
import { send_request } from "./send_request";

function Messages() {
  const [messages, setMessages] = useState([]);

  const updateMessages = () => {
    console.log("Update");
    send_request("GET", "messages").then((response) => {
      if (response !== null) {
        setMessages(response);
      }
    });
  };

  useEffect(() => {
    updateMessages();
    const timer = setInterval(() => updateMessages(), 5000);
    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="chat">
      <List component="nav" aria-label="main mailbox folders">
        {messages.map((message) => (
          <ListItem button key={message._id}>
            <ListItemIcon>
              <MessageIcon />
            </ListItemIcon>
            <ListItemText
              primary={message.user_from}
              secondary={message.send_date}
            />
            <ListItemText secondary={message.message} />
          </ListItem>
        ))}
      </List>
    </div>
  );
}

export default Messages;
