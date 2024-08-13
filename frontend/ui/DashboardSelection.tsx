import { Dashboard } from '@/types';
import { ReactElement } from 'react';

type DashboardSelectionProps = {
  currentValue: Dashboard | undefined;
  selectableValues: Dashboard[];
  onSelect: (value: Dashboard) => void;
};

export default function DashboardSelection(
  props: DashboardSelectionProps,
): ReactElement {
  const { currentValue, selectableValues, onSelect } = props;

  const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    const index = parseInt(event.target.value, 10);
    const selectedDashboard = selectableValues[index];
    onSelect(selectedDashboard);
  };

  return (
    <div className="h-14 border-4 border-[#59647D] rounded-lg">
      <select
        className="px-3 text-rose-800 text-base bg-transparent h-full w-full"
        value={currentValue?.id || selectableValues[0].id!}
        onChange={handleSelect}
      >
        {selectableValues.map((value) => (
          <option
            key={value.id}
            className="bg-[#2B3244] text-base"
            value={value.id!}
          >
            {value.name}
          </option>
        ))}
      </select>
    </div>
  );
}
