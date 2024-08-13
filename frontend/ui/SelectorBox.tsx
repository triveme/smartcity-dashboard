import { ReactElement } from 'react';

import { Widget } from '@/types';

type SelectorBoxProps = {
  selectedWidgets: Widget[];
  handleRemoveWidget: (items: Widget) => void;
  setSelectedWidgets: (items: Widget[]) => void;
};

export default function SelectorBox(props: SelectorBoxProps): ReactElement {
  const { selectedWidgets, handleRemoveWidget, setSelectedWidgets } = props;

  const removeWidget = (widgetToRemove: Widget): void => {
    // Remove from selection
    const updatedWidgets = selectedWidgets.filter(
      (widget) => widget.id !== widgetToRemove.id,
    );
    setSelectedWidgets(updatedWidgets);

    // Add back into selectable
    handleRemoveWidget(widgetToRemove);
  };

  return (
    <div>
      {selectedWidgets &&
        selectedWidgets.length > 0 &&
        selectedWidgets.map((widget: Widget, index: number) => (
          <div key={`selected-widget-${widget.name}-${index}`} className="p-1">
            <div className="p-2 w-full h-full rounded-lg border-4 border-[#59647D] text-rose-800 flex justify-between items-center content-center">
              {widget.name}
              <button
                onClick={(): void => {
                  removeWidget(widget);
                }}
              >
                &#x2715; {/* Unicode Multiplication X */}
              </button>
            </div>
          </div>
        ))}
    </div>
  );
}
