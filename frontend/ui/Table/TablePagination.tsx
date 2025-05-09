import React, { ReactElement, useState } from 'react';

import DropdownSelection from '../DropdownSelection';
import { useQuery } from '@tanstack/react-query';
import { getCorporateInfosWithLogos } from '@/app/actions';
import { getTenantOfPage } from '@/utils/tenantHelper';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

type TablePaginationProps = {
  currentPage: number;
  totalPages: number;
  viewsPerPage: number;
  totalItems: number;
  paginate: (pageNumber: number) => void;
  onViewsPerPageChange: (newViewsPerPage: string | number) => void;
  iconColor: string;
  backgroundColor: string;
  hoverColor: string;
};

export default function TablePagination(
  props: TablePaginationProps,
): ReactElement {
  const {
    currentPage,
    totalPages,
    viewsPerPage,
    totalItems,
    paginate,
    onViewsPerPageChange,
    iconColor,
    backgroundColor,
    hoverColor,
  } = props;
  const tenant = getTenantOfPage();

  const [isPrevHovered, setIsPrevHovered] = useState(false);
  const [isNextHovered, setIsNextHovered] = useState(false);

  const { data } = useQuery({
    queryKey: ['corporate-info'],
    queryFn: () => getCorporateInfosWithLogos(tenant),
    enabled: false,
  });

  const prevButtonStyle = {
    backgroundColor: isPrevHovered
      ? data?.headerSecondaryColor || '#3D4760'
      : data?.headerPrimaryColor || '#3D4760',
    color: data?.headerFontColor,
  };

  const nextButtonStyle = {
    backgroundColor: isNextHovered
      ? data?.headerSecondaryColor || '#3D4760'
      : data?.headerPrimaryColor || '#3D4760',
    color: data?.headerFontColor,
  };

  const fontStyle = {
    color: data?.dashboardFontColor || '#FFF',
  };

  // Calculate the range of items currently displayed
  const startIndex = (currentPage - 1) * viewsPerPage + 1;
  const endIndex = totalItems
    ? Math.min(startIndex + viewsPerPage - 1, totalItems)
    : 0;

  // Determine if there are previous and next pages
  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  return (
    <div
      className="w-full flex justify-end gap-4 p-4 items-center content-center mb-8"
      style={fontStyle}
    >
      <div>Einträge pro Seite:</div>
      <DropdownSelection
        currentValue={viewsPerPage}
        selectableValues={[5, 10, 20, 50, 100]}
        onSelect={onViewsPerPageChange}
        iconColor={iconColor}
        backgroundColor={backgroundColor}
        hoverColor={hoverColor}
      />
      <div>
        {startIndex}-{endIndex} von {totalItems}
      </div>
      <div>
        <div
          className="rounded-lg flex items-center"
          style={{ background: backgroundColor, color: data?.headerFontColor }}
        >
          {hasPreviousPage && (
            <button
              onClick={(): void => paginate(currentPage - 1)}
              className="p-2 rounded-lg"
              onMouseEnter={(): void => setIsPrevHovered(true)}
              onMouseLeave={(): void => setIsPrevHovered(false)}
              style={prevButtonStyle}
            >
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>
          )}
          <div className="p-2">{currentPage}</div>
          {hasNextPage && (
            <button
              onClick={(): void => paginate(currentPage + 1)}
              className="p-2 rounded-lg"
              onMouseEnter={(): void => setIsNextHovered(true)}
              onMouseLeave={(): void => setIsNextHovered(false)}
              style={nextButtonStyle}
            >
              <FontAwesomeIcon icon={faArrowRight} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
