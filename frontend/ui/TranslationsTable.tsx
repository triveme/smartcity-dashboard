import {
  GenericTableContentItem,
  TableColumn,
  ValueTranslation,
} from '@/types';
import { ReactElement, ReactNode } from 'react';
import VisibilityDisplay from './VisibilityDisplay';
import DashboardIcons from '@/ui/Icons/DashboardIcon';

type TableProps<T> = {
  tableConfig: Array<TableColumn<T>>;
  tableContent: GenericTableContentItem<T>[];
  iconColor: string;
  backgroundColor: string;
  borderColor: string;
  translationFilter: 'Tenant-spezifisch' | 'Allgemein';
  editingTranslationId: string | null;
  editingLabel: string;
  onEdit: (translation: ValueTranslation) => void;
  onDelete: (translation: ValueTranslation) => void;
  onEditLabelChange: (label: string) => void;
  onEditBlur: () => void;
  isCreating: boolean;
  newTenant: string;
  newRawValue: string;
  newLabel: string;
  onNewRawValueChange: (value: string) => void;
  onNewLabelChange: (value: string) => void;
  onSaveNewTranslation: () => void;
  onCancelNewTranslation: () => void;
};

const TranslationsTable = (
  props: TableProps<ValueTranslation>,
): ReactElement => {
  const {
    tableConfig,
    tableContent,
    iconColor,
    backgroundColor,
    borderColor,
    translationFilter,
    editingTranslationId,
    editingLabel,
    onEdit,
    onDelete,
    onEditLabelChange,
    onEditBlur,
    isCreating,
    newTenant,
    newRawValue,
    newLabel,
    onNewRawValueChange,
    onNewLabelChange,
    onSaveNewTranslation,
    onCancelNewTranslation,
  } = props;

  const renderFunctions: { [key: string]: (item: any) => ReactNode } = {
    visibility: (item) => <VisibilityDisplay visibility={item.visibility} />,
  };

  const showActions = translationFilter === 'Tenant-spezifisch';

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const renderCell = (
    item: GenericTableContentItem<ValueTranslation>,
    column: keyof ValueTranslation,
  ) => {
    const renderFunc = renderFunctions[column as string];
    if (renderFunc) {
      return renderFunc(item);
    }
    if (column === 'tenantId' && item[column] === null) {
      return 'default';
    }
    return item[column] as ReactNode;
  };

  return (
    <div className="relative h-screen mb-8 overflow-y-auto">
      <table className="w-full table-fixed text-sm text-left rtl:text-right">
        <thead
          className="text-large capitalize border-b border-[#C7D2EE]"
          style={{ borderColor: borderColor }}
        >
          <tr>
            {tableConfig.map((column, index) => (
              <th
                key={`TableHead-${column.name.toString()}-${index}`}
                scope="col"
                className="px-6 py-3"
              >
                <div className="inline-flex items-center">
                  {column.displayName}
                </div>
              </th>
            ))}
            {showActions && (
              <>
                <th className="w-16 px-2 py-3" />
                <th className="w-16 px-2 py-3" />
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {isCreating && (
            <tr className="border-b">
              {tableConfig.map((column) => (
                <td
                  key={`NewTranslation-${column.name.toString()}`}
                  className="h-[74px] px-6 py-5"
                >
                  {column.name === 'rawValue' ? (
                    <input
                      autoFocus
                      type="text"
                      value={newRawValue}
                      onChange={(event) =>
                        onNewRawValueChange(event.target.value)
                      }
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          onSaveNewTranslation();
                        }
                      }}
                      className="w-full rounded border border-[#C7D2EE] bg-transparent px-2 py-1 outline-none"
                      style={{ borderColor: borderColor }}
                    />
                  ) : column.name === 'label' ? (
                    <input
                      type="text"
                      value={newLabel}
                      onChange={(event) => onNewLabelChange(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          onSaveNewTranslation();
                        }
                      }}
                      className="w-full rounded border border-[#C7D2EE] bg-transparent px-2 py-1 outline-none"
                      style={{ borderColor: borderColor }}
                    />
                  ) : column.name === 'category' ? (
                    'sensor_attribute'
                  ) : (
                    newTenant
                  )}
                </td>
              ))}
              <td className="w-16 px-2 whitespace-nowrap">
                <button
                  title="Delete"
                  className="z-20 h-8 w-8 rounded-lg hover:bg-[#C7D2EE]"
                  onClick={onCancelNewTranslation}
                >
                  <DashboardIcons iconName="Trashcan" color="#FA4141" />
                </button>
              </td>
              <td className="w-16 px-2 whitespace-nowrap">
                <button
                  title="Save"
                  className="z-20 h-8 w-8 rounded-lg hover:bg-[#C7D2EE]"
                  onClick={onSaveNewTranslation}
                >
                  <DashboardIcons iconName="SaveIcon" color="#4CAF50" />
                </button>
              </td>
            </tr>
          )}
          {tableContent.length < 1 && !isCreating ? (
            <tr>
              <td
                colSpan={tableConfig.length + (showActions ? 2 : 0)}
                className="px-6 py-5"
              >
                No Data Available
              </td>
            </tr>
          ) : (
            tableContent.map((item, index) => (
              <tr key={`TableContent-${index}`} className="border-b">
                {tableConfig.map((column) => {
                  return (
                    <td
                      key={`${column.name.toString()}-${index}`}
                      className="h-[74px] px-6 py-5"
                    >
                      {column.name === 'label' &&
                      editingTranslationId === item.id ? (
                        <input
                          autoFocus
                          type="text"
                          value={editingLabel}
                          onChange={(event) =>
                            onEditLabelChange(event.target.value)
                          }
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              event.preventDefault();
                              event.currentTarget.blur();
                            }
                          }}
                          onBlur={onEditBlur}
                          className="w-full rounded border border-[#C7D2EE] bg-transparent px-2 py-1 outline-none"
                          style={{ borderColor: borderColor }}
                        />
                      ) : (
                        renderCell(item, column.name)
                      )}
                    </td>
                  );
                })}
                {showActions && (
                  <>
                    <td className="w-16 px-2 whitespace-nowrap">
                      <button
                        title="Delete"
                        className={`z-20 w-8 h-8 hover:bg-[#C7D2EE] rounded-lg ${
                          false ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={false}
                        onClick={() => onDelete(item as ValueTranslation)}
                      >
                        <DashboardIcons iconName="Trashcan" color="#FA4141" />
                      </button>
                    </td>
                    <td className="w-16 px-2 whitespace-nowrap">
                      <button
                        title={
                          editingTranslationId === item.id ? 'Save' : 'Edit'
                        }
                        className={`z-20 w-8 h-8 hover:bg-[#C7D2EE] rounded-lg ${
                          false ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={false}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() =>
                          editingTranslationId === item.id
                            ? onEditBlur()
                            : onEdit(item as ValueTranslation)
                        }
                      >
                        <DashboardIcons
                          iconName={
                            editingTranslationId === item.id
                              ? 'SaveIcon'
                              : 'Pen'
                          }
                          color="#4CAF50"
                        />
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TranslationsTable;
