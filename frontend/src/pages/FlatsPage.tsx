import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, errorMessages } from '../api';
import { useChanges } from '../changes';
import { ErrorList } from '../components/ErrorList';
import { DeleteFlatDialog, EditFlatDialog } from '../components/FlatDialogs';
import { FlatTable } from '../components/FlatTable';
import type { Flat, Page, SortDirection, SortField } from '../types';

type FilterField = 'name' | 'furnish' | 'view' | 'houseName';

const FILTER_PLACEHOLDERS: Record<FilterField, string> = {
  name: 'фильтр…',
  furnish: 'напр. des',
  view: 'напр. par',
  houseName: 'фильтр…',
};

const PAGE_SIZES = [5, 10, 20, 50];

const EMPTY_FILTERS: Record<FilterField, string> = { name: '', furnish: '', view: '', houseName: '' };

function useDebounced<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

export function FlatsPage() {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [sort, setSort] = useState<{ field: SortField; direction: SortDirection }>({ field: 'id', direction: 'asc' });
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const debouncedFilters = useDebounced(filters, 300);

  const [data, setData] = useState<Page<Flat> | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [editing, setEditing] = useState<Flat | null>(null);
  const [deleting, setDeleting] = useState<Flat | null>(null);
  const requestCounter = useRef(0);

  const load = useCallback(() => {
    const requestId = ++requestCounter.current;
    api
      .listFlats({ page, size, sort: sort.field, direction: sort.direction, ...debouncedFilters })
      .then((result) => {
        if (requestId === requestCounter.current) {
          setData(result);
          setErrors([]);
        }
      })
      .catch((error) => {
        if (requestId === requestCounter.current) {
          setErrors(errorMessages(error));
        }
      });
  }, [page, size, sort, debouncedFilters]);

  useEffect(load, [load]);

  useChanges((event) => {
    load();
    if (event.entity === 'flat' && event.action === 'deleted') {
      setEditing((current) => (current?.id === event.id ? null : current));
      setDeleting((current) => (current?.id === event.id ? null : current));
    }
  });

  // Если после удаления текущая страница опустела — переходим на последнюю существующую
  useEffect(() => {
    if (data && data.items.length === 0 && page > 0) {
      setPage(Math.max(0, Math.ceil(data.total / size) - 1));
    }
  }, [data, page, size]);

  const onSort = (field: SortField) => {
    setSort((current) =>
      current.field === field
        ? { field, direction: current.direction === 'asc' ? 'desc' : 'asc' }
        : { field, direction: 'asc' },
    );
    setPage(0);
  };

  const setFilter = (field: FilterField, value: string) => {
    setFilters((current) => ({ ...current, [field]: value }));
    setPage(0);
  };

  const pageCount = data ? Math.max(1, Math.ceil(data.total / size)) : 1;
  const hasFilters = Object.values(filters).some((value) => value !== '');

  return (
    <div className="page">
      <div className="page__header">
        <h1>Квартиры</h1>
        <Link className="button button--primary" to="/flats/new">
          + Добавить квартиру
        </Link>
      </div>
      <p className="hint">
        Нажмите на заголовок колонки для сортировки. Фильтры по строковым колонкам ищут частичное совпадение без учёта регистра.
        {hasFilters && (
          <>
            {' '}
            <button type="button" className="link-button" onClick={() => { setFilters(EMPTY_FILTERS); setPage(0); }}>
              Сбросить фильтры
            </button>
          </>
        )}
      </p>

      <ErrorList errors={errors} />

      <FlatTable
        flats={data?.items ?? []}
        sort={sort}
        onSort={onSort}
        emptyText={data ? (hasFilters ? 'Нет квартир, подходящих под фильтр' : 'Квартир пока нет') : 'Загрузка…'}
        headerRow={(field) =>
          field in EMPTY_FILTERS ? (
            <input
              className="filter-input"
              aria-label={`Фильтр: ${field}`}
              placeholder={FILTER_PLACEHOLDERS[field as FilterField]}
              value={filters[field as FilterField]}
              onChange={(event) => setFilter(field as FilterField, event.target.value)}
            />
          ) : null
        }
        actions={(flat) => (
          <>
            <Link className="button button--small" to={`/flats/${flat.id}`}>
              Открыть
            </Link>
            <button type="button" className="button button--small" onClick={() => setEditing(flat)}>
              Изменить
            </button>
            <button type="button" className="button button--small button--danger" onClick={() => setDeleting(flat)}>
              Удалить
            </button>
          </>
        )}
      />

      <nav className="pagination" aria-label="Страницы">
        <button type="button" className="button button--small" disabled={page === 0} onClick={() => setPage(0)}>
          «
        </button>
        <button type="button" className="button button--small" disabled={page === 0} onClick={() => setPage(page - 1)}>
          ‹ Назад
        </button>
        <span>
          Страница {Math.min(page + 1, pageCount)} из {pageCount}
          {data && <> · всего {data.total}</>}
        </span>
        <button type="button" className="button button--small" disabled={page + 1 >= pageCount} onClick={() => setPage(page + 1)}>
          Вперёд ›
        </button>
        <button type="button" className="button button--small" disabled={page + 1 >= pageCount} onClick={() => setPage(pageCount - 1)}>
          »
        </button>
        <label className="pagination__size">
          На странице:
          <select
            value={size}
            onChange={(event) => {
              setSize(Number(event.target.value));
              setPage(0);
            }}
          >
            {PAGE_SIZES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      </nav>

      {editing && <EditFlatDialog flat={editing} onClose={() => setEditing(null)} />}
      {deleting && <DeleteFlatDialog flat={deleting} onClose={() => setDeleting(null)} />}
    </div>
  );
}
