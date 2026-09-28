import { useState, type FormEvent, type ReactNode } from 'react';
import { errorMessages, api } from '../api';
import { ErrorList } from '../components/ErrorList';
import { FlatDetails } from '../components/FlatDetails';
import { FlatTable } from '../components/FlatTable';
import { formatNumber } from '../format';
import type { Flat } from '../types';

/** Состояние одной операции: результат, ошибки и признак выполнения. */
function useOperation<T>() {
  const [result, setResult] = useState<T | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [running, setRunning] = useState(false);

  const run = async (action: () => Promise<T>) => {
    setRunning(true);
    setErrors([]);
    setResult(null);
    try {
      setResult(await action());
    } catch (error) {
      setErrors(errorMessages(error));
    } finally {
      setRunning(false);
    }
  };

  return { result, errors, running, run, fail: setErrors };
}

/** Разбирает введённые ID; возвращает null и сообщения об ошибках, если что-то не так. */
function parseIds(values: string[]): { ids: number[] | null; errors: string[] } {
  const errors: string[] = [];
  const ids = values.map((raw, index) => {
    const text = raw.trim();
    if (!/^\d+$/.test(text) || Number(text) <= 0 || Number(text) > 2_147_483_647) {
      errors.push(`ID ${index + 1}: введите целое положительное число`);
    }
    return Number(text);
  });
  if (errors.length === 0 && new Set(ids).size !== ids.length) {
    errors.push('ID квартир должны быть различными');
  }
  return { ids: errors.length === 0 ? ids : null, errors };
}

export function SpecialOpsPage() {
  return (
    <div className="page">
      <h1>Специальные операции</h1>
      <div className="ops">
        <RoomsSum />
        <FloorAverage />
        <NamePrefix />
        <PickByPrice
          title="Более дешёвая из двух квартир"
          count={2}
          action={(ids) => api.cheapest(ids[0], ids[1])}
          resultLabel="Более дешёвая квартира"
        />
        <PickByPrice
          title="Самая дорогая из трёх квартир"
          count={3}
          action={(ids) => api.mostExpensive(ids[0], ids[1], ids[2])}
          resultLabel="Самая дорогая квартира"
        />
      </div>
    </div>
  );
}

function Operation({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="card op">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function RoomsSum() {
  const op = useOperation<number | null>();
  return (
    <Operation title="Сумма количества комнат">
      <p className="hint">Сумма поля numberOfRooms по всем квартирам.</p>
      <button type="button" className="button button--primary" disabled={op.running} onClick={() => op.run(async () => (await api.roomsSum()).value)}>
        Рассчитать
      </button>
      <ErrorList errors={op.errors} />
      {op.result !== null && <p className="result">Сумма: {op.result}</p>}
    </Operation>
  );
}

function FloorAverage() {
  const op = useOperation<{ value: number | null }>();
  return (
    <Operation title="Средний этаж">
      <p className="hint">Среднее значение поля floor по всем квартирам.</p>
      <button type="button" className="button button--primary" disabled={op.running} onClick={() => op.run(api.floorAverage)}>
        Рассчитать
      </button>
      <ErrorList errors={op.errors} />
      {op.result && <p className="result">{op.result.value === null ? 'Квартир нет — среднее не определено' : `Среднее: ${formatNumber(op.result.value, 3)}`}</p>}
    </Operation>
  );
}

function NamePrefix() {
  const [prefix, setPrefix] = useState('');
  const op = useOperation<Flat[]>();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (prefix === '') {
      op.fail(['Введите начало названия']);
      return;
    }
    op.run(() => api.byNamePrefix(prefix));
  };

  return (
    <Operation title="Квартиры по началу названия">
      <p className="hint">Квартиры, название которых начинается с заданной подстроки (с учётом регистра).</p>
      <form className="inline-form" onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor="prefix">Начало названия</label>
          <input id="prefix" value={prefix} onChange={(event) => setPrefix(event.target.value)} />
        </div>
        <button type="submit" className="button button--primary" disabled={op.running}>
          Найти
        </button>
      </form>
      <ErrorList errors={op.errors} />
      {op.result && (
        <>
          <p className="result">Найдено: {op.result.length}</p>
          {op.result.length > 0 && <FlatTable flats={op.result} />}
        </>
      )}
    </Operation>
  );
}

function PickByPrice({
  title,
  count,
  action,
  resultLabel,
}: {
  title: string;
  count: number;
  action: (ids: number[]) => Promise<Flat>;
  resultLabel: string;
}) {
  const [values, setValues] = useState<string[]>(() => Array(count).fill(''));
  const op = useOperation<Flat>();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const { ids, errors } = parseIds(values);
    if (!ids) {
      op.fail(errors);
      return;
    }
    op.run(() => action(ids));
  };

  return (
    <Operation title={title}>
      <form className="inline-form" onSubmit={submit} noValidate>
        {values.map((value, index) => (
          <div className="field field--short" key={index}>
            <label htmlFor={`${title}-${index}`}>ID {index + 1}</label>
            <input
              id={`${title}-${index}`}
              inputMode="numeric"
              value={value}
              onChange={(event) => setValues((current) => current.map((v, i) => (i === index ? event.target.value : v)))}
            />
          </div>
        ))}
        <button type="submit" className="button button--primary" disabled={op.running}>
          Выбрать
        </button>
      </form>
      <ErrorList errors={op.errors} />
      {op.result && (
        <>
          <p className="result">
            {resultLabel}: #{op.result.id} «{op.result.name}», цена {op.result.price}
          </p>
          <FlatDetails flat={op.result} />
        </>
      )}
    </Operation>
  );
}
