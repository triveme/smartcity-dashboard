import {
  reportThresholdTriggerTypeEnum,
  ReportConfig,
  WidgetWithChildren,
} from '@/types';
import { WizardErrors } from '@/types/errors';
import WizardDropdownSelection from '@/ui/WizardDropdownSelection';
import WizardLabel from '@/ui/WizardLabel';
import WizardTextfield from '@/ui/WizardTextfield';
import React, { ReactElement } from 'react';

type ReportConfigWizardProps = {
  reportConfig: Partial<ReportConfig> | undefined;
  setReportConfig: (
    update: (prevReportConfig: ReportConfig) => ReportConfig,
  ) => void;
  widgetWithChildrenData?: WidgetWithChildren;
  errors?: WizardErrors;
  iconColor: string;
  borderColor: string;
  backgroundColor: string;
};

export default function ReportConfigWizard(
  props: ReportConfigWizardProps,
): ReactElement {
  const {
    reportConfig,
    setReportConfig,
    errors,
    iconColor,
    borderColor,
    backgroundColor,
  } = props;

  const handleReportConfigChange = (update: Partial<ReportConfig>): void => {
    setReportConfig(
      (prevReportConfig) =>
        ({
          ...prevReportConfig,
          ...update,
        }) as ReportConfig,
    );
  };

  return (
    <>
      <div className="flex flex-col w-full pb-2">
        <WizardLabel label="Report Name" />
        <WizardTextfield
          value={reportConfig?.propertyName || ''}
          onChange={(value: string | number): void =>
            handleReportConfigChange({ propertyName: value as string })
          }
          error={errors && errors.updateIntervalError}
          borderColor={borderColor}
          backgroundColor={backgroundColor}
        />
      </div>
      <div className="flex flex-col w-full pb-2">
        <WizardLabel label="Auslösender Sensorwert" />
        <WizardTextfield
          value={reportConfig?.threshold || ''}
          onChange={(value: string | number): void =>
            handleReportConfigChange({ threshold: value as string })
          }
          error={errors && errors.updateIntervalError}
          borderColor={borderColor}
          backgroundColor={backgroundColor}
        />
      </div>
      <div className="flex flex-col w-full pb-2">
        <WizardLabel label="Trigger" />
        <WizardDropdownSelection
          currentValue={reportConfig?.trigger || ''}
          selectableValues={Object.values(reportThresholdTriggerTypeEnum)}
          onSelect={(value): void => {
            handleReportConfigChange({
              trigger: value as reportThresholdTriggerTypeEnum,
            });
          }}
          iconColor={iconColor}
          borderColor={borderColor}
          backgroundColor={backgroundColor}
        />
      </div>
      <div className="flex flex-col w-full pb-2">
        <WizardLabel label="Empfangende Email Adressen (Liste mit Komma ',' trennen)" />
        <WizardTextfield
          value={(reportConfig?.recipients || []).join(', ')}
          onChange={(value: string | number): void =>
            handleReportConfigChange({
              recipients: (value as string).trim().split(','),
            })
          }
          error={errors && errors.updateIntervalError}
          borderColor={borderColor}
          backgroundColor={backgroundColor}
        />
      </div>
      <div className="flex flex-col w-full pb-2">
        <WizardLabel label="Email Text" />
        <WizardTextfield
          value={reportConfig?.mailText || ''}
          onChange={(value: string | number): void =>
            handleReportConfigChange({ mailText: value as string })
          }
          error={errors && errors.updateIntervalError}
          borderColor={borderColor}
          backgroundColor={backgroundColor}
        />
      </div>
    </>
  );
}
