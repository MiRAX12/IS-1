import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { api, errorMessages } from '../api';
import { useChanges } from '../changes';
import { Dialog } from '../components/Dialog';
import { ErrorList } from '../components/ErrorList';
import { formatNumber, formatValue } from '../format';
import type { ChangeEvent, Coordinates, House, Usage } from '../types';

interface RelatedConfig<T extends { id: number }> {
  entity: ChangeEvent['entity'];
  title: string;
  description: string;
  nounAccusative: string;
  columns: { label: string; render: (item: T) => ReactNode; numeric?: boolean }[];
  describe: (item: T) => string;
  load: () => Promise<T[]>;
  usage: (id: number) => Promise<Usage>;
  remove: (id: number, replacementId: number | null) => Promise<void>;
}

function RelatedObjectsPage<T extends { id: number }>({ config }: { config: RelatedConfig<T> }) {
  const [items, setItems] = useState<T[] | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [deleting, setDeleting] = useState<T | null>(null);
  const { load: loadItems, entity } = config;

  const load = useCallback(() => {
    loadItems()
      .then((result) => {
        setItems(result);
        setErrors([]);
      })
      .catch((error) => setErrors(errorMessages(error)));
  }, [loadItems]);

  useEffect(load, [load]);

  useChanges((event) => {
    if (event.entity === entity || event.entity === 'resync') {
      load();
    }
    if (event.entity === entity && event.action === 'deleted') {
      setDeleting((current) => (current?.id === event.id ? null : current));
    }
  });

  return (
    <div className="page">
      <h1>{config.title}</h1>
      <p className="hint">{config.description}</p>
      <ErrorList errors={errors} />
      <div className="table-scroll">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              {config.columns.map((column) => (
                <th key={column.label}>{column.label}</th>
              ))}
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {items === null || items.length === 0 ? (
              <tr>
                <td colSpan={config.columns.length + 2} className="table__empty">
                  {items === null ? 'Загрузка…' : 'Записей нет'}
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id}>
                  <td className="num">{item.id}</td>
                  {config.columns.map((column) => (
                    <td key={column.label} className={column.numeric ? 'num' : undefined}>
                      {column.render(item)}
                    </td>
                  ))}
                  <td className="actions">
                    <button type="button" className="button button--small button--danger" onClick={() => setDeleting(item)}>
                      Удалить
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {deleting && (
        <DeleteWithReplacementDialog
          config={config}
          target={deleting}
          candidates={(items ?? []).filter((item) => item.id !== deleting.id)}
          onClose={() => setDeleting(null)}
        />
      )}
    </div>
  );
}

function DeleteWithReplacementDialog<T extends { id: number }>({
  config,
  target,
  candidates,
  onClose,
}: {
  config: RelatedConfig<T>;
  target: T;
  candidates: T[];
  onClose: () => void;
}) {
  const [usage, setUsage] = useState<number | null>(null);
  const [replacementId, setReplacementId] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);
  const { usage: loadUsage, entity } = config;

  const refreshUsage = useCallback(() => {
    loadUsage(target.id)
      .then((result) => setUsage(result.flatsCount))
      .catch((error) => setErrors(errorMessages(error)));
  }, [loadUsage, target.id]);

  useEffect(refreshUsage, [refreshUsage]);

  // Пока диалог открыт, другие пользователи могут привязать или отвязать квартиры
  useChanges((event) => {
    if (event.entity === 'flat' || event.entity === entity || event.entity === 'resync') {
      refreshUsage();
    }
  });

  const needsReplacement = usage !== null && usage > 0;

  const remove = async () => {
    if (needsReplacement && replacementId === '') {
      setErrors([`Выберите ${config.nounAccusative} для замены`]);
      return;
    }
    setDeleting(true);
    setErrors([]);
    try {
      await config.remove(target.id, needsReplacement ? Number(replacementId) : null);
      onClose();
    } catch (error) {
      setErrors(errorMessages(error));
      setDeleting(false);
    }
  };

  return (
    <Dialog title={`Удаление: ${config.describe(target)}`} onClose={onClose}>
      <ErrorList errors={errors} />
      {usage === null ? (
        <p>Проверяем связанные квартиры…</p>
      ) : needsReplacement ? (
        <>
          <p>
            С этим объектом связано квартир: <strong>{usage}</strong>. Выберите, к чему их привязать после удаления.
          </p>
          {candidates.length === 0 ? (
            <div className="alert alert--warning">
              Нет других объектов для замены. Сначала создайте ещё один (например, при добавлении квартиры).
            </div>
          ) : (
            <div className="field field--wide">
              <label htmlFor="replacement">Заменить на</label>
              <select id="replacement" value={replacementId} onChange={(event) => setReplacementId(event.target.value)}>
                <option value="">Выберите…</option>
                {candidates.map((item) => (
                  <option key={item.id} value={item.id}>
                    {config.describe(item)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </>
      ) : (
        <p>Объект не связан ни с одной квартирой. Удалить его?</p>
      )}
      <div className="form__actions">
        <button type="button" className="button" onClick={onClose} disabled={deleting}>
          Отмена
        </button>
        <button
          type="button"
          className="button button--danger"
          onClick={remove}
          disabled={deleting || usage === null || (needsReplacement && candidates.length === 0)}
        >
          {deleting ? 'Удаление…' : needsReplacement ? 'Перепривязать и удалить' : 'Удалить'}
        </button>
      </div>
    </Dialog>
  );
}

const COORDINATES_CONFIG: RelatedConfig<Coordinates> = {
  entity: 'coordinates',
  title: 'Координаты',
  description: 'Координаты, которые есть в системе. При удалении используемых координат связанные квартиры нужно привязать к другим.',
  nounAccusative: 'координаты',
  columns: [
    { label: 'X', render: (c) => formatNumber(c.x), numeric: true },
    { label: 'Y', render: (c) => c.y, numeric: true },
  ],
  describe: (c) => `координаты #${c.id} (X = ${formatNumber(c.x)}, Y = ${c.y})`,
  load: api.listCoordinates,
  usage: api.coordinatesUsage,
  remove: api.deleteCoordinates,
};

const HOUSES_CONFIG: RelatedConfig<House> = {
  entity: 'house',
  title: 'Дома',
  description: 'Дома, которые есть в системе. При удалении используемого дома связанные квартиры нужно привязать к другому дому.',
  nounAccusative: 'дом',
  columns: [
    { label: 'Название', render: (h) => formatValue(h.name) },
    { label: 'Год постройки', render: (h) => formatValue(h.year), numeric: true },
    { label: 'Количество этажей', render: (h) => formatValue(h.numberOfFloors), numeric: true },
  ],
  describe: (h) => `дом #${h.id} «${h.name}»`,
  load: api.listHouses,
  usage: api.houseUsage,
  remove: api.deleteHouse,
};

export function CoordinatesPage() {
  return <RelatedObjectsPage config={COORDINATES_CONFIG} />;
}

export function HousesPage() {
  return <RelatedObjectsPage config={HOUSES_CONFIG} />;
}
