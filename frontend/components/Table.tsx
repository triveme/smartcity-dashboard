'use client';

import { ReactElement, useState } from 'react';

import TableContent from '@/ui/Table/TableContent';
import TableHead from '@/ui/Table/TableHead';
import TableWrapper from '@/ui/Table/TableWrapper';
import TablePagination from '@/ui/Table/TablePagination';
import { GenericTableContentItem, TableConfig } from '@/types';

type TableProps<T> = {
  tableConfig: TableConfig<T>;
  tableContent: GenericTableContentItem<T>[];
  contentType: string;
  refetchData: () => void;
  iconColor: string;
  backgroundColor: string;
  hoverColor: string;
  borderColor: string;
  showSuffixText?: boolean;
  isTenant?: boolean;
};

export default function Table<T>(props: TableProps<T>): ReactElement {
  const {
    tableConfig,
    tableContent,
    contentType,
    refetchData,
    iconColor,
    backgroundColor,
    hoverColor,
    borderColor,
    showSuffixText,
    isTenant = false,
  } = props;

  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(
    tableConfig.columns[0].name as string,
  );
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [viewsPerPage, setCurrentViewsPerPage] = useState(
    tableConfig.viewsPerPage,
  );
  const handleColumnClick = (columnName: string): void => {
    if (columnName === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnName);
      setSortDirection('asc');
    }
  };
  const getSortedData = (): GenericTableContentItem<T>[] => {
    if (
      !sortColumn ||
      !Array.isArray(tableContent) ||
      tableContent.length === 0
    ) {
      return [];
    }
    if (!sortColumn) return tableContent;

    return [...tableContent].sort((a, b) => {
      const valueA = a[sortColumn as keyof T];
      const valueB = b[sortColumn as keyof T];

      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const sortedData = getSortedData();

  // Calculate the items for the current page
  const indexOfLastItem = currentPage * viewsPerPage;
  const indexOfFirstItem = indexOfLastItem - viewsPerPage;
  const currentItems =
    tableContent && tableContent.length > 0
      ? sortedData.slice(indexOfFirstItem, indexOfLastItem)
      : [];

  // Update page function for pagination
  const paginate = (pageNumber: number): void => setCurrentPage(pageNumber);

  // Calculate total number of pages
  const totalPages = Math.ceil(tableContent.length / viewsPerPage);

  // Callback for when a new viewsPerPage value is selected
  const handleViewsPerPageChange = (newViewsPerPage: string | number): void => {
    setCurrentViewsPerPage(newViewsPerPage as number);
    setCurrentPage(1);
  };

  return (
    <div>
      <TableWrapper>
        <TableHead
          columns={tableConfig.columns}
          onColumnClick={handleColumnClick}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          iconColor={iconColor}
          borderColor={borderColor}
        />
        <TableContent
          content={currentItems}
          columns={tableConfig.columns}
          contentType={contentType}
          refetchData={refetchData}
          borderColor={borderColor}
          hoverColor={hoverColor}
          showSuffixText={showSuffixText}
          isTenant={isTenant}
        />
      </TableWrapper>
      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        viewsPerPage={viewsPerPage}
        totalItems={tableContent.length}
        paginate={paginate}
        onViewsPerPageChange={handleViewsPerPageChange}
        iconColor={iconColor}
        backgroundColor={backgroundColor}
        hoverColor={hoverColor}
      />
    </div>
  );
}
