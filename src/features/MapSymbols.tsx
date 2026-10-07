import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Marker, type Map } from 'maplibre-gl';
import { Bus, BusFront, Van } from 'lucide-react';
import type { Scenario } from '../domain/schema';

export function VehicleIcon({
  category,
  size = 23,
}: {
  category: Scenario['ev']['category'];
  size?: number;
}) {
  const Icon = category === 'van' ? Van : category === 'minibus' ? BusFront : Bus;
  return <Icon size={size} aria-hidden="true" />;
}

/** El contenido sigue siendo React: botones nativos, sin HTML interpolado de fuentes externas. */
export function MapSymbol({
  map,
  coordinates,
  children,
}: {
  map: Map;
  coordinates: number[];
  children: ReactNode;
}) {
  const [element] = useState(() => document.createElement('div'));
  const [marker] = useState(() => new Marker({ element }));
  useEffect(() => {
    marker.setLngLat([coordinates[0]!, coordinates[1]!]).addTo(map);
    return () => {
      marker.remove();
    };
  }, [map, marker]);
  useEffect(() => {
    marker.setLngLat([coordinates[0]!, coordinates[1]!]);
  }, [marker, coordinates[0], coordinates[1]]);
  return createPortal(children, element);
}

export interface Hospital {
  name: string;
  shortName: string;
  address: string;
  officialUrl: string;
  osmUrl: string;
  limitation: string;
}
