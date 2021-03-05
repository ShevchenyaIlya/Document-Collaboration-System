import React, { useCallback, useContext, useEffect, useState } from "react";
import "./css/base.css";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import MessageIcon from "@material-ui/icons/Message";
import ListItemText from "@material-ui/core/ListItemText";
import List from "@material-ui/core/List";
import api from "./service";
import { AppContext } from "./";
import _ from "lodash";
import { useHistory } from "react-router-dom";

function Messages() {
  const [messages, setMessages] = useState([]);
  const { alertContent } = useContext(AppContext);
  const history = useHistory();

  const updateMessages = useCallback(() => {
    api.getMessages().then((response) => {
      if (response !== null) {
        if (!_.isEqual(response, messages)) {
          setMessages(response);
        }
      }
    });
  }, [messages]);

  useEffect(() => {
    if (sessionStorage.getItem("token") === null) {
      alertContent.handler({
        alertOpen: true,
        alertMessage: "Please login!",
        type: "warning",
      });
      history.push("/login");
    } else {
      updateMessages();
      const timer = setInterval(() => updateMessages(), 10000);
      return () => {
        clearInterval(timer);
      };
    }
  }, [alertContent, history, updateMessages]);

  return (
    <div className="chat">
      <List component="nav" aria-label="main mailbox folders">
        {_.orderBy(messages, ["send_date"], ["desc"]).map((message) => (
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
