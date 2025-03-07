'use client';

import { ReactElement } from 'react';

import TableContent from '@/ui/Table/TableContent';
import TableHead from '@/ui/Table/TableHead';
import TableWrapper from '@/ui/Table/TableWrapper';
import TablePagination from '@/ui/Table/TablePagination';
import { PaginatedResult, UserPagination } from '@/types/pagination';
import { GenericTableContentItem } from '@/types';

type PaginatedTableProps<T> = {
  paginatedResult: PaginatedResult<T>;
  userPagination: UserPagination;
  setUserPagination: (userPagination: UserPagination) => void;
  columns: Array<{ name: keyof T; displayName: string }>;
  contentType: string;
  refetchData: () => void;
  iconColor: string;
  backgroundColor: string;
  hoverColor: string;
  borderColor: string;
  showSuffixText?: boolean;
  isTenant?: boolean;
};

export default function PaginatedTable<T>(
  props: PaginatedTableProps<T>,
): ReactElement {
  const {
    paginatedResult,
    userPagination,
    setUserPagination,
    columns,
    contentType,
    refetchData,
    iconColor,
    backgroundColor,
    hoverColor,
    borderColor,
    showSuffixText = false,
    isTenant = false,
  } = props;
  const content = paginatedResult.data.map(
    (widget) => widget as GenericTableContentItem<T>,
  );
  // Update page function for pagination
  const paginate = (pageNumber: number): void => {
    setUserPagination({ ...userPagination, page: pageNumber });
  };
  const handleViewsPerPageChange = (viewsPerPage: string | number): void => {
    setUserPagination({ ...userPagination, limit: viewsPerPage as number });
  };

  return (
    <div>
      <TableWrapper>
        <TableHead
          columns={columns}
          iconColor={iconColor}
          borderColor={borderColor}
          sortColumn={null}
          sortDirection={'asc'}
        />
        <TableContent
          content={content}
          columns={columns}
          contentType={contentType}
          refetchData={refetchData}
          borderColor={borderColor}
          hoverColor={hoverColor}
          showSuffixText={showSuffixText}
          isTenant={isTenant}
        />
      </TableWrapper>
      <TablePagination
        currentPage={userPagination.page}
        totalPages={paginatedResult.meta.totalPages}
        viewsPerPage={userPagination.limit}
        totalItems={paginatedResult.meta.totalItems}
        paginate={paginate}
        onViewsPerPageChange={handleViewsPerPageChange}
        iconColor={iconColor}
        backgroundColor={backgroundColor}
        hoverColor={hoverColor}
      />
    </div>
  );
}
