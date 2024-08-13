import { ReactElement } from 'react';

import PageHeadline from '@/ui/PageHeadline';
import DeleteButton from '@/ui/Buttons/DeleteButton';
import CancelButton from '@/ui/Buttons/CancelButton';
import { getCorporateInfosWithLogos } from '@/app/actions';
import { useQuery } from '@tanstack/react-query';
import { getTenantOfPage } from '@/utils/tenantHelper';

type DeleteConfirmationModalProps = {
  onClose: () => void;
  onDelete: () => Promise<void>;
  showSuffixText?: boolean;
};

export default function DeleteConfirmationModal(
  props: DeleteConfirmationModalProps,
): ReactElement {
  const { onClose, onDelete, showSuffixText } = props;
  const tenant = getTenantOfPage();

  const { data } = useQuery({
    queryKey: ['corporate-info'],
    queryFn: () => getCorporateInfosWithLogos(tenant),
  });

  return (
    <div className="fixed z-50 inset-0 bg-[#1E1E1E] bg-opacity-70 flex flex-col justify-center items-center">
      <div
        className="p-10 rounded-lg w-2/4 flex flex-col justify-between"
        style={{
          backgroundColor: data?.panelPrimaryColor || '#2B3244',
          color: data?.panelFontColor,
        }}
      >
        <PageHeadline
          headline="Element löschen"
          fontColor={data?.panelFontColor}
        />
        <div
          className="flex flex-col w-full text-base pb-2"
          style={{ color: data?.widgetFontColor || '#FFFFFF' }}
        >
          <div>Sind Sie sicher, dass Sie dieses Element löschen möchten?</div>
          {showSuffixText && (
            <div>
              ACHTUNG Das Löschen der Datenanbindung könnte verwandte Widgets
              löschen
            </div>
          )}
        </div>
        <div className="flex justify-end pt-4 text-base">
          <CancelButton closeWindow={true} onClick={(): void => onClose()} />
          <DeleteButton onDeleteClick={(): Promise<void> => onDelete()} />
        </div>
      </div>
    </div>
  );
}
