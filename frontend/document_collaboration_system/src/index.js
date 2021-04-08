import React, {createContext, useState} from "react";
import ReactDOM from "react-dom";
import "./css/index.css";
import App from "./App";
import Home from "./home";
import DocumentList from "./documents/documentList";
import Login from "./auth/login";
import reportWebVitals from "./reportWebVitals";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import CustomizedSnackbars from "./customAlert";
import InviteSnackbar from "./invites/inviteAlert";
import api from "./services/APIService";
import Messages from "./messages/chat";
import { Error404 } from "./common/error";
import Header from "./common/header";
import Navbar from "./common/navbar";
import Main from "./main";
import Profile from "./auth/profile";
import { ThemeProvider } from "@material-ui/styles";
import {
  createMuiTheme
} from "@material-ui/core";
import CssBaseline from '@material-ui/core/CssBaseline';
import Brightness7Icon from "@material-ui/icons/Brightness7";
import Brightness3Icon from "@material-ui/icons/Brightness3";

export const AppContext = createContext();

export default function Application() {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  const [darkState, setDarkState] = useState(prefersDark);
  const palletType = darkState ? "dark" : "light";
  const icon = darkState ? <Brightness7Icon /> : <Brightness3Icon />;

  const darkTheme = createMuiTheme({
    palette: {
      type: palletType,
    }
  });

  const handleThemeChange = () => {
    setDarkState(!darkState);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline/>
      <Index changeTheme={handleThemeChange} icon={icon}/>
    </ThemeProvider>
  );
}

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
        if (
          response_data !== null &&
          typeof response_data.document_id !== "undefined"
        ) {
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
      username: sessionStorage.getItem("username"),
    });
    // this.timer = setInterval(() => this.loadNotification(), 10000);
  }

  componentWillUnmount() {
    // clearInterval(this.timer);
    // this.timer = null;
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
          <div style={{ margin: "auto", minHeight: "800px" }}>
            <Header />
            <Navbar
              afterLoginUsername={this.state.nickname}
              setAfterLoginUsername={this.updateState("nickname")}
              changeTheme={this.props.changeTheme}
              icon={this.props.icon}
            />
            <main>
              <Switch>
                <Route exact path="/login">
                  <Login setUsername={this.updateState("nickname")} />
                </Route>
                <Route exact path="/profile">
                  <Profile />
                </Route>
                <Route path="/api">
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
                </Route>
                <Route exact path="/">
                  <Main />
                </Route>
                <Route path="*">
                  <Error404 />
                </Route>
              </Switch>
            </main>
          </div>
        </Router>
        <CustomizedSnackbars />
        <InviteSnackbar notification={this.state.notification} />
      </AppContext.Provider>
    );
  }
}

ReactDOM.render(<Application />, document.getElementById("root"));

reportWebVitals();
