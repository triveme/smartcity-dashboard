import { ReactElement, useState, useEffect } from 'react';
import WizardLabel from '@/ui/WizardLabel';
import WizardMultipleDropdownSelection from '@/ui/WizardMultipleDropdownSelection';

interface RoleSelectionProps {
  label: string;
  roleOptions: string[];
  selectedRoles: string[];
  onChange: (roles: string[]) => void;
  error?: string;
  iconColor: string;
  borderColor: string;
  backgroundColor: string;
}

export default function RoleSelection(props: RoleSelectionProps): ReactElement {
  const {
    label,
    roleOptions: propRoleOptions,
    selectedRoles,
    onChange,
    error,
    iconColor,
    borderColor,
    backgroundColor,
  } = props;
  const [role, setRole] = useState<string[]>([]);

  useEffect(() => {
    setRole(selectedRoles);
  }, [selectedRoles]);

  const handleRoleChange = (selectedOptions: string[]): void => {
    setRole(selectedOptions);
    onChange(selectedOptions);
  };

  return (
    <div className="flex flex-col w-full pb-4">
      <div className="flex flex-col w-full">
        <WizardLabel label={label} />
        <WizardMultipleDropdownSelection
          currentValue={role}
          selectableValues={propRoleOptions}
          onSelect={handleRoleChange}
          error={error}
          iconColor={iconColor}
          borderColor={borderColor}
          backgroundColor={backgroundColor}
        />
      </div>
    </div>
  );
}
