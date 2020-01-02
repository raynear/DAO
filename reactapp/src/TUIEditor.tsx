import React from "react";
import "codemirror/lib/codemirror.css";
import "tui-editor/dist/tui-editor.min.css";
import "tui-editor/dist/tui-editor-contents.min.css";
import { Editor, Viewer } from "@toast-ui/react-editor";

export function TUIEditor(props: any) {
  // console.log("TUI Editor props: ", props);
  let editorRef = React.createRef<any>();

  let handleChange = () => {
    const value = editorRef.current.getInstance().getValue();
    props.onChange(value);
  }
  if (!props.onChange) {
    handleChange = () => { return }
  }

  return (
    <Editor
      initialValue={props.initialValue}
      previewStyle={props.previewStyle}
      height={props.height}
      initialEditType={props.initialEditType}
      useCommandShortcut={props.useCommandShortcut}
      exts={props.exts}
      ref={editorRef}
      onChange={handleChange}
    />
  );
}

export function TUIViewer(props: any) {
  // console.log("TUI Viewer props: ", props);
  return (
    <Viewer
      initialValue={props.initialValue}
      height={props.height}
    />
  );
}
