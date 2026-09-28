import type { Flat, FlatRequest, Furnish, House, View } from './types';

export type RelationMode = 'existing' | 'new';

/** Состояние формы: все поля — строки в том виде, как их ввёл пользователь. */
export interface FlatFormState {
  name: string;
  coordinatesMode: RelationMode;
  coordinatesId: string;
  x: string;
  y: string;
  area: string;
  price: string;
  balcony: '' | 'true' | 'false';
  timeToMetroOnFoot: string;
  numberOfRooms: string;
  floor: string;
  furnish: '' | Furnish;
  view: '' | View;
  houseMode: RelationMode;
  houseId: string;
  houseName: string;
  houseYear: string;
  houseNumberOfFloors: string;
}

export type FieldErrors = Partial<Record<keyof FlatFormState, string>>;

const INT_MAX = 2_147_483_647;
const LONG_MAX = Number.MAX_SAFE_INTEGER;
const FLOAT_MAX = 3.4e38;

export function initialFormState(flat?: Flat): FlatFormState {
  const text = (value: number | null | undefined) => (value === null || value === undefined ? '' : String(value));
  return {
    name: flat?.name ?? '',
    coordinatesMode: flat ? 'existing' : 'new',
    coordinatesId: text(flat?.coordinates.id),
    x: '',
    y: '',
    area: text(flat?.area),
    price: text(flat?.price),
    balcony: flat?.balcony === null || flat?.balcony === undefined ? '' : flat.balcony ? 'true' : 'false',
    timeToMetroOnFoot: text(flat?.timeToMetroOnFoot),
    numberOfRooms: text(flat?.numberOfRooms),
    floor: text(flat?.floor),
    furnish: flat?.furnish ?? '',
    view: flat?.view ?? '',
    houseMode: flat ? 'existing' : 'new',
    houseId: text(flat?.house.id),
    houseName: '',
    houseYear: '',
    houseNumberOfFloors: '',
  };
}

interface NumberRule {
  label: string;
  integer: boolean;
  required: boolean;
  max: number;
  greaterThan?: number;
  atMost?: number;
}

function readNumber(errors: FieldErrors, field: keyof FlatFormState, raw: string, rule: NumberRule): number | null {
  const text = raw.trim().replace(',', '.');
  if (text === '') {
    if (rule.required) {
      errors[field] = `${rule.label}: поле обязательно для заполнения`;
    }
    return null;
  }
  const pattern = rule.integer ? /^-?\d+$/ : /^-?\d+(\.\d+)?$/;
  if (!pattern.test(text)) {
    errors[field] = rule.integer ? `${rule.label}: введите целое число` : `${rule.label}: введите число (например, 42.5)`;
    return null;
  }
  const value = Number(text);
  if (Math.abs(value) > rule.max) {
    errors[field] = `${rule.label}: слишком большое по модулю значение`;
    return null;
  }
  if (rule.greaterThan !== undefined && !(value > rule.greaterThan)) {
    errors[field] = `${rule.label}: значение должно быть больше ${rule.greaterThan}`;
    return null;
  }
  if (rule.atMost !== undefined && value > rule.atMost) {
    errors[field] = `${rule.label}: значение не может быть больше ${rule.atMost}`;
    return null;
  }
  return value;
}

/** Проверяет форму теми же правилами, что и сервер. Возвращает запрос, если ошибок нет. */
export function buildFlatRequest(
  state: FlatFormState,
  existingHouses: House[],
): { errors: FieldErrors; request: FlatRequest | null } {
  const errors: FieldErrors = {};

  const name = state.name.trim();
  if (name === '') {
    errors.name = 'Название квартиры не может быть пустым';
  }

  let coordinatesId: number | null = null;
  let coordinates: FlatRequest['coordinates'] = null;
  if (state.coordinatesMode === 'existing') {
    if (state.coordinatesId === '') {
      errors.coordinatesId = 'Выберите координаты из списка';
    } else {
      coordinatesId = Number(state.coordinatesId);
    }
  } else {
    const x = readNumber(errors, 'x', state.x, { label: 'Координата X', integer: false, required: true, max: FLOAT_MAX, greaterThan: -494 });
    const y = readNumber(errors, 'y', state.y, { label: 'Координата Y', integer: true, required: true, max: LONG_MAX, greaterThan: -609 });
    if (x !== null && y !== null) {
      coordinates = { x, y };
    }
  }

  const area = readNumber(errors, 'area', state.area, { label: 'Площадь', integer: false, required: false, max: FLOAT_MAX, greaterThan: 0, atMost: 628 });
  const price = readNumber(errors, 'price', state.price, { label: 'Цена', integer: true, required: false, max: LONG_MAX, greaterThan: 0 });
  const timeToMetroOnFoot = readNumber(errors, 'timeToMetroOnFoot', state.timeToMetroOnFoot, { label: 'Время до метро', integer: true, required: false, max: LONG_MAX, greaterThan: 0 });
  const numberOfRooms = readNumber(errors, 'numberOfRooms', state.numberOfRooms, { label: 'Количество комнат', integer: true, required: true, max: INT_MAX, greaterThan: 0 });
  const floor = readNumber(errors, 'floor', state.floor, { label: 'Этаж', integer: true, required: true, max: INT_MAX, greaterThan: 0 });

  if (state.furnish === '') {
    errors.furnish = 'Тип отделки должен быть указан';
  }

  let houseId: number | null = null;
  let house: FlatRequest['house'] = null;
  let houseFloors: number | null = null;
  if (state.houseMode === 'existing') {
    if (state.houseId === '') {
      errors.houseId = 'Выберите дом из списка';
    } else {
      houseId = Number(state.houseId);
      houseFloors = existingHouses.find((h) => h.id === houseId)?.numberOfFloors ?? null;
    }
  } else {
    const year = readNumber(errors, 'houseYear', state.houseYear, { label: 'Год постройки', integer: true, required: false, max: INT_MAX, greaterThan: 0 });
    const numberOfFloors = readNumber(errors, 'houseNumberOfFloors', state.houseNumberOfFloors, { label: 'Количество этажей', integer: true, required: false, max: INT_MAX, greaterThan: 0 });
    house = { name: state.houseName, year, numberOfFloors };
    houseFloors = numberOfFloors;
  }

  if (floor !== null && houseFloors !== null && floor > houseFloors) {
    errors.floor = `Этаж квартиры (${floor}) не может быть больше количества этажей в доме (${houseFloors})`;
  }

  if (Object.keys(errors).length > 0 || state.furnish === '' || numberOfRooms === null || floor === null) {
    return { errors, request: null };
  }

  return {
    errors,
    request: {
      name,
      coordinatesId,
      coordinates,
      area,
      price,
      balcony: state.balcony === '' ? null : state.balcony === 'true',
      timeToMetroOnFoot,
      numberOfRooms,
      floor,
      furnish: state.furnish,
      view: state.view === '' ? null : state.view,
      houseId,
      house,
    },
  };
}
