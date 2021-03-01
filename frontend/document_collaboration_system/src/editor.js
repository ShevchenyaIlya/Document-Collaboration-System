import React, {Component, useState} from "react";
import {convertToRaw, convertFromRaw, EditorState} from "draft-js";
import {Editor} from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import {Paper} from "@material-ui/core";
import {send_request} from "./send_request";
import {useHistory} from "react-router-dom";
import CustomMenu from "./menu";
import FormDialog from "./placeCommentDialog";
import {CommentButton} from "./commentWidgets";
import CustomOption from "./customOption";
import _ from "lodash";


const styleMap = {
  'COMMENT': {
    backgroundColor: 'rgba(255, 255, 0, 0.25)',
  },
};


class ControlledEditor extends Component {
  constructor(props) {
    super(props);
    this.document_id = props.document;
    this.state = {
      editorState: EditorState.createEmpty(),
    };

    this.loadInitialContent = () => {
      send_request("GET", "document/" + this.document_id).then((content) => {
        if (content === null) {
          this.props.history.push("/");
        }
        else if (Object.keys(content.content).length !== 0) {
          if (content.status === "Archive") {
            this.props.setMode(true);
          }
          const DBEditorState = convertFromRaw(content.content);

          if (!_.isEqual(DBEditorState, this.state.editorState.getCurrentContent())) {
            const localState = EditorState.createWithContent(DBEditorState);

            let updateSelection = localState.getSelection().merge({
              anchorOffset: this.state.editorState.getSelection().getAnchorKey(),
              focusOffset: this.state.editorState.getSelection().getFocusKey(),
              isBackward: false,
            });

            let newEditorStateWithSelection;
            if (this.state.editorState.getSelection().getHasFocus()) {
              newEditorStateWithSelection = EditorState.forceSelection(localState, updateSelection);
            } else {
              newEditorStateWithSelection = EditorState.acceptSelection(localState, updateSelection);
            }

            this.setState({
              editorState: newEditorStateWithSelection
            });
          }
        }
      });
    };

    this.onEditorStateChange = (editorState) => {
      if (sessionStorage.getItem("token") === null) {
        this.props.history.push("/login");
      }
      else {
        const contentState = editorState.getCurrentContent();
        this.setState({
          editorState: editorState
        });
        send_request("PUT", "document/" + this.document_id, JSON.stringify(convertToRaw(contentState))).then();
      }
    };
  }

  componentDidMount() {
    this.loadInitialContent();
    this.timer = setInterval(() => this.loadInitialContent(), 5000);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
    this.timer = null;
  }

  render() {
    const { editorState } = this.state;
    return (
        <Editor
          editorState={editorState}
          useSelect="none"
          wrapperClassName="demo-wrapper"
          editorClassName="demo-editor"
          onEditorStateChange={this.onEditorStateChange}
          readOnly={this.props.readOnly}
          toolbarCustomButtons={[<CustomOption setOpen={this.props.setOpen}
                                               setSelectedText={this.props.setSelectedText}/>]}
          customStyleMap={styleMap}
          toolbar={{
            link: { showOpenOptionOnHover: true},
          }}
        />
    );
  }
}

function DocumentEditor({document}) {
  let [readOnlyDocument, setMode] = useState(false);
  const [openModalWindow, setOpen] = useState(false);
  const [selectedText, setSelectedText] = useState(false);
  const history = useHistory();

  return (
      <>
        <FormDialog openModalWindow={openModalWindow} setOpen={setOpen} document={document} selectedText={selectedText}/>
        <CustomMenu document={document} readOnly={readOnlyDocument} setMode={setMode}/>
        <CommentButton document={document}/>
        <Paper elevation={3} className="editorContainer">
          <ControlledEditor document={document} history={history} readOnly={readOnlyDocument}
                            setSelectedText={setSelectedText} setMode={setMode} setOpen={setOpen}/>
        </Paper>
      </>
  );
}

export default DocumentEditor;