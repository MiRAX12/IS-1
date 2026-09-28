import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { formatBoolean, formatDate, formatNumber, formatValue } from '../format';
import type { Flat, SortDirection, SortField } from '../types';

interface Column {
  field: SortField;
  label: string;
  render: (flat: Flat) => ReactNode;
  numeric?: boolean;
}

const COLUMNS: Column[] = [
  { field: 'id', label: 'ID', render: (f) => <Link to={`/flats/${f.id}`}>{f.id}</Link>, numeric: true },
  { field: 'name', label: 'Название', render: (f) => f.name },
  { field: 'coordinatesX', label: 'X', render: (f) => formatNumber(f.coordinates.x), numeric: true },
  { field: 'coordinatesY', label: 'Y', render: (f) => f.coordinates.y, numeric: true },
  { field: 'creationDate', label: 'Дата создания', render: (f) => formatDate(f.creationDate) },
  { field: 'area', label: 'Площадь', render: (f) => formatNumber(f.area), numeric: true },
  { field: 'price', label: 'Цена', render: (f) => formatValue(f.price), numeric: true },
  { field: 'balcony', label: 'Балкон', render: (f) => formatBoolean(f.balcony) },
  { field: 'timeToMetroOnFoot', label: 'До метро, мин', render: (f) => formatValue(f.timeToMetroOnFoot), numeric: true },
  { field: 'numberOfRooms', label: 'Комнат', render: (f) => f.numberOfRooms, numeric: true },
  { field: 'floor', label: 'Этаж', render: (f) => f.floor, numeric: true },
  { field: 'furnish', label: 'Отделка', render: (f) => f.furnish },
  { field: 'view', label: 'Вид', render: (f) => formatValue(f.view) },
  { field: 'houseName', label: 'Дом', render: (f) => formatValue(f.house.name) },
  { field: 'houseYear', label: 'Год дома', render: (f) => formatValue(f.house.year), numeric: true },
  { field: 'houseNumberOfFloors', label: 'Этажей в доме', render: (f) => formatValue(f.house.numberOfFloors), numeric: true },
];

interface FlatTableProps {
  flats: Flat[];
  sort?: { field: SortField; direction: SortDirection };
  onSort?: (field: SortField) => void;
  actions?: (flat: Flat) => ReactNode;
  /** Строка под заголовком, например с полями фильтров. Получает поле колонки. */
  headerRow?: (field: SortField) => ReactNode;
  emptyText?: string;
}

export function FlatTable({ flats, sort, onSort, actions, headerRow, emptyText = 'Квартир нет' }: FlatTableProps) {
  return (
    <div className="table-scroll">
      <table className="table">
        <thead>
          <tr>
            {COLUMNS.map((column) => {
              const direction = sort && sort.field === column.field ? sort.direction : null;
              return (
                <th key={column.field} aria-sort={direction ? (direction === 'asc' ? 'ascending' : 'descending') : undefined}>
                  {onSort ? (
                    <button type="button" className={direction ? 'sort-button sort-button--active' : 'sort-button'} onClick={() => onSort(column.field)}>
                      {column.label}
                      <span className="sort-indicator">{direction ? (direction === 'asc' ? '▲' : '▼') : '↕'}</span>
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              );
            })}
            {actions && <th>Действия</th>}
          </tr>
          {headerRow && (
            <tr className="filter-row">
              {COLUMNS.map((column) => (
                <th key={column.field}>{headerRow(column.field)}</th>
              ))}
              {actions && <th />}
            </tr>
          )}
        </thead>
        <tbody>
          {flats.length === 0 ? (
            <tr>
              <td colSpan={COLUMNS.length + (actions ? 1 : 0)} className="table__empty">
                {emptyText}
              </td>
            </tr>
          ) : (
            flats.map((flat) => (
              <tr key={flat.id}>
                {COLUMNS.map((column) => (
                  <td key={column.field} className={column.numeric ? 'num' : undefined}>
                    {column.render(flat)}
                  </td>
                ))}
                {actions && <td className="actions">{actions(flat)}</td>}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
