import { useState } from 'react';
import { api, errorMessages } from '../api';
import type { Flat } from '../types';
import { Dialog } from './Dialog';
import { ErrorList } from './ErrorList';
import { FlatForm } from './FlatForm';

export function EditFlatDialog({ flat, onClose }: { flat: Flat; onClose: () => void }) {
  return (
    <Dialog title={`Изменение квартиры #${flat.id}`} onClose={onClose} wide>
      <FlatForm
        flat={flat}
        submitLabel="Сохранить"
        onCancel={onClose}
        onSubmit={async (request) => {
          await api.updateFlat(flat.id, request);
          onClose();
        }}
      />
    </Dialog>
  );
}

export function DeleteFlatDialog({ flat, onClose, onDeleted }: { flat: Flat; onClose: () => void; onDeleted?: () => void }) {
  const [errors, setErrors] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);

  const remove = async () => {
    setDeleting(true);
    setErrors([]);
    try {
      await api.deleteFlat(flat.id);
      onClose();
      onDeleted?.();
    } catch (error) {
      setErrors(errorMessages(error));
      setDeleting(false);
    }
  };

  return (
    <Dialog title="Удаление квартиры" onClose={onClose}>
      <ErrorList errors={errors} />
      <p>
        Удалить квартиру <strong>«{flat.name}»</strong> (id {flat.id})? Координаты и дом останутся в системе.
      </p>
      <div className="form__actions">
        <button type="button" className="button" onClick={onClose} disabled={deleting}>
          Отмена
        </button>
        <button type="button" className="button button--danger" onClick={remove} disabled={deleting}>
          {deleting ? 'Удаление…' : 'Удалить'}
        </button>
      </div>
    </Dialog>
  );
}
