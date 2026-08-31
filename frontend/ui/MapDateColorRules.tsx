import { ReactElement } from 'react';
import { MapDateColorRule, Tab } from '@/types';
import WizardDropdownSelection from '@/ui/WizardDropdownSelection';
import WizardIntegerfield from '@/ui/WizardIntegerfield';
import WizardLabel from '@/ui/WizardLabel';
import ColorPickerComponent from '@/ui/ColorPickerComponent';
import IconSelection from '@/ui/Icons/IconSelection';
import CreateDashboardElementButton from '@/ui/Buttons/CreateDashboardElementButton';
import { getMapDateThreshold } from '@/utils/mapDateColorRules';

type MapDateColorRulesProps = {
  rules: MapDateColorRule[];
  handleTabChange: (update: Partial<Tab>) => void;
  iconColor: string;
  borderColor: string;
  backgroundColor: string;
  fontColor: string;
};

const anchorLabels: Record<MapDateColorRule['anchor'], string> = {
  now: 'jetzt',
  start_of_day: 'heute (Tagesbeginn)',
  start_of_week: 'dieser Woche (Montag)',
  start_of_month: 'diesen Monat (1. des Monats)',
};

const offsetDirectionLabels: Record<
  MapDateColorRule['offsetDirection'],
  string
> = {
  before: 'vor',
  after: 'nach',
};

const offsetUnitLabels: Record<MapDateColorRule['offsetUnit'], string> = {
  hour: 'Stunden',
  day: 'Tagen',
  week: 'Wochen',
  month: 'Monate',
};

const ruleDefaults: MapDateColorRule = {
  anchor: 'now',
  offsetValue: 0,
  offsetUnit: 'day',
  offsetDirection: 'before',
  color: '#FF0000',
  icon: '',
};

const dateTimeFormatter = new Intl.DateTimeFormat('de-DE', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

function fromLabel<T extends string>(
  labels: Record<T, string>,
  label: string,
): T {
  return Object.entries(labels).find(([, value]) => value === label)?.[0] as T;
}

export default function MapDateColorRules(
  props: MapDateColorRulesProps,
): ReactElement {
  const {
    rules,
    handleTabChange,
    iconColor,
    borderColor,
    backgroundColor,
    fontColor,
  } = props;

  const updateRule = (
    index: number,
    update: Partial<MapDateColorRule>,
  ): void => {
    handleTabChange({
      mapDateColorRules: rules.map((rule, ruleIndex) =>
        ruleIndex === index ? { ...rule, ...update } : rule,
      ),
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <WizardLabel label="Relative Datumsregeln" />
      {rules.map((rule, index) => (
        <div
          className="flex flex-col gap-3 border-2 rounded-lg p-3"
          style={{ borderColor }}
          key={`map-date-rule-${index}`}
        >
          <div className="grid grid-cols-3 gap-3">
            <div>
              <WizardLabel label="Abstand" />
              <WizardIntegerfield
                value={rule.offsetValue}
                onChange={(value) =>
                  updateRule(index, {
                    offsetValue: Math.max(0, Number(value) || 0),
                  })
                }
                borderColor={borderColor}
                backgroundColor={backgroundColor}
              />
            </div>
            <div className="col-span-2">
              <WizardLabel label="Einheit" />
              <WizardDropdownSelection
                currentValue={offsetUnitLabels[rule.offsetUnit]}
                selectableValues={Object.values(offsetUnitLabels)}
                onSelect={(value) =>
                  updateRule(index, {
                    offsetUnit: fromLabel(offsetUnitLabels, String(value)),
                  })
                }
                iconColor={iconColor}
                borderColor={borderColor}
                backgroundColor={backgroundColor}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <WizardLabel label="Richtung" />
              <WizardDropdownSelection
                currentValue={offsetDirectionLabels[rule.offsetDirection]}
                selectableValues={Object.values(offsetDirectionLabels)}
                onSelect={(value) =>
                  updateRule(index, {
                    offsetDirection: fromLabel(
                      offsetDirectionLabels,
                      String(value),
                    ),
                  })
                }
                iconColor={iconColor}
                borderColor={borderColor}
                backgroundColor={backgroundColor}
              />
            </div>
            <div className="col-span-2">
              <WizardLabel label="Referenz" />
              <WizardDropdownSelection
                currentValue={anchorLabels[rule.anchor]}
                selectableValues={Object.values(anchorLabels)}
                onSelect={(value) =>
                  updateRule(index, {
                    anchor: fromLabel(anchorLabels, String(value)),
                  })
                }
                iconColor={iconColor}
                borderColor={borderColor}
                backgroundColor={backgroundColor}
              />
            </div>
          </div>
          <output className="text-sm opacity-50">
            Gilt für Sensorzeiten vor dem{' '}
            {dateTimeFormatter.format(getMapDateThreshold(rule))}
          </output>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <div className="flex items-end justify-center">
              <ColorPickerComponent
                currentColor={rule.color}
                handleColorChange={(color) => updateRule(index, { color })}
                label="Farbe"
              />
            </div>
            <div className="col-span-2">
              <WizardLabel label="Icon" />
              <IconSelection
                activeIcon={rule.icon || ''}
                handleIconSelect={(icon) => updateRule(index, { icon })}
                iconColor={fontColor}
                borderColor={borderColor}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <div className="flex items-end">
              <CreateDashboardElementButton
                label="Regel entfernen"
                handleClick={() =>
                  handleTabChange({
                    mapDateColorRules: rules.filter(
                      (_, ruleIndex) => ruleIndex !== index,
                    ),
                  })
                }
              />
            </div>
          </div>
        </div>
      ))}
      <CreateDashboardElementButton
        label="Datumsregel hinzufügen"
        handleClick={() =>
          handleTabChange({
            mapDateColorRules: [...rules, { ...ruleDefaults }],
          })
        }
      />
    </div>
  );
}
