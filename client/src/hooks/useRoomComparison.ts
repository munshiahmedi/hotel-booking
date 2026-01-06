// src/hooks/useRoomComparison.ts
import { useState, useCallback } from 'react';
import { AvailableRoomType } from '../services/roomAvailability.service';

interface UseRoomComparisonReturn {
  comparisonRooms: AvailableRoomType[];
  isComparing: boolean;
  addToComparison: (room: AvailableRoomType) => void;
  removeFromComparison: (roomId: number) => void;
  clearComparison: () => void;
  toggleComparison: (room: AvailableRoomType) => void;
  isInComparison: (roomId: number) => boolean;
  maxComparisonReached: boolean;
}

export const useRoomComparison = (): UseRoomComparisonReturn => {
  const [comparisonRooms, setComparisonRooms] = useState<AvailableRoomType[]>([]);

  const MAX_COMPARISON_ROOMS = 4;

  const addToComparison = useCallback((room: AvailableRoomType) => {
    setComparisonRooms(prev => {
      if (prev.length >= MAX_COMPARISON_ROOMS) {
        return prev; // Don't add if max reached
      }
      if (prev.some(r => r.id === room.id)) {
        return prev; // Don't add if already exists
      }
      return [...prev, room];
    });
  }, []);

  const removeFromComparison = useCallback((roomId: number) => {
    setComparisonRooms(prev => prev.filter(room => room.id !== roomId));
  }, []);

  const clearComparison = useCallback(() => {
    setComparisonRooms([]);
  }, []);

  const toggleComparison = useCallback((room: AvailableRoomType) => {
    const isInComparison = comparisonRooms.some(r => r.id === room.id);
    if (isInComparison) {
      removeFromComparison(room.id);
    } else {
      addToComparison(room);
    }
  }, [comparisonRooms, addToComparison, removeFromComparison]);

  const isInComparison = useCallback((roomId: number) => {
    return comparisonRooms.some(room => room.id === roomId);
  }, [comparisonRooms]);

  const maxComparisonReached = comparisonRooms.length >= MAX_COMPARISON_ROOMS;

  return {
    comparisonRooms,
    isComparing: comparisonRooms.length > 1,
    addToComparison,
    removeFromComparison,
    clearComparison,
    toggleComparison,
    isInComparison,
    maxComparisonReached
  };
};
