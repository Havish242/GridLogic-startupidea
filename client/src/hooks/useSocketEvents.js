import { useEffect } from 'react';

import { getSocket } from '../services/socket';

export default function useSocketEvents(handlers) {
  useEffect(() => {
    const socket = getSocket();

    const entries = Object.entries(handlers || {});
    entries.forEach(([event, fn]) => {
      socket.on(event, fn);
    });

    return () => {
      entries.forEach(([event, fn]) => {
        socket.off(event, fn);
      });
    };
  }, [handlers]);
}
