'use client';

import { ReactElement, useEffect, useState } from 'react';
import s from './Table/Table.module.css';
import { ChartData } from '@/types';
import { DUMMY_CHART_DATA } from '@/utils/objectHelper';

type Attribute = {
  key: string;
  value: string;
};

type TableProps = {
  data: ChartData[];
  fontColor: string;
  headerColor: string;
  oddRowColor: string;
  evenRowColor: string;
  selectedYearIndex?: number;
  selectedRows?: string[];
  hoveredRow?: string;
  selectedColor?: string;
  highlightedColor?: string;
  sendSelectedToDynamicTable?: (rows: string[]) => void;
  sendHoveredToDynamicTable?: (row: string) => void;
};

type TableTransformedDataItem = {
  values: [string, number][];
  color: string | undefined;
  attributes: Attribute[];
  id?: string;
};

export default function Table(props: TableProps): ReactElement {
  const {
    fontColor,
    headerColor,
    oddRowColor,
    evenRowColor,
    data,
    selectedYearIndex,
    selectedRows,
    hoveredRow,
    selectedColor,
  } = props;
  const [chosenYear, setChosenYear] = useState(2020);
  const [formatedData, setFormatedData] = useState<TableTransformedDataItem[]>(
    [],
  );
  const [selectedRowsInternal, setSelectedRowsInternal] = useState<string[]>(
    [],
  );
  const [hoveredRowInternal, setHoveredRowInternal] = useState<string>('');

  /**
   * Transforms a ChartData object into a tableTransformedDataItem.
   * Splits the `name` string into a base name and an array of attributes (key/value).
   */
  const transformObject = (obj: ChartData): TableTransformedDataItem => {
    const [baseName, rest] = obj.name.split('|').map((s) => s.trim());

    const attributes: { key: string; value: string }[] = [
      { key: 'Name', value: baseName },
    ];

    if (rest) {
      rest.split(';').forEach((part) => {
        const [key, value] = part.split(':').map((s) => s.trim());
        if (key && value) {
          attributes.push({ key, value });
        }
      });
    }

    const rValue: TableTransformedDataItem = {
      values: obj.values.map(([s, n]) => [s, n]),
      color: obj.color ?? undefined,
      attributes,
    };
    if (obj.id) rValue.id = obj.id;
    return rValue;
  };

  const onClickRow = (row: TableTransformedDataItem): void => {
    if (row.id && props.sendSelectedToDynamicTable) {
      const newSelectedRows =
        selectedRowsInternal.includes(row.id) ||
        selectedRowsInternal.includes('0' + row.id)
          ? selectedRowsInternal.filter(
              (item) => item != row.id && item != '0' + row.id,
            )
          : [...selectedRowsInternal, row.id];
      props.sendSelectedToDynamicTable(newSelectedRows);
    }
  };

  const onMouseEnterRow = (row: TableTransformedDataItem): void => {
    if (row.id && props.sendHoveredToDynamicTable) {
      setHoveredRowInternal(row.id);
      props.sendHoveredToDynamicTable(row.id);
    }
  };

  const onMouseExitRow = (row: TableTransformedDataItem): void => {
    if (
      row.id &&
      hoveredRowInternal == row.id &&
      props.sendHoveredToDynamicTable
    ) {
      setHoveredRowInternal('');
      props.sendHoveredToDynamicTable('');
    }
  };

  useEffect(() => {
    const dataToUse = data.length > 0 ? data : DUMMY_CHART_DATA;
    const transformed = dataToUse.map(transformObject);
    setFormatedData(transformed);

    if (selectedRows && selectedRows.length != selectedRowsInternal.length) {
      setSelectedRowsInternal(selectedRows);
    }

    let years = ['2020'];
    if (data && data.length > 0) {
      years = data[0].values.map((v) => v[0].split('-')[0]);
    }
    setChosenYear(Number(years[0]));
    if (hoveredRow) {
      setHoveredRowInternal(hoveredRow);
    }
  }, [data, selectedRows?.length, selectedYearIndex, hoveredRow]);

  const columnKeys = Array.from(
    new Set(
      formatedData.flatMap((item) => item.attributes.map((attr) => attr.key)),
    ),
  );

  return (
    <div className={s.tableContainer}>
      <div className={s.tableWrapper}>
        <table className={s.table}>
          <thead
            className={s.tableHeader}
            style={{ backgroundColor: headerColor }}
          >
            <tr className={s.row}>
              {columnKeys.map((key, i) => (
                <th
                  key={i}
                  className={s.headerCell}
                  style={{ color: fontColor }}
                >
                  {key}
                </th>
              ))}
              <th className={s.headerCell} style={{ color: fontColor }}>
                {chosenYear}
              </th>
            </tr>
          </thead>
          <tbody className={s.tableBody}>
            {formatedData.map((row, index) => {
              const attrObj: Record<string, string> = row.attributes.reduce(
                (acc, attr) => {
                  acc[attr.key] = attr.value;
                  return acc;
                },
                {} as Record<string, string>,
              );

              return (
                <tr
                  key={index}
                  className={s.tableRow}
                  style={{
                    backgroundColor: row.id
                      ? selectedRowsInternal.includes(row.id) ||
                        selectedRowsInternal.includes('0' + row.id)
                        ? selectedColor
                          ? selectedColor
                          : '#3388ff'
                        : index % 2 === 0
                          ? evenRowColor
                          : oddRowColor
                      : index % 2 === 0
                        ? evenRowColor
                        : oddRowColor,
                    color: fontColor,
                    border: row.id
                      ? hoveredRowInternal == row.id ||
                        hoveredRowInternal == '0' + row.id
                        ? '2px solid'
                        : 'inherit'
                      : 'inherit',
                  }}
                  onClick={() => onClickRow(row)}
                  onMouseEnter={() => onMouseEnterRow(row)}
                  onMouseLeave={() => onMouseExitRow(row)}
                >
                  {columnKeys.map((key, i) => (
                    <td key={i} className={s.nameCell}>
                      {attrObj[key] ?? '-'}
                    </td>
                  ))}
                  <td className={s.valueCell}>
                    {row.values[0][1] ? row.values[0][1] : 'Keine Daten'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
