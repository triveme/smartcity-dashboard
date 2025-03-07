import { ReactElement, useState, useCallback } from 'react';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import '@/app/react-draft-wysiwyg.css';

type EditorComponentProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  borderColor: string;
  backgroundColor: string;
  fontColor: string;
};

export default function EditorComponent({
  value,
  onChange,
  error,
  borderColor,
  backgroundColor,
  fontColor,
}: EditorComponentProps): ReactElement {
  const [editorState, setEditorState] = useState(() => {
    if (value) {
      const contentBlock = htmlToDraft(value);
      if (contentBlock) {
        const contentState = ContentState.createFromBlockArray(
          contentBlock.contentBlocks,
        );
        return EditorState.createWithContent(contentState);
      }
    }
    return EditorState.createEmpty();
  });

  const handleEditorStateChange = useCallback(
    (newEditorState: EditorState) => {
      setEditorState(newEditorState);
      const content = newEditorState.getCurrentContent();
      if (!content.hasText() && content.getBlockMap().size <= 1) {
        onChange('');
      } else {
        onChange(draftToHtml(convertToRaw(content)));
      }
    },
    [onChange],
  );

  const errorStyle = {
    border: '4px solid #FFEB3B',
    borderRadius: '0.5rem',
  };

  return (
    <div className="block" style={error ? errorStyle : { color: fontColor }}>
      <Editor
        editorState={editorState}
        toolbarClassName="toolbarClassName"
        wrapperClassName="wrapperClassName"
        editorClassName="editorClassName"
        onEditorStateChange={handleEditorStateChange}
        editorStyle={{
          height: '200px',
          overflow: 'auto',
          backgroundColor: backgroundColor,
          color: fontColor,
          borderColor: borderColor,
        }}
        toolbarStyle={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          background: backgroundColor,
          backgroundColor: backgroundColor,
          color: fontColor,
          borderColor: borderColor,
          fontColor: fontColor,
        }}
      />
    </div>
  );
}
