import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

export function FlatLookupPage() {
  const navigate = useNavigate();
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const text = value.trim();
    if (!/^\d+$/.test(text) || Number(text) <= 0 || Number(text) > 2_147_483_647) {
      setError('ID должен быть целым положительным числом');
      return;
    }
    navigate(`/flats/${Number(text)}`);
  };

  return (
    <div className="page page--narrow">
      <h1>Поиск квартиры по ID</h1>
      <form className="inline-form" onSubmit={submit} noValidate>
        <div className={error ? 'field field--invalid' : 'field'}>
          <label htmlFor="flat-id">ID квартиры</label>
          <input
            id="flat-id"
            inputMode="numeric"
            value={value}
            autoFocus
            onChange={(event) => {
              setValue(event.target.value);
              setError(null);
            }}
          />
          {error && <span className="field__error">{error}</span>}
        </div>
        <button type="submit" className="button button--primary">
          Показать
        </button>
      </form>
    </div>
  );
}
