'use client';

import { ReactElement, useState } from 'react';
import { useAuth } from 'react-oidc-context';

import WizardLabel from '@/ui/WizardLabel';
import WizardTextfield from '@/ui/WizardTextfield';
import SaveButton from '@/ui/Buttons/SaveButton';
import CancelButton from '@/ui/Buttons/CancelButton';
import { useSnackbar } from '@/providers/SnackBarFeedbackProvider';
import { Mail, supportRequestTypeEnum } from '@/types';
import { WizardErrors } from '@/types/errors';
import { sendMail } from '@/api/mail-service';
import WizardDropdownSelection from '@/ui/WizardDropdownSelection';

type SupportRequestWizardProps = {
  borderColor: string;
  backgroundColor: string;
  iconColor: string;
};

export default function SupportRequestWizard(
  props: SupportRequestWizardProps,
): ReactElement {
  const { borderColor, backgroundColor, iconColor } = props;
  const auth = useAuth();
  const { openSnackbar } = useSnackbar();
  const [supportType, setSupportType] = useState(
    Object.values(supportRequestTypeEnum)[0] as string,
  );
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<WizardErrors>({});

  const NEXT_PUBLIC_MAIL_TO = process.env.NEXT_PUBLIC_MAIL_TO as string;

  const generateSupportEmailTitle = (): string => {
    const titlePrefix = 'Smartcity Dashboard';
    let titleContent = '';

    if (supportType === supportRequestTypeEnum.supportRequest)
      titleContent = 'Supportanfrage';
    if (supportType === supportRequestTypeEnum.bugReport)
      titleContent = 'Fehlerbericht';
    if (supportType === supportRequestTypeEnum.suggestion)
      titleContent = 'Vorschläge';

    return `${titlePrefix} - ${titleContent}`;
  };

  const handleSendSupportRequest = async (): Promise<void> => {
    const supportRequest: Mail = {
      to: NEXT_PUBLIC_MAIL_TO,
      subject: generateSupportEmailTitle(),
      body: description,
    };

    const textfieldErrorMessages: string[] = [];
    const errorsOccured: WizardErrors = {};

    if (!description)
      errorsOccured.descriptionError = 'Beschreibung muss ausgefüllt werden!';

    if (Object.keys(errorsOccured).length) {
      for (const key in errorsOccured) {
        const error = errorsOccured[key] as string;
        textfieldErrorMessages.unshift(error);
      }
    }

    if (textfieldErrorMessages.length > 0) {
      for (const message of textfieldErrorMessages) {
        openSnackbar(message, 'warning');
      }
      setErrors(errorsOccured);
      return;
    }

    try {
      await sendMail(auth?.user?.access_token, supportRequest);
      openSnackbar('E-Mail erfolgreich gesendet!', 'success');
      setDescription(''); // clear input field after submit
    } catch (error) {
      console.error('error', error);
      openSnackbar('E-Mail konnte nicht gesendet werden!', 'error');
    }
  };

  return (
    <div>
      <div className="flex flex-col justify-start items-start content-center grow py-4">
        <div className="flex flex-col w-full pb-2">
          <WizardLabel label="Supporttyp" />
          <WizardDropdownSelection
            currentValue={supportType}
            onSelect={(value: string | number): void => {
              setSupportType(value as supportRequestTypeEnum);
            }}
            selectableValues={Object.values(supportRequestTypeEnum)}
            iconColor={iconColor}
            backgroundColor={backgroundColor}
            borderColor={borderColor}
          />
        </div>
        <div className="flex flex-col w-full pb-2">
          <WizardLabel label="Beschreibung" />
          <WizardTextfield
            value={description}
            componentType="textarea"
            onChange={(value: string | number): void =>
              setDescription(value.toString())
            }
            error={errors && errors.descriptionError}
            borderColor={borderColor}
            backgroundColor={backgroundColor}
          />
        </div>
      </div>

      <div className="flex justify-end py-4 mb-8">
        <CancelButton />
        <SaveButton handleSaveClick={handleSendSupportRequest} />
      </div>
    </div>
  );
}
