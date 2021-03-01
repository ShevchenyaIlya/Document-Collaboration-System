import React, {createContext} from 'react';
import ReactDOM from 'react-dom';
import './css/index.css';
import App from './App';
import Home from './home';
import DocumentList from './documentList';
import Login from './login';
import reportWebVitals from './reportWebVitals';
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import CustomizedSnackbars from "./customAlert";
import InviteSnackbar from "./inviteAlert";
import {send_request} from "./send_request";

export const AppContext = createContext();

class Index extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      nickname: "",
      session_token: "",
      document: "",
      customAlert: {alertOpen: false, alertMessage: "", type: ""},
      notification: {open: false, setOpen: null, documentName: ""}
    };

    this.updateState = (field) => (value) => {
        this.setState({[field]: value});
    };

    this.loadNotification = () => {
      send_request("GET", "invite").then((response_data => {
        if (response_data !== null) {
          this.setState({
            notification: {
              open: true,
              setOpen: this.updateState("notification"),
              documentName: response_data.document,
            }
          });
        }
      }));
    };
  }

  componentDidMount() {
    this.updateState("session_token")(sessionStorage.getItem("token"));
    this.updateState("username")(sessionStorage.getItem("username"));
    this.timer = setInterval(() => this.loadNotification(), 10000);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
    this.timer = null;
  }

  render() {
    return (
        <AppContext.Provider value={{name: [this.state.nickname, this.updateState("nickname")], alertContent: {configurations: this.state.customAlert, handler: this.updateState("customAlert")}}}>
          <Router>
            <Switch>
              <Route exact path="/login">
                <Login/>
              </Route>
              <Route path="/document">
                <App document={this.state.document} setDocument={this.updateState("document")}/>
              </Route>
              <Route exact path="/documents">
                <DocumentList />
              </Route>
              <Route exact path="/">
                <Home setDocument={this.updateState("document")}/>
              </Route>
            </Switch>
          </Router>
          <CustomizedSnackbars/>
          <InviteSnackbar notification={this.state.notification}/>
        </AppContext.Provider>
    );
  }
}

ReactDOM.render(
  <Index/>,
  document.getElementById('root')
);

reportWebVitals();
