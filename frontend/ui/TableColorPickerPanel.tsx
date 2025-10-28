import { Tab } from '@/types';
import { ReactElement } from 'react';
import ColorPickerComponent from './ColorPickerComponent';

type TableColorPickerPanelProps = {
  fontColor: string;
  headerColor: string;
  oddRowColor: string;
  evenRowColor: string;
  handleTabChange: (update: Partial<Tab>) => void;
  tab: Tab;
};

export default function TableColorPickerPanel(
  props: TableColorPickerPanelProps,
): ReactElement {
  const {
    fontColor,
    headerColor,
    oddRowColor,
    evenRowColor,
    handleTabChange,
    tab,
  } = props;

  const handleFontColorChange = (color: string): void => {
    handleTabChange({ tableFontColor: color });
  };

  const handleHeaderColorChange = (color: string): void => {
    handleTabChange({ tableHeaderColor: color });
  };

  const handleOddRowColorChange = (color: string): void => {
    handleTabChange({ tableOddRowColor: color });
  };

  const handleEvenRowColorChange = (color: string): void => {
    handleTabChange({ tableEvenRowColor: color });
  };

  return (
    <>
      <div className="flex gap-x-4 my-4">
        <ColorPickerComponent
          currentColor={tab.tableFontColor || fontColor}
          handleColorChange={handleFontColorChange}
          label="Schrift"
        />
        <ColorPickerComponent
          currentColor={tab.tableHeaderColor || headerColor}
          handleColorChange={handleHeaderColorChange}
          label="Kopfzeile"
        />
        <ColorPickerComponent
          currentColor={tab.tableOddRowColor || oddRowColor}
          handleColorChange={handleOddRowColorChange}
          label="Ungerade Zeilenfarbe"
        />
        <ColorPickerComponent
          currentColor={tab.tableEvenRowColor || evenRowColor}
          handleColorChange={handleEvenRowColorChange}
          label="Gerade Zeilenfarbe"
        />
      </div>
    </>
  );
}
