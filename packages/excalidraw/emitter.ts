type Subscriber<T extends any[]> = (...payload: T) => void;
type UnsubscribeCallback = () => void;
export type Emitter<T extends any[]> = ReturnType<typeof createEmitter<T>>;

export function createEmitter<T extends any[] = []>() {
  let subscribers: Subscriber<T>[] = [];

  const on = (...handlers: Subscriber<T>[] | Subscriber<T>[][]): UnsubscribeCallback => {
    const _handlers = handlers.flat().filter((item): item is Subscriber<T> => typeof item === "function");
    subscribers.push(..._handlers);
    return () => off(_handlers);
  };

  const once = (...handlers: Subscriber<T>[] | Subscriber<T>[][]): UnsubscribeCallback => {
    const _handlers = handlers.flat().filter((item): item is Subscriber<T> => typeof item === "function");
    const wrappedHandlers: Subscriber<T>[] = [];

    const detach = on(
      ..._handlers.map((handler) => {
        const wrapper: Subscriber<T> = (...args) => {
          handler(...args);
          off([wrapper]);
        };
        wrappedHandlers.push(wrapper);
        return wrapper;
      })
    );

    return detach;
  };

  const off = (...handlers: Subscriber<T>[] | Subscriber<T>[][]) => {
    const _handlers = handlers.flat();
    subscribers = subscribers.filter((handler) => !_handlers.includes(handler));
  };

  const trigger = (...payload: T) => {
    subscribers.forEach((handler) => handler(...payload));
  };

  const clear = () => {
    subscribers = [];
  };

  return { on, once, off, trigger, clear };
}
