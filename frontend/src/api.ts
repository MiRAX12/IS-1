import type {
  Coordinates,
  Flat,
  FlatRequest,
  House,
  NumberResult,
  Page,
  SortDirection,
  SortField,
  Usage,
} from './types';

/** Каталог, из которого загружено приложение (например, /IS-1/). Запросы к API идут относительно него. */
export const BASE_URL = new URL('.', window.location.href);

export class ApiError extends Error {
  readonly errors: string[];
  readonly status: number;

  constructor(errors: string[], status: number) {
    super(errors.join('; '));
    this.errors = errors;
    this.status = status;
  }
}

export function errorMessages(error: unknown): string[] {
  if (error instanceof ApiError) {
    return error.errors;
  }
  return [error instanceof Error ? error.message : String(error)];
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(new URL(path, BASE_URL), {
      ...init,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
  } catch {
    throw new ApiError(['Сервер недоступен. Проверьте подключение.'], 0);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const errors: string[] =
      Array.isArray(body?.errors) && body.errors.length > 0
        ? body.errors
        : [`Ошибка сервера (${response.status})`];
    throw new ApiError(errors, response.status);
  }
  return body as T;
}

export interface FlatQuery {
  page: number;
  size: number;
  sort: SortField;
  direction: SortDirection;
  name: string;
  furnish: string;
  view: string;
  houseName: string;
}

export const api = {
  listFlats(query: FlatQuery) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (String(value).trim() !== '') {
        params.set(key, String(value).trim());
      }
    }
    return request<Page<Flat>>(`api/flats?${params}`);
  },
  getFlat: (id: number) => request<Flat>(`api/flats/${id}`),
  createFlat: (flat: FlatRequest) =>
    request<Flat>('api/flats', { method: 'POST', body: JSON.stringify(flat) }),
  updateFlat: (id: number, flat: FlatRequest) =>
    request<Flat>(`api/flats/${id}`, { method: 'PUT', body: JSON.stringify(flat) }),
  deleteFlat: (id: number) => request<void>(`api/flats/${id}`, { method: 'DELETE' }),

  listCoordinates: () => request<Coordinates[]>('api/coordinates'),
  coordinatesUsage: (id: number) => request<Usage>(`api/coordinates/${id}/usage`),
  deleteCoordinates: (id: number, replacementId: number | null) =>
    request<void>(`api/coordinates/${id}${replacementId != null ? `?replacementId=${replacementId}` : ''}`, {
      method: 'DELETE',
    }),

  listHouses: () => request<House[]>('api/houses'),
  houseUsage: (id: number) => request<Usage>(`api/houses/${id}/usage`),
  deleteHouse: (id: number, replacementId: number | null) =>
    request<void>(`api/houses/${id}${replacementId != null ? `?replacementId=${replacementId}` : ''}`, {
      method: 'DELETE',
    }),

  roomsSum: () => request<NumberResult>('api/special/rooms-sum'),
  floorAverage: () => request<NumberResult>('api/special/floor-average'),
  byNamePrefix: (prefix: string) =>
    request<Flat[]>(`api/special/name-prefix?${new URLSearchParams({ prefix })}`),
  cheapest: (id1: number, id2: number) =>
    request<Flat>(`api/special/cheapest?id1=${id1}&id2=${id2}`),
  mostExpensive: (id1: number, id2: number, id3: number) =>
    request<Flat>(`api/special/most-expensive?id1=${id1}&id2=${id2}&id3=${id3}`),
};
