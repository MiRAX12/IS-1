import { useEffect, useRef, useState } from 'react';
import { BASE_URL } from './api';
import type { ChangeEvent } from './types';

/*
 * Одно WebSocket-соединение на вкладку. Сервер присылает событие после каждого
 * изменения объекта; при переподключении подписчики получают событие resync,
 * чтобы перечитать данные, пропущенные за время обрыва.
 */

type Listener = (event: ChangeEvent) => void;
type StatusListener = (connected: boolean) => void;

const RECONNECT_DELAY_MS = 3000;

const listeners = new Set<Listener>();
const statusListeners = new Set<StatusListener>();
let socket: WebSocket | null = null;
let connected = false;
let wasConnected = false;

function socketUrl(): string {
  const url = new URL('ws/changes', BASE_URL);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  return url.toString();
}

function setConnected(value: boolean) {
  connected = value;
  statusListeners.forEach((listener) => listener(value));
}

function emit(event: ChangeEvent) {
  listeners.forEach((listener) => listener(event));
}

function connect() {
  if (socket) {
    return;
  }
  const ws = new WebSocket(socketUrl());
  socket = ws;
  ws.onopen = () => {
    setConnected(true);
    if (wasConnected) {
      emit({ entity: 'resync', action: 'resync', id: 0 });
    }
    wasConnected = true;
  };
  ws.onmessage = (message) => {
    try {
      emit(JSON.parse(message.data) as ChangeEvent);
    } catch {
      // игнорируем некорректные сообщения
    }
  };
  ws.onclose = () => {
    socket = null;
    setConnected(false);
    window.setTimeout(connect, RECONNECT_DELAY_MS);
  };
}

/** Вызывает handler при каждом изменении объектов на сервере. */
export function useChanges(handler: Listener) {
  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    const listener: Listener = (event) => handlerRef.current(event);
    listeners.add(listener);
    connect();
    return () => {
      listeners.delete(listener);
    };
  }, []);
}

export function useConnectionStatus(): boolean {
  const [value, setValue] = useState(connected);
  useEffect(() => {
    statusListeners.add(setValue);
    setValue(connected);
    connect();
    return () => {
      statusListeners.delete(setValue);
    };
  }, []);
  return value;
}
