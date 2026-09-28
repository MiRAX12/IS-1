import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ApiError, api, errorMessages } from '../api';
import { useChanges } from '../changes';
import { ErrorList } from '../components/ErrorList';
import { DeleteFlatDialog, EditFlatDialog } from '../components/FlatDialogs';
import { FlatDetails } from '../components/FlatDetails';
import type { Flat } from '../types';

export function FlatDetailsPage() {
  const params = useParams();
  const navigate = useNavigate();
  const id = /^\d+$/.test(params.id ?? '') ? Number(params.id) : null;

  const [flat, setFlat] = useState<Flat | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [removedRemotely, setRemovedRemotely] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    if (id === null) {
      return;
    }
    api
      .getFlat(id)
      .then((result) => {
        setFlat(result);
        setErrors([]);
      })
      .catch((error) => {
        setFlat(null);
        setErrors(error instanceof ApiError && error.status === 404 ? [`Квартира с id=${id} не найдена`] : errorMessages(error));
      });
  }, [id]);

  useEffect(() => {
    setRemovedRemotely(false);
    load();
  }, [load]);

  useChanges((event) => {
    if (event.entity === 'flat' && event.id === id && event.action === 'deleted') {
      if (flat) {
        setRemovedRemotely(true);
      }
      setEditing(false);
      setDeleting(false);
      return;
    }
    if (event.entity === 'resync' || (event.entity === 'flat' && event.id === id)) {
      load();
    }
  });

  if (id === null) {
    return (
      <div className="page">
        <ErrorList errors={['Некорректный ID квартиры']} />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page__header">
        <h1>Квартира {flat ? `«${flat.name}»` : `#${id}`}</h1>
        {flat && !removedRemotely && (
          <div className="toolbar">
            <button type="button" className="button" onClick={() => setEditing(true)}>
              Изменить
            </button>
            <button type="button" className="button button--danger" onClick={() => setDeleting(true)}>
              Удалить
            </button>
          </div>
        )}
      </div>

      {removedRemotely && <div className="alert alert--warning">Эта квартира была удалена другим пользователем.</div>}
      <ErrorList errors={errors} />
      {flat && <FlatDetails flat={flat} />}

      <p>
        <Link to="/">← К списку квартир</Link>
      </p>

      {flat && editing && <EditFlatDialog flat={flat} onClose={() => setEditing(false)} />}
      {flat && deleting && <DeleteFlatDialog flat={flat} onClose={() => setDeleting(false)} onDeleted={() => navigate('/')} />}
    </div>
  );
}
