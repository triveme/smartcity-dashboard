import { ReactElement, useState, useCallback, useEffect } from 'react';
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

  // Create dynamic CSS for dropdown styling, needed for overwriting default css and to keep it dynamic
  useEffect(() => {
    const styleId = 'wysiwyg-dropdown-styles';
    let existingStyle = document.getElementById(styleId);

    if (!existingStyle) {
      existingStyle = document.createElement('style');
      existingStyle.id = styleId;
      document.head.appendChild(existingStyle);
    }

    existingStyle.innerHTML = `
      /* Dropdown wrapper styles */
      .rdw-dropdown-wrapper {
        background-color: ${backgroundColor} !important;
        border-color: ${borderColor} !important;
        color: ${fontColor} !important;
      }

      /* Dropdown caretdown styles */
      .rdw-dropdown-caretdown {
        border-top-color: ${fontColor} !important;
      }

      /* Dropdown selected text */
      .rdw-dropdown-selectedtext {
        color: ${fontColor} !important;
      }

      /* Dropdown optionwrapper (the dropdown menu) */
      .rdw-dropdown-optionwrapper {
        background-color: ${backgroundColor} !important;
        border-color: ${borderColor} !important;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
      }

      /* Individual dropdown options */
      .rdw-dropdownoption-default {
        background-color: ${backgroundColor} !important;
        color: ${fontColor} !important;
      }

      .rdw-dropdownoption-highlighted {
        background-color: ${borderColor} !important;
        color: ${fontColor} !important;
      }

      .rdw-dropdownoption-active {
        background-color: ${borderColor} !important;
        color: ${fontColor} !important;
      }

      /* Color picker dropdown */
      .rdw-colorpicker-modal {
        background-color: ${backgroundColor} !important;
        border-color: ${borderColor} !important;
      }

      /* Link modal */
      .rdw-link-modal {
        background-color: ${backgroundColor} !important;
        border-color: ${borderColor} !important;
      }

      .rdw-link-modal-input {
        background-color: ${backgroundColor} !important;
        border-color: ${borderColor} !important;
        color: ${fontColor} !important;
      }

      /* Emoji modal */
      .rdw-emoji-modal {
        background-color: ${backgroundColor} !important;
        border-color: ${borderColor} !important;
      }

      /* Image modal */
      .rdw-image-modal {
        background-color: ${backgroundColor} !important;
        border-color: ${borderColor} !important;
      }

      .rdw-image-modal-input {
        background-color: ${backgroundColor} !important;
        border-color: ${borderColor} !important;
        color: ${fontColor} !important;
      }

      /* Embedded modal */
      .rdw-embedded-modal {
        background-color: ${backgroundColor} !important;
        border-color: ${borderColor} !important;
      }

      .rdw-embedded-modal-input {
        background-color: ${backgroundColor} !important;
        border-color: ${borderColor} !important;
        color: ${fontColor} !important;
      }
    `;

    return () => {
      // Cleanup function to remove styles when component unmounts
      const styleElement = document.getElementById(styleId);
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, [backgroundColor, borderColor, fontColor]);

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

  console.log('backgroundColor', backgroundColor);
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
          maxWidth: '100%',
          overflow: 'auto',
          overflowWrap: 'break-word',
          wordWrap: 'break-word',
          wordBreak: 'break-word',
          background: backgroundColor,
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
