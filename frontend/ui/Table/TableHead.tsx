import { ReactElement } from 'react';
import DashboardIcons from '../Icons/DashboardIcon';

type TableHeadProps<T> = {
  columns: Array<T>;
  onColumnClick?: (columnName: string) => void;
  sortColumn: string | null;
  sortDirection: 'asc' | 'desc';
  iconColor: string;
  borderColor: string;
};
export default function TableHead<T>(props: TableHeadProps<T>): ReactElement {
  const {
    columns,
    onColumnClick,
    sortColumn,
    sortDirection,
    iconColor,
    borderColor,
  } = props;

  return (
    <thead
      className="text-large capitalize border-b border-[#C7D2EE]"
      style={{ borderColor: borderColor }}
    >
      <tr>
        {columns.map((column, index) => (
          <th
            key={`TableHead-${column}-${index}`}
            scope="col"
            className="px-6 py-3 cursor-pointer"
            onClick={(): void => onColumnClick?.(column as string)}
          >
            <div className="inline-flex items-center">
              {column as string}
              <div
                className={`ml-1 ${
                  sortColumn === column ? 'visible' : 'invisible'
                }`}
              >
                {sortDirection === 'asc' ? (
                  <DashboardIcons iconName="ArrowUp" color={iconColor} />
                ) : (
                  <DashboardIcons iconName="ArrowDown" color={iconColor} />
                )}
              </div>
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );
}
