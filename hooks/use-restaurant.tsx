"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "@clerk/nextjs";
import { apiClient } from "@/lib/api-client";
import type { Restaurant } from "@/types";

interface RestaurantContextValue {
  restaurant: Restaurant | null;
  loading: boolean;
  refresh: () => Promise<void>;
  setRestaurant: (restaurant: Restaurant | null) => void;
}

const RestaurantContext = createContext<RestaurantContextValue | null>(null);

export function RestaurantProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { getToken, isSignedIn } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const restaurantRef = useRef<Restaurant | null>(null);

  useEffect(() => {
    restaurantRef.current = restaurant;
  }, [restaurant]);

  const refresh = useCallback(async () => {
    if (!isSignedIn) {
      setRestaurant(null);
      setLoading(false);
      return;
    }

    if (!restaurantRef.current) {
      setLoading(true);
    }

    try {
      const token = await getToken();
      if (!token) {
        setRestaurant(null);
        return;
      }

      const response = await apiClient.getCurrentRestaurant(token);
      setRestaurant(response.restaurant);
    } catch (error) {
      console.error(error);
      setRestaurant(null);
    } finally {
      setLoading(false);
    }
  }, [getToken, isSignedIn]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({
      restaurant,
      loading,
      refresh,
      setRestaurant,
    }),
    [loading, refresh, restaurant]
  );

  return <RestaurantContext.Provider value={value}>{children}</RestaurantContext.Provider>;
}

export function useRestaurant() {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error("useRestaurant must be used within RestaurantProvider");
  }

  return context;
}
