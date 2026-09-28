import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { FlatForm } from '../components/FlatForm';

export function CreateFlatPage() {
  const navigate = useNavigate();
  return (
    <div className="page page--narrow">
      <h1>Новая квартира</h1>
      <p className="hint">Поля, отмеченные *, обязательны. Координаты и дом можно создать заново или выбрать из уже существующих.</p>
      <FlatForm
        submitLabel="Создать"
        onCancel={() => navigate('/')}
        onSubmit={async (request) => {
          const created = await api.createFlat(request);
          navigate(`/flats/${created.id}`);
        }}
      />
    </div>
  );
}
