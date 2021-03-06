import React, { createContext } from "react";
import ReactDOM from "react-dom";
import "./css/index.css";
import App from "./App";
import Home from "./home";
import DocumentList from "./documentList";
import Login from "./login";
import reportWebVitals from "./reportWebVitals";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import CustomizedSnackbars from "./customAlert";
import InviteSnackbar from "./inviteAlert";
import api from "./service";
import Messages from "./chat";
import { Error404 } from "./error";
import Header from "./header";
import Navbar from "./navbar";
import Footer from "./footer";

export const AppContext = createContext();

class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      nickname: "",
      session_token: "",
      document: "",
      customAlert: { alertOpen: false, alertMessage: "", type: "" },
      notification: {
        open: false,
        setOpen: null,
        documentName: "",
        inviteId: "",
      },
    };

    this.updateState = (field) => (value) => {
      this.setState({ [field]: value });
    };

    this.loadNotification = () => {
      api.getInvite().then((response_data) => {
        if (response_data !== null && typeof response_data.document_id !== "undefined") {
          this.setState({
            notification: {
              open: true,
              setOpen: this.updateState("notification"),
              documentName: response_data.document_name,
              documentId: response_data.document_id,
              inviteId: response_data.invite_id,
            },
          });
        }
      });
    };
  }

  componentDidMount() {
    this.setState({
      session_token: sessionStorage.getItem("token"),
      username: sessionStorage.getItem("username")
    });
    this.timer = setInterval(() => this.loadNotification(), 10000);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
    this.timer = null;
  }

  render() {
    return (
      <AppContext.Provider
        value={{
          name: [this.state.nickname, this.updateState("nickname")],
          alertContent: {
            configurations: this.state.customAlert,
            handler: this.updateState("customAlert"),
          },
        }}
      >
        <Router>
          <Switch>
            <Route exact path="/login">
              <Login />
            </Route>
            <Route path="/api">
              <Header />
              <Navbar />
              <Switch>
                <Route path="/api/document">
                  <App
                    document={this.state.document}
                    setDocument={this.updateState("document")}
                  />
                </Route>
                <Route path="/api/messages">
                  <Messages />
                </Route>
                <Route exact path="/api/documents">
                  <DocumentList />
                </Route>
                <Route exact path="/api/">
                  <Home setDocument={this.updateState("document")} />
                </Route>
              </Switch>
              <Footer />
            </Route>
            <Redirect from="/" to="/api" exact />
            <Route path="*">
              <Error404 />
            </Route>
          </Switch>
        </Router>
        <CustomizedSnackbars />
        <InviteSnackbar notification={this.state.notification} />
      </AppContext.Provider>
    );
  }
}

ReactDOM.render(<Index />, document.getElementById("root"));

reportWebVitals();
