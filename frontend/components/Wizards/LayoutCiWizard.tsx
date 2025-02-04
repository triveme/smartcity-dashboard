import React from 'react';
import ColorPickerComponent from '@/ui/ColorPickerComponent';
import WizardLabel from '@/ui/WizardLabel';
import WizardTextfield from '@/ui/WizardTextfield';
import HorizontalDivider from '@/ui/HorizontalDivider';
import CheckBox from '@/ui/CheckBox';
import { WizardErrors } from '@/types/errors';
import WizardDropdownSelection from '@/ui/WizardDropdownSelection';
import { menuArrowDirections, themes } from '@/utils/enumMapper';
import { CorporateInfo, menuArrowDirectionEnum, themeEnum } from '@/types';
import { getGeneralSettingsByTenant } from '@/api/general-settings-service';
import { useQuery } from '@tanstack/react-query';
import { getTenantOfPage } from '@/utils/tenantHelper';
import Cookies from 'js-cookie';

type Props = {
  corporateInfo: CorporateInfo | undefined;
  titleBar: string;
  setTitleBar: (value: string) => void;
  headerPrimaryColor: string;
  setHeaderPrimaryColor: (color: string) => void;
  headerSecondaryColor: string;
  setHeaderSecondaryColor: (color: string) => void;
  menuCornerColor: string;
  setMenuCornerColor: (color: string) => void;
  menuCornerFontColor: string;
  setMenuCornerFontColor: (color: string) => void;
  menuPrimaryColor: string;
  setMenuPrimaryColor: (color: string) => void;
  menuSecondaryColor: string;
  setMenuSecondaryColor: (color: string) => void;
  menuHoverColor: string;
  setMenuHoverColor: (color: string) => void;
  menuActiveColor: string;
  setMenuActiveColor: (color: string) => void;
  menuActiveFontColor: string;
  setMenuActiveFontColor: (color: string) => void;
  useColorTransitionHeader: boolean;
  setUseColorTransitionHeader: (value: boolean) => void;
  useColorTransitionMenu: boolean;
  setUseColorTransitionMenu: (value: boolean) => void;
  scrollbarColor: string;
  setScrollbarColor: (color: string) => void;
  scrollbarBackground: string;
  setScrollbarBackground: (color: string) => void;
  saveButtonColor: string;
  setSaveButtonColor: (color: string) => void;
  saveHoverButtonColor: string;
  setSaveHoverButtonColor: (color: string) => void;
  cancelButtonColor: string;
  setCancelButtonColor: (color: string) => void;
  cancelHoverButtonColor: string;
  setCancelHoverButtonColor: (color: string) => void;
  menuArrowDirection: string;
  setMenuArrowDirection: (direction: menuArrowDirectionEnum) => void;
  errors: WizardErrors | undefined;
  borderColor: string;
  backgroundColor: string;
  iconColor: string;
};

export default function LayoutCiWizard({
  corporateInfo,
  titleBar,
  setTitleBar,
  menuCornerColor,
  setMenuCornerColor,
  menuCornerFontColor,
  setMenuCornerFontColor,
  headerPrimaryColor,
  setHeaderPrimaryColor,
  headerSecondaryColor,
  setHeaderSecondaryColor,
  useColorTransitionHeader,
  setUseColorTransitionHeader,
  menuPrimaryColor,
  setMenuPrimaryColor,
  menuSecondaryColor,
  setMenuSecondaryColor,
  menuHoverColor,
  setMenuHoverColor,
  menuActiveColor,
  setMenuActiveColor,
  menuActiveFontColor,
  setMenuActiveFontColor,
  useColorTransitionMenu,
  setUseColorTransitionMenu,
  scrollbarColor,
  setScrollbarColor,
  scrollbarBackground,
  setScrollbarBackground,
  saveButtonColor,
  setSaveButtonColor,
  saveHoverButtonColor,
  setSaveHoverButtonColor,
  cancelButtonColor,
  setCancelButtonColor,
  cancelHoverButtonColor,
  setCancelHoverButtonColor,
  menuArrowDirection,
  setMenuArrowDirection,
  errors,
  borderColor,
  backgroundColor,
  iconColor,
}: Props): JSX.Element {
  const tenant = getTenantOfPage();
  const { data: generalSetting } = useQuery({
    queryKey: ['generalSettings'],
    queryFn: () => getGeneralSettingsByTenant(tenant),
  });

  return (
    <div className="flex flex-col w-full pb-2 px-4 transition-opacity duration-500 opacity-100">
      {!corporateInfo && (
        <>
          <div className="flex flex-row w-full">
            <div className="flex flex-col w-1/2 pb-2">
              <WizardLabel label="Thementitel" />
              <WizardTextfield
                value={titleBar ?? ''}
                onChange={(value: string | number): void =>
                  setTitleBar(value.toString())
                }
                error={errors && errors.titleError}
                borderColor={borderColor}
                backgroundColor={backgroundColor}
              />
            </div>
          </div>
          <HorizontalDivider />
        </>
      )}

      {corporateInfo && generalSetting?.allowThemeSwitching && (
        <>
          <div className="flex flex-row w-full">
            <div className="flex flex-col w-1/2 pb-2">
              <WizardLabel label="Thema" />
              <WizardDropdownSelection
                currentValue={
                  Cookies.get('isLightTheme') === 'true'
                    ? themeEnum.Light
                    : themeEnum.Dark
                }
                selectableValues={themes.map((option) => option.label)}
                onSelect={(theme: string | number): void => {
                  Cookies.set(
                    'isLightTheme',
                    theme === themeEnum.Light ? 'true' : 'false',
                    { path: '/' },
                  );
                  window.location.reload();
                }}
                iconColor={iconColor}
                borderColor={borderColor}
                backgroundColor={backgroundColor}
              />
            </div>
          </div>
          <HorizontalDivider />
        </>
      )}
      <div className="flex flex-col w-full pb-4">
        <WizardLabel label="Header" />
        <div className="flex flex-wrap w-full gap-y-8 pb-4">
          <div className="w-1/2">
            <ColorPickerComponent
              currentColor={headerPrimaryColor}
              handleColorChange={setHeaderPrimaryColor}
              label="Primäre Hintergrundfarbe"
            />
          </div>
          <div className="w-1/2">
            <ColorPickerComponent
              currentColor={headerSecondaryColor}
              handleColorChange={setHeaderSecondaryColor}
              label="Sekundäre Hintergrundfarbe"
            />
          </div>
          <div className="w-1/2">
            <CheckBox
              label={'Farbübergang '}
              value={useColorTransitionHeader}
              handleSelectChange={setUseColorTransitionHeader}
            />
          </div>
        </div>
        <div className="flex flex-wrap w-full gap-y-8">
          <div className="w-1/2">
            <ColorPickerComponent
              currentColor={menuCornerColor}
              handleColorChange={setMenuCornerColor}
              label="Eck Hintergrundfarbe"
            />
          </div>
          <div className="w-1/2">
            <ColorPickerComponent
              currentColor={menuCornerFontColor}
              handleColorChange={setMenuCornerFontColor}
              label="Eck Textfarbe"
            />
          </div>
        </div>
      </div>
      <HorizontalDivider />
      <div className="flex flex-col w-full">
        <WizardLabel label="Menü" />
        <div className="flex flex-wrap w-full gap-y-8">
          <div className="w-1/2">
            <ColorPickerComponent
              currentColor={menuPrimaryColor}
              handleColorChange={setMenuPrimaryColor}
              label="Primäre Hintergrundfarbe"
            />
          </div>
          <div className="w-1/2">
            <ColorPickerComponent
              currentColor={menuSecondaryColor}
              handleColorChange={setMenuSecondaryColor}
              label="Sekundäre Hintergrundfarbe"
            />
          </div>
          <div className="w-1/2">
            <CheckBox
              label={'Farbübergang'}
              value={useColorTransitionMenu}
              handleSelectChange={setUseColorTransitionMenu}
            />
          </div>
          <div className="w-1/2">
            <ColorPickerComponent
              currentColor={menuHoverColor}
              handleColorChange={setMenuHoverColor}
              label="Hover-Farbe"
            />
          </div>
          <div className="w-1/2">
            <ColorPickerComponent
              currentColor={menuActiveColor}
              handleColorChange={setMenuActiveColor}
              label="Aktive Hintergrundfarbe"
            />
          </div>
          <div className="w-1/2">
            <ColorPickerComponent
              currentColor={menuActiveFontColor}
              handleColorChange={setMenuActiveFontColor}
              label="Aktive Schriftfarbe"
            />
          </div>
          <div className="w-1/2">
            <WizardLabel label="Pfeilrichtung" />
            <WizardDropdownSelection
              currentValue={
                menuArrowDirections.find(
                  (option) => option.value === menuArrowDirection,
                )?.label || ''
              }
              selectableValues={menuArrowDirections.map(
                (option) => option.label,
              )}
              onSelect={(label: string | number): void => {
                const enumValue = menuArrowDirections.find(
                  (option) => option.label === label,
                )?.value;
                setMenuArrowDirection(enumValue as menuArrowDirectionEnum);
              }}
              iconColor={iconColor}
              borderColor={borderColor}
              backgroundColor={backgroundColor}
            />
          </div>
        </div>
      </div>
      <HorizontalDivider />
      <div className="flex flex-col w-full">
        <WizardLabel label="Scrollleiste" />
        <div className="flex flex-wrap w-full">
          <div className="w-1/2">
            <ColorPickerComponent
              currentColor={scrollbarColor}
              handleColorChange={setScrollbarColor}
              label="Farbe"
            />
          </div>
          <div className="w-1/2">
            <ColorPickerComponent
              currentColor={scrollbarBackground}
              handleColorChange={setScrollbarBackground}
              label="Hintergrundfarbe"
            />
          </div>
        </div>
      </div>
      <HorizontalDivider />
      <div className="flex flex-col w-full">
        <WizardLabel label="Schaltfläche" />
        <div className="flex flex-wrap w-full">
          <div className="w-1/2">
            <ColorPickerComponent
              currentColor={saveButtonColor}
              handleColorChange={setSaveButtonColor}
              label="Schaltfläche Speichern"
            />
          </div>
          <div className="w-1/2">
            <ColorPickerComponent
              currentColor={saveHoverButtonColor}
              handleColorChange={setSaveHoverButtonColor}
              label="Hover Schaltfläche Speichern"
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col w-full mt-2">
        <div className="flex flex-wrap w-full" style={{ marginBottom: 245 }}>
          <div className="w-1/2">
            <ColorPickerComponent
              currentColor={cancelButtonColor}
              handleColorChange={setCancelButtonColor}
              label="Schaltfläche Abbrechen"
            />
          </div>
          <div className="w-1/2">
            <ColorPickerComponent
              currentColor={cancelHoverButtonColor}
              handleColorChange={setCancelHoverButtonColor}
              label="Hover Schaltfläche Abbrechen"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
