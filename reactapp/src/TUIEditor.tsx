import React from "react";
import "codemirror/lib/codemirror.css";
import "tui-editor/dist/tui-editor.min.css";
import "tui-editor/dist/tui-editor-contents.min.css";
import { Editor } from "@toast-ui/react-editor";

function TUIEditor(props: any) {
  let editorRef = React.createRef<any>();

  const handleChange = () => {
    const value = editorRef.current.getInstance().getValue();
    props.onChange(value);
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

export default TUIEditor;
