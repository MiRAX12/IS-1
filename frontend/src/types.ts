export const FURNISH_VALUES = ['DESIGNER', 'BAD', 'LITTLE'] as const;
export type Furnish = (typeof FURNISH_VALUES)[number];

export const VIEW_VALUES = ['STREET', 'YARD', 'PARK', 'NORMAL', 'GOOD'] as const;
export type View = (typeof VIEW_VALUES)[number];

export interface Coordinates {
  id: number;
  x: number;
  y: number;
}

export interface House {
  id: number;
  name: string;
  year: number | null;
  numberOfFloors: number | null;
}

export interface Flat {
  id: number;
  name: string;
  coordinates: Coordinates;
  creationDate: string;
  area: number | null;
  price: number | null;
  balcony: boolean | null;
  timeToMetroOnFoot: number | null;
  numberOfRooms: number;
  floor: number;
  furnish: Furnish;
  view: View | null;
  house: House;
}

export interface FlatRequest {
  name: string;
  coordinatesId: number | null;
  coordinates: { x: number; y: number } | null;
  area: number | null;
  price: number | null;
  balcony: boolean | null;
  timeToMetroOnFoot: number | null;
  numberOfRooms: number;
  floor: number;
  furnish: Furnish;
  view: View | null;
  houseId: number | null;
  house: { name: string; year: number | null; numberOfFloors: number | null } | null;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}

export interface Usage {
  flatsCount: number;
}

export interface NumberResult {
  value: number | null;
}

export type SortField =
  | 'id'
  | 'name'
  | 'coordinatesX'
  | 'coordinatesY'
  | 'creationDate'
  | 'area'
  | 'price'
  | 'balcony'
  | 'timeToMetroOnFoot'
  | 'numberOfRooms'
  | 'floor'
  | 'furnish'
  | 'view'
  | 'houseName'
  | 'houseYear'
  | 'houseNumberOfFloors';

export type SortDirection = 'asc' | 'desc';

export interface ChangeEvent {
  entity: 'flat' | 'coordinates' | 'house' | 'resync';
  action: 'created' | 'updated' | 'deleted' | 'resync';
  id: number;
}
