import { ReactElement, ReactNode, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from 'react-oidc-context';

import { GenericTableContentItem, TableConfig } from '@/types';
import VisibilityDisplay from '@/ui/VisibilityDisplay';
import DashboardIcons from '@/ui/Icons/DashboardIcon';
import { deleteGenericItemById } from '@/utils/apiHelper';
import { useSnackbar } from '@/providers/SnackBarFeedbackProvider';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

type GenericTableContentItemWithId<T> = GenericTableContentItem<T> & {
  id?: string;
};

type TableContentProps<T> = {
  content: GenericTableContentItemWithId<T>[];
  config: TableConfig<T>;
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
    config,
    contentType,
    refetchData,
    borderColor,
    hoverColor,
    showSuffixText,
    isTenant = false,
  } = props;
  const [selectedItemId, setSelectedItemId] = useState<string>();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { openSnackbar } = useSnackbar(); // Use the snackbar hook
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const pathname = usePathname();
  const auth = useAuth();
  const { push } = useRouter();

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

  function handleRowClick(item: GenericTableContentItemWithId<T>): void {
    if (isTenant) return;

    if ('id' in item && item.id !== undefined) {
      push(`${pathname}/edit?id=${item.id}`);
    }
  }

  const handleDeleteClick = async (): Promise<void> => {
    if (selectedItemId) {
      try {
        await deleteGenericItemById(
          auth.user?.access_token,
          selectedItemId,
          contentType,
        );
        refetchData();
        openSnackbar('Element erfolgreich gelöscht!', 'success');
      } catch (error) {
        openSnackbar('Element konnte nicht gelöscht werden.', 'error');
      }

      setIsDeleteModalOpen(false);
    }
  };

  function handleClickDeleteIcon(
    event: React.MouseEvent,
    itemId: string | undefined,
  ): void {
    event.stopPropagation();
    setIsDeleteModalOpen(true);

    if (itemId) {
      setSelectedItemId(itemId);
    }
  }

  const handleMouseEnter = (index: number): void => {
    setHoveredIndex(index);
  };

  const handleMouseLeave = (): void => {
    setHoveredIndex(null);
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
              className="border-b hover:bg-[#FABAAE] cursor-pointer"
              onClick={(): void => handleRowClick(item)}
              style={{
                backgroundColor:
                  hoveredIndex === index ? hoverColor : 'transparent',
                borderColor: borderColor,
              }}
              onMouseEnter={(): void => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
            >
              {config.columns.map((column) => (
                <td key={`${column.toString()}-${index}`} className="px-6 py-5">
                  {renderCell(item, column)}
                </td>
              ))}
              <td>
                <button
                  className="z-20 w-8 h-8 hover:bg-[#C7D2EE] rounded-lg"
                  onClick={(event): void =>
                    handleClickDeleteIcon(event, item.id)
                  }
                >
                  <DashboardIcons iconName="Trashcan" color="#FA4141" />
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>

      {isDeleteModalOpen && (
        <DeleteConfirmationModal
          onClose={(): void => setIsDeleteModalOpen(false)}
          onDelete={(): Promise<void> => handleDeleteClick()}
          showSuffixText={showSuffixText}
        />
      )}
    </>
  );
}
