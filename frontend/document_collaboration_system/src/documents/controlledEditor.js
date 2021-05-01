import React, { Component } from "react";
import { convertFromRaw, convertToRaw, EditorState } from "draft-js";
import api from "../services/APIService";
import _ from "lodash";
import { Editor } from "react-draft-wysiwyg";
import CustomOption from "./customOption";

const styleMap = {
  COMMENT: {
    backgroundColor: "rgba(255, 255, 0, 0.25)",
  },
};

export default class ControlledEditor extends Component {
  constructor(props) {
    super(props);
    this.document_id = props.document;
    this.state = {
      editorState: EditorState.createEmpty(),
    };

    this.loadInitialContent = () => {
      api.getDocument(this.document_id).then((content) => {
        if (content === null) {
          this.props.history.push("/api");
        } else if (Object.keys(content.content).length !== 0) {
          if (content.status === "Archive") {
            this.props.setMode(true);
          }
          const DBEditorState = convertFromRaw(content.content);

          if (
            !_.isEqual(
              DBEditorState,
              this.state.editorState.getCurrentContent()
            )
          ) {
            const localState = EditorState.createWithContent(DBEditorState);

            let updateSelection = localState.getSelection().merge({
              anchorOffset: this.state.editorState
                .getSelection()
                .getAnchorKey(),
              focusOffset: this.state.editorState.getSelection().getFocusKey(),
              isBackward: false,
            });

            let newEditorStateWithSelection;
            if (this.state.editorState.getSelection().getHasFocus()) {
              newEditorStateWithSelection = EditorState.forceSelection(
                localState,
                updateSelection
              );
            } else {
              newEditorStateWithSelection = EditorState.acceptSelection(
                localState,
                updateSelection
              );
            }

            this.setState({
              editorState: newEditorStateWithSelection,
            });
          }
        }
      });
    };

    this.onEditorStateChange = (editorState) => {
      if (sessionStorage.getItem("token") === null) {
        this.props.history.push("/login");
      } else {
        const contentState = editorState.getCurrentContent();
        this.setState({
          editorState: editorState,
        });
        api
          .updateDocument(
            this.document_id,
            JSON.stringify(convertToRaw(contentState))
          )
          .then();
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
        toolbarCustomButtons={[
          <CustomOption
            setOpen={this.props.setOpen}
            setSelectedText={this.props.setSelectedText}
          />,
        ]}
        customStyleMap={styleMap}
        toolbar={{
          link: { showOpenOptionOnHover: true },
        }}
      />
    );
  }
}
