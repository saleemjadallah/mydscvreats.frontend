"use client";

import { Card, CardContent } from "@/components/ui/card";
import { MenuEditor } from "@/components/menu/menu-editor";
import { useRestaurant } from "@/hooks/use-restaurant";

export default function DashboardMenuPage() {
  const { restaurant, loading, refresh } = useRestaurant();

  if (loading) {
    return <Card><CardContent className="p-8">Loading menu...</CardContent></Card>;
  }

  if (!restaurant) {
    return <Card><CardContent className="p-8">Create your restaurant first.</CardContent></Card>;
  }

  return (
    <MenuEditor
      restaurantId={restaurant.id}
      initialSections={restaurant.menuSections ?? []}
      onRefresh={refresh}
    />
  );
}
