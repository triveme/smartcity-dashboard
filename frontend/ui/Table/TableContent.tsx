import { ReactElement, ReactNode, useState } from 'react';
import { useParams, usePathname } from 'next/navigation';
import { useAuth } from 'react-oidc-context';
import { env } from 'next-runtime-env';

import { GenericTableContentItem, TableColumn } from '@/types';
import VisibilityDisplay from '@/ui/VisibilityDisplay';
import DashboardIcons from '@/ui/Icons/DashboardIcon';
import { deleteGenericItemById } from '@/utils/apiHelper';
import { useSnackbar } from '@/providers/SnackBarFeedbackProvider';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import { duplicateWidget } from '@/api/widget-service';
import { duplicateDashboard } from '@/api/dashboard-service';

type GenericTableContentItemWithId<T> = GenericTableContentItem<T> & {
  id?: string;
};

type TableContentProps<T> = {
  content: GenericTableContentItemWithId<T>[];
  columns: Array<TableColumn<T>>;
  contentType: string;
  refetchData: () => void;
  borderColor: string;
  hoverColor: string;
  showSuffixText?: boolean;
  isTenant?: boolean;
};

export default function TableContent<T>(
  props: TableContentProps<T>,
): ReactElement {
  const {
    content,
    columns,
    contentType,
    refetchData,
    borderColor,
    hoverColor,
    showSuffixText,
    isTenant = false,
  } = props;

  const [selectedItemId, setSelectedItemId] = useState<string>();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { openSnackbar } = useSnackbar();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isActiveTransaction, setIsActiveTransaction] = useState(false);

  const pathname = usePathname();
  const auth = useAuth();

  const params = useParams();
  const NEXT_PUBLIC_MULTI_TENANCY = env('NEXT_PUBLIC_MULTI_TENANCY');
  const BASEPATH = env('NEXT_PUBLIC_BASEPATH');
  const basepathRedirect = BASEPATH ? `${BASEPATH}/` : '';
  const tenant =
    NEXT_PUBLIC_MULTI_TENANCY === 'true'
      ? (params.tenant as string)
      : undefined;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderFunctions: { [key: string]: (item: any) => ReactNode } = {
    visibility: (item) => <VisibilityDisplay visibility={item.visibility} />,
  };

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const renderCell = (item: GenericTableContentItem<T>, column: keyof T) => {
    const renderFunc = renderFunctions[column as string];
    if (renderFunc) {
      return renderFunc(item);
    }
    return item[column] as ReactNode;
  };

  const handleRowClick = (itemId: string | undefined): void => {
    if (isTenant || !itemId) return;
    const itemUrl = `${basepathRedirect}${pathname}/edit?id=${itemId}`;
    window.open(itemUrl, '_self'); // Left-click behavior (same tab)
  };

  const handleRightClick = (
    event: React.MouseEvent,
    itemId: string | undefined,
  ): void => {
    event.preventDefault(); // Prevent default context menu
    if (isTenant || !itemId) return;
    const itemUrl = `${basepathRedirect}${pathname}/edit?id=${itemId}`;
    window.open(itemUrl, '_blank'); // Right-click or Ctrl+Click opens in new tab
  };

  const handleDeleteClick = async (): Promise<void> => {
    if (selectedItemId) {
      try {
        setIsActiveTransaction(true);
        await deleteGenericItemById(
          auth.user?.access_token,
          selectedItemId,
          contentType,
          tenant,
        );
        refetchData();
        openSnackbar('Element erfolgreich gelöscht!', 'success');
      } catch (error) {
        openSnackbar('Element konnte nicht gelöscht werden.', 'error');
      }
      setIsDeleteModalOpen(false);
      setIsActiveTransaction(false);
    }
  };

  const handleClickDeleteIcon = (
    event: React.MouseEvent,
    itemId: string | undefined,
  ): void => {
    event.stopPropagation();
    setIsDeleteModalOpen(true);
    if (itemId) setSelectedItemId(itemId);
  };

  const handleDuplicateClick = async (
    event: React.MouseEvent,
    itemId: string | undefined,
  ): Promise<void> => {
    event.stopPropagation();
    if (itemId) {
      try {
        setIsActiveTransaction(true);
        if (contentType === 'widget') {
          await duplicateWidget(auth.user?.access_token, itemId, tenant);
          openSnackbar('Widget erfolgreich dupliziert!', 'success');
          refetchData();
        } else if (contentType === 'dashboard') {
          await duplicateDashboard(auth.user?.access_token, itemId, tenant);
          openSnackbar('Dashboard erfolgreich dupliziert!', 'success');
          refetchData();
        }
        setIsActiveTransaction(false);
      } catch (error) {
        openSnackbar('Element konnte nicht dupliziert werden.', 'error');
        setIsActiveTransaction(false);
      }
    }
  };

  return (
    <>
      <tbody>
        {content.length < 1 ? (
          <tr>
            <th colSpan={100}>No Data Available</th>
          </tr>
        ) : (
          content.map((item, index) => (
            <tr
              key={`TableContent-${index}`}
              className="border-b cursor-pointer hover:bg-[#FABAAE]"
              style={{
                backgroundColor:
                  hoveredIndex === index ? hoverColor : 'transparent',
                borderColor: borderColor,
              }}
              onClick={() => handleRowClick(item.id)}
              onContextMenu={(event) => handleRightClick(event, item.id)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {columns.map((column) => (
                <td
                  key={`${column.name.toString()}-${index}`}
                  className="px-6 py-5"
                >
                  {renderCell(item, column.name)}
                </td>
              ))}
              <td>
                <button
                  className={`z-20 w-8 h-8 hover:bg-[#C7D2EE] rounded-lg ${
                    isActiveTransaction ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={isActiveTransaction}
                  onClick={(event): void =>
                    handleClickDeleteIcon(event, item.id)
                  }
                >
                  <DashboardIcons iconName="Trashcan" color="#FA4141" />
                </button>
              </td>
              <td>
                <button
                  className={`z-20 w-8 h-8 hover:bg-[#C7D2EE] rounded-lg ${
                    isActiveTransaction ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={isActiveTransaction}
                  onClick={async (event): Promise<void> =>
                    await handleDuplicateClick(event, item.id)
                  }
                >
                  <DashboardIcons iconName="File" color="#4CAF50" />
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>

      {isDeleteModalOpen && (
        <DeleteConfirmationModal
          onClose={() => setIsDeleteModalOpen(false)}
          onDelete={() => handleDeleteClick()}
          showSuffixText={showSuffixText}
        />
      )}
    </>
  );
}
