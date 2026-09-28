import { FURNISH_LABELS, VIEW_LABELS, formatBoolean, formatDate, formatNumber, formatValue } from '../format';
import type { Flat } from '../types';

export function FlatDetails({ flat }: { flat: Flat }) {
  return (
    <div className="details">
      <section className="card">
        <h3>Квартира #{flat.id}</h3>
        <dl className="props">
          <dt>Название</dt>
          <dd>{flat.name}</dd>
          <dt>Дата создания</dt>
          <dd>{formatDate(flat.creationDate)}</dd>
          <dt>Площадь</dt>
          <dd>{formatNumber(flat.area)}</dd>
          <dt>Цена</dt>
          <dd>{formatValue(flat.price)}</dd>
          <dt>Балкон</dt>
          <dd>{formatBoolean(flat.balcony)}</dd>
          <dt>Время до метро пешком</dt>
          <dd>{formatValue(flat.timeToMetroOnFoot)}</dd>
          <dt>Количество комнат</dt>
          <dd>{flat.numberOfRooms}</dd>
          <dt>Этаж</dt>
          <dd>{flat.floor}</dd>
          <dt>Отделка</dt>
          <dd>{FURNISH_LABELS[flat.furnish]}</dd>
          <dt>Вид</dt>
          <dd>{flat.view ? VIEW_LABELS[flat.view] : '—'}</dd>
        </dl>
      </section>
      <section className="card">
        <h3>Координаты #{flat.coordinates.id}</h3>
        <dl className="props">
          <dt>X</dt>
          <dd>{formatNumber(flat.coordinates.x)}</dd>
          <dt>Y</dt>
          <dd>{flat.coordinates.y}</dd>
        </dl>
      </section>
      <section className="card">
        <h3>Дом #{flat.house.id}</h3>
        <dl className="props">
          <dt>Название</dt>
          <dd>{formatValue(flat.house.name)}</dd>
          <dt>Год постройки</dt>
          <dd>{formatValue(flat.house.year)}</dd>
          <dt>Количество этажей</dt>
          <dd>{formatValue(flat.house.numberOfFloors)}</dd>
        </dl>
      </section>
    </div>
  );
}
