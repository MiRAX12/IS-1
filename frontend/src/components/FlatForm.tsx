import { useCallback, useEffect, useId, useState, type FormEvent, type ReactNode } from 'react';
import { api, errorMessages } from '../api';
import { useChanges } from '../changes';
import { buildFlatRequest, initialFormState, type FieldErrors, type FlatFormState, type RelationMode } from '../flatForm';
import { FURNISH_LABELS, VIEW_LABELS, formatNumber } from '../format';
import { FURNISH_VALUES, VIEW_VALUES, type Coordinates, type Flat, type FlatRequest, type House } from '../types';
import { ErrorList } from './ErrorList';

interface FlatFormProps {
  flat?: Flat;
  submitLabel: string;
  onSubmit: (request: FlatRequest) => Promise<void>;
  onCancel?: () => void;
}

export function FlatForm({ flat, submitLabel, onSubmit, onCancel }: FlatFormProps) {
  const [state, setState] = useState<FlatFormState>(() => initialFormState(flat));
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [coordinatesList, setCoordinatesList] = useState<Coordinates[]>([]);
  const [houses, setHouses] = useState<House[]>([]);

  const loadRelated = useCallback(() => {
    api.listCoordinates().then(setCoordinatesList).catch((error) => setServerErrors(errorMessages(error)));
    api.listHouses().then(setHouses).catch((error) => setServerErrors(errorMessages(error)));
  }, []);

  useEffect(loadRelated, [loadRelated]);
  useChanges((event) => {
    if (event.entity === 'coordinates' || event.entity === 'house' || event.entity === 'resync') {
      loadRelated();
    }
  });

  const set = <K extends keyof FlatFormState>(field: K, value: FlatFormState[K]) => {
    setState((previous) => ({ ...previous, [field]: value }));
    setFieldErrors((previous) => ({ ...previous, [field]: undefined }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setServerErrors([]);
    const { errors, request } = buildFlatRequest(state, houses);
    setFieldErrors(errors);
    if (!request) {
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(request);
    } catch (error) {
      setServerErrors(errorMessages(error));
    } finally {
      setSubmitting(false);
    }
  };

  const hasFieldErrors = Object.values(fieldErrors).some(Boolean);

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <ErrorList errors={serverErrors} />
      {hasFieldErrors && <div className="alert alert--error">Исправьте ошибки в отмеченных полях</div>}

      <fieldset>
        <legend>Квартира</legend>
        <div className="grid">
          <Field label="Название *" error={fieldErrors.name} wide>
            {(id) => <input id={id} value={state.name} onChange={(e) => set('name', e.target.value)} />}
          </Field>
          <Field label="Площадь (0 < S ≤ 628)" error={fieldErrors.area}>
            {(id) => <input id={id} inputMode="decimal" value={state.area} onChange={(e) => set('area', e.target.value)} />}
          </Field>
          <Field label="Цена (> 0)" error={fieldErrors.price}>
            {(id) => <input id={id} inputMode="numeric" value={state.price} onChange={(e) => set('price', e.target.value)} />}
          </Field>
          <Field label="Время до метро пешком (> 0)" error={fieldErrors.timeToMetroOnFoot}>
            {(id) => (
              <input id={id} inputMode="numeric" value={state.timeToMetroOnFoot} onChange={(e) => set('timeToMetroOnFoot', e.target.value)} />
            )}
          </Field>
          <Field label="Количество комнат * (> 0)" error={fieldErrors.numberOfRooms}>
            {(id) => <input id={id} inputMode="numeric" value={state.numberOfRooms} onChange={(e) => set('numberOfRooms', e.target.value)} />}
          </Field>
          <Field label="Этаж * (> 0)" error={fieldErrors.floor}>
            {(id) => <input id={id} inputMode="numeric" value={state.floor} onChange={(e) => set('floor', e.target.value)} />}
          </Field>
          <Field label="Балкон">
            {(id) => (
              <select id={id} value={state.balcony} onChange={(e) => set('balcony', e.target.value as FlatFormState['balcony'])}>
                <option value="">Не указано</option>
                <option value="true">Есть</option>
                <option value="false">Нет</option>
              </select>
            )}
          </Field>
          <Field label="Отделка *" error={fieldErrors.furnish}>
            {(id) => (
              <select id={id} value={state.furnish} onChange={(e) => set('furnish', e.target.value as FlatFormState['furnish'])}>
                <option value="">Выберите…</option>
                {FURNISH_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {FURNISH_LABELS[value]}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field label="Вид из окна">
            {(id) => (
              <select id={id} value={state.view} onChange={(e) => set('view', e.target.value as FlatFormState['view'])}>
                <option value="">Не указано</option>
                {VIEW_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {VIEW_LABELS[value]}
                  </option>
                ))}
              </select>
            )}
          </Field>
        </div>
      </fieldset>

      <fieldset>
        <legend>Координаты *</legend>
        <ModeSwitch
          name="coordinatesMode"
          value={state.coordinatesMode}
          onChange={(mode) => set('coordinatesMode', mode)}
          existingDisabled={coordinatesList.length === 0}
        />
        {state.coordinatesMode === 'existing' ? (
          <Field label="Существующие координаты" error={fieldErrors.coordinatesId} wide>
            {(id) => (
              <select id={id} value={state.coordinatesId} onChange={(e) => set('coordinatesId', e.target.value)}>
                <option value="">Выберите…</option>
                {coordinatesList.map((c) => (
                  <option key={c.id} value={c.id}>
                    #{c.id}: X = {formatNumber(c.x)}, Y = {c.y}
                  </option>
                ))}
              </select>
            )}
          </Field>
        ) : (
          <div className="grid">
            <Field label="X * (> −494)" error={fieldErrors.x}>
              {(id) => <input id={id} inputMode="decimal" value={state.x} onChange={(e) => set('x', e.target.value)} />}
            </Field>
            <Field label="Y * (целое, > −609)" error={fieldErrors.y}>
              {(id) => <input id={id} inputMode="numeric" value={state.y} onChange={(e) => set('y', e.target.value)} />}
            </Field>
          </div>
        )}
      </fieldset>

      <fieldset>
        <legend>Дом *</legend>
        <ModeSwitch name="houseMode" value={state.houseMode} onChange={(mode) => set('houseMode', mode)} existingDisabled={houses.length === 0} />
        {state.houseMode === 'existing' ? (
          <Field label="Существующий дом" error={fieldErrors.houseId} wide>
            {(id) => (
              <select id={id} value={state.houseId} onChange={(e) => set('houseId', e.target.value)}>
                <option value="">Выберите…</option>
                {houses.map((h) => (
                  <option key={h.id} value={h.id}>
                    #{h.id}: {h.name || '(без названия)'}
                    {h.year !== null ? `, ${h.year} г.` : ''}
                    {h.numberOfFloors !== null ? `, этажей: ${h.numberOfFloors}` : ''}
                  </option>
                ))}
              </select>
            )}
          </Field>
        ) : (
          <div className="grid">
            <Field label="Название дома" error={fieldErrors.houseName} wide>
              {(id) => <input id={id} value={state.houseName} onChange={(e) => set('houseName', e.target.value)} />}
            </Field>
            <Field label="Год постройки (> 0)" error={fieldErrors.houseYear}>
              {(id) => <input id={id} inputMode="numeric" value={state.houseYear} onChange={(e) => set('houseYear', e.target.value)} />}
            </Field>
            <Field label="Количество этажей (> 0)" error={fieldErrors.houseNumberOfFloors}>
              {(id) => (
                <input id={id} inputMode="numeric" value={state.houseNumberOfFloors} onChange={(e) => set('houseNumberOfFloors', e.target.value)} />
              )}
            </Field>
          </div>
        )}
      </fieldset>

      <div className="form__actions">
        {onCancel && (
          <button type="button" className="button" onClick={onCancel} disabled={submitting}>
            Отмена
          </button>
        )}
        <button type="submit" className="button button--primary" disabled={submitting}>
          {submitting ? 'Сохранение…' : submitLabel}
        </button>
      </div>
    </form>
  );
}

function Field({ label, error, wide, children }: { label: string; error?: string; wide?: boolean; children: (id: string) => ReactNode }) {
  const id = useId();
  return (
    <div className={`field${wide ? ' field--wide' : ''}${error ? ' field--invalid' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {children(id)}
      {error && <span className="field__error">{error}</span>}
    </div>
  );
}

function ModeSwitch({
  name,
  value,
  onChange,
  existingDisabled,
}: {
  name: string;
  value: RelationMode;
  onChange: (mode: RelationMode) => void;
  existingDisabled: boolean;
}) {
  return (
    <div className="mode-switch" role="radiogroup">
      <label>
        <input type="radio" name={name} checked={value === 'new'} onChange={() => onChange('new')} />
        Ввести новые данные
      </label>
      <label className={existingDisabled ? 'disabled' : undefined}>
        <input type="radio" name={name} checked={value === 'existing'} disabled={existingDisabled && value !== 'existing'} onChange={() => onChange('existing')} />
        Выбрать из существующих
      </label>
    </div>
  );
}
