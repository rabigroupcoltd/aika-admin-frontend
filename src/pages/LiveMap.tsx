import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Search } from 'lucide-react';
import { Button, Card, ErrorState, Input, PageHeader, Select, cn } from '@/components/ui';
import { humanise } from '@/lib/format';
import { useGetLiveDriversManager } from '@/modules/admin/adminController';
import type { LiveDriver, LiveDriverStatus } from '@/modules/admin/type';

const STYLE_LIGHT = 'https://tiles.openfreemap.org/styles/liberty';
const STYLE_DARK = 'https://tiles.openfreemap.org/styles/dark';
const MINNA: [number, number] = [6.5569, 9.6139];
const STALE_MS = 5 * 60 * 1000;

const STATUS: Record<LiveDriverStatus, { label: string; color: string; chip: string }> = {
  AVAILABLE: { label: 'Available', color: '#16a34a', chip: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  BUSY: { label: 'On a trip', color: '#d97706', chip: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  RESTRICTED: { label: 'Restricted', color: '#dc2626', chip: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
  DISCONNECTED: { label: 'Disconnected', color: '#6b7280', chip: 'bg-aiko-dark-100 text-aiko-dark-600 dark:bg-aiko-dark-800 dark:text-aiko-dark-300' },
};

function since(iso: string | null, now: number): string {
  if (!iso) return 'unknown';
  const seconds = Math.max(0, Math.round((now - Date.parse(iso)) / 1000));
  if (seconds < 20) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  return hours < 24 ? `${hours} h ago` : 'over a day ago';
}

function isStale(driver: LiveDriver, now: number): boolean {
  const at = driver.position?.recordedAt;
  return !at || now - Date.parse(at) > STALE_MS;
}

function vehicleName(driver: LiveDriver): string {
  return [driver.vehicleBrand, driver.vehicleModel].filter(Boolean).join(' ') || humanise(driver.vehicleType);
}

function markerElement(driver: LiveDriver, stale: boolean): HTMLElement {
  const el = document.createElement('div');
  const color = STATUS[driver.status].color;
  el.style.cssText = `width:30px;height:30px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;cursor:pointer;opacity:${stale ? 0.45 : 1};`;
  el.innerHTML =
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>';
  el.setAttribute('aria-label', driver.name ?? 'Driver');
  return el;
}

function popupHtml(driver: LiveDriver, now: number): string {
  const esc = (value: string) =>
    value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
  const status = STATUS[driver.status];
  return `
    <div style="font-family:inherit;min-width:180px">
      <div style="font-weight:600;font-size:14px">${esc(driver.name ?? 'Unnamed')}</div>
      <div style="font-size:12px;color:#6b7280">${esc(vehicleName(driver))}${driver.vehiclePlate ? ' · ' + esc(driver.vehiclePlate) : ''}</div>
      <div style="margin-top:6px;font-size:12px"><span style="color:${status.color};font-weight:600">${status.label}</span>${driver.heldOrders ? ` · ${driver.heldOrders} order${driver.heldOrders > 1 ? 's' : ''}` : ''}</div>
      <div style="font-size:12px;color:#6b7280">Location ${since(driver.position?.recordedAt ?? null, now)}${driver.position?.source === 'last-known' ? ' (last known)' : ''}</div>
      ${driver.phone ? `<div style="font-size:12px;margin-top:4px"><a href="tel:${esc(driver.phone)}" style="color:#0D8A41">${esc(driver.phone)}</a></div>` : ''}
      <div style="font-size:12px;margin-top:6px"><a href="/users/${esc(driver.userId)}" style="color:#0D8A41;font-weight:600">Open profile →</a></div>
    </div>`;
}

function useIsDark(): boolean {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  useEffect(() => {
    const observer = new MutationObserver(() =>
      setDark(document.documentElement.classList.contains('dark')),
    );
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  return dark;
}

export function LiveMap() {
  const { data, isLoading, isError, error, refetch, isFetching, dataUpdatedAt } = useGetLiveDriversManager();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LiveDriverStatus | ''>('');
  const [now, setNow] = useState(Date.now());
  const dark = useIsDark();

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map());
  const fittedRef = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(timer);
  }, []);

  const drivers = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (data?.drivers ?? []).filter((driver) => {
      if (statusFilter && driver.status !== statusFilter) return false;
      if (!term) return true;
      return [driver.name, driver.phone, driver.vehiclePlate]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(term));
    });
  }, [data, search, statusFilter]);

  useEffect(() => {
    if (!containerRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: dark ? STYLE_DARK : STYLE_LIGHT,
      center: MINNA,
      zoom: 12,
      attributionControl: { compact: true },
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    mapRef.current = map;
    const markers = markersRef.current;
    return () => {
      markers.forEach((marker) => marker.remove());
      markers.clear();
      map.remove();
      mapRef.current = null;
      fittedRef.current = false;
    };
  }, []);

  useEffect(() => {
    mapRef.current?.setStyle(dark ? STYLE_DARK : STYLE_LIGHT);
  }, [dark]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const markers = markersRef.current;
    const visible = new Set<string>();

    for (const driver of drivers) {
      if (!driver.position) continue;
      visible.add(driver.driverId);
      const lngLat: [number, number] = [driver.position.lng, driver.position.lat];
      const stale = isStale(driver, now);
      const existing = markers.get(driver.driverId);

      if (existing) {
        existing.setLngLat(lngLat);
        const fresh = markerElement(driver, stale);
        const el = existing.getElement();
        el.style.cssText = fresh.style.cssText;
        existing.getPopup()?.setHTML(popupHtml(driver, now));
      } else {
        const marker = new maplibregl.Marker({ element: markerElement(driver, stale) })
          .setLngLat(lngLat)
          .setPopup(new maplibregl.Popup({ offset: 18, closeButton: false }).setHTML(popupHtml(driver, now)))
          .addTo(map);
        markers.set(driver.driverId, marker);
      }
    }

    for (const [id, marker] of markers) {
      if (!visible.has(id)) {
        marker.remove();
        markers.delete(id);
      }
    }

    if (!fittedRef.current && visible.size > 0) {
      const points = drivers.filter((d) => d.position).map((d) => [d.position!.lng, d.position!.lat] as [number, number]);
      const bounds = points.reduce(
        (b, p) => b.extend(p),
        new maplibregl.LngLatBounds(points[0], points[0]),
      );
      map.fitBounds(bounds, { padding: 80, maxZoom: 15, duration: 0 });
      fittedRef.current = true;
    }
  }, [drivers, now]);

  function focus(driver: LiveDriver) {
    const map = mapRef.current;
    if (!map || !driver.position) return;
    map.flyTo({ center: [driver.position.lng, driver.position.lat], zoom: 16 });
    const marker = markersRef.current.get(driver.driverId);
    if (marker && !marker.getPopup()?.isOpen()) marker.togglePopup();
  }

  const counts = data?.counts;

  return (
    <>
      <PageHeader
        title="Live Map"
        subtitle="Every rider on shift right now. Refreshes every 30 seconds."
        action={
          <div className="flex items-center gap-3 text-sm text-aiko-dark-500">
            {dataUpdatedAt ? <span>Updated {since(new Date(dataUpdatedAt).toISOString(), now)}</span> : null}
            <Button variant="outline" onClick={() => void refetch()} disabled={isFetching}>
              <span className="inline-flex items-center gap-1.5">
                <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} /> Refresh
              </span>
            </Button>
          </div>
        }
      />

      {counts ? (
        <div className="mb-4 flex flex-wrap gap-2 text-sm">
          <span className="rounded-full bg-aiko-dark-900 px-3 py-1 font-medium text-white dark:bg-white dark:text-aiko-dark-900">
            {counts.online} on shift
          </span>
          {(Object.keys(STATUS) as LiveDriverStatus[]).map((key) => {
            const value = counts[{ AVAILABLE: 'available', BUSY: 'busy', RESTRICTED: 'restricted', DISCONNECTED: 'disconnected' }[key] as keyof typeof counts] as number;
            return (
              <button
                key={key}
                onClick={() => setStatusFilter(statusFilter === key ? '' : key)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium transition-shadow',
                  STATUS[key].chip,
                  statusFilter === key && 'ring-2 ring-offset-1 ring-aiko-green-500',
                )}>
                <span className="h-2 w-2 rounded-full" style={{ background: STATUS[key].color }} />
                {value} {STATUS[key].label.toLowerCase()}
              </button>
            );
          })}
          {counts.noLocation > 0 ? (
            <span className="rounded-full px-3 py-1 text-aiko-dark-500">
              {counts.noLocation} without a location yet
            </span>
          ) : null}
        </div>
      ) : null}

      {isError ? (
        <ErrorState message={error?.message ?? 'Could not load drivers.'} onRetry={refetch} />
      ) : null}

      <div className="grid gap-4 lg:grid-cols-4">
        <div className="relative overflow-hidden rounded-xl border border-aiko-dark-100 dark:border-aiko-dark-800 lg:col-span-3">
          <div ref={containerRef} className="h-[60vh] min-h-[420px] w-full lg:h-[calc(100vh-260px)]" />
          {!isLoading && data && data.drivers.length === 0 ? (
            <div className="pointer-events-none absolute inset-x-0 top-4 mx-auto w-fit rounded-full bg-white/90 px-4 py-2 text-sm shadow dark:bg-aiko-dark-900/90">
              No riders on shift right now
            </div>
          ) : null}
        </div>

        <Card padded={false} className="flex max-h-[60vh] flex-col lg:max-h-[calc(100vh-260px)]">
          <div className="space-y-2 border-b border-aiko-dark-100 p-3 dark:border-aiko-dark-800">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-aiko-dark-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Name, phone or plate"
                className="pl-9"
              />
            </div>
            <Select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as LiveDriverStatus | '')}>
              <option value="">All statuses</option>
              {(Object.keys(STATUS) as LiveDriverStatus[]).map((key) => (
                <option key={key} value={key}>
                  {STATUS[key].label}
                </option>
              ))}
            </Select>
          </div>

          <ul className="flex-1 divide-y divide-aiko-dark-100 overflow-y-auto dark:divide-aiko-dark-800">
            {isLoading ? (
              <li className="p-4 text-sm text-aiko-dark-500">Loading riders…</li>
            ) : drivers.length === 0 ? (
              <li className="p-4 text-sm text-aiko-dark-500">No riders match.</li>
            ) : (
              drivers.map((driver) => (
                <li key={driver.driverId}>
                  <button
                    onClick={() => focus(driver)}
                    disabled={!driver.position}
                    className="flex w-full items-start gap-3 px-3 py-2.5 text-left hover:bg-aiko-dark-50 disabled:cursor-default disabled:opacity-70 dark:hover:bg-aiko-dark-800/60">
                    <span
                      className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: STATUS[driver.status].color }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-aiko-dark-900 dark:text-white">
                        {driver.name ?? 'Unnamed'}
                      </span>
                      <span className="block truncate text-xs text-aiko-dark-500">
                        {vehicleName(driver)}
                        {driver.vehiclePlate ? ` · ${driver.vehiclePlate}` : ''}
                      </span>
                      <span className={cn('block text-xs', isStale(driver, now) ? 'text-amber-600' : 'text-aiko-dark-400')}>
                        {driver.position ? `Seen ${since(driver.position.recordedAt, now)}` : 'No location yet'}
                        {driver.heldOrders ? ` · ${driver.heldOrders} order${driver.heldOrders > 1 ? 's' : ''}` : ''}
                      </span>
                    </span>
                    <Link
                      to={`/users/${driver.userId}`}
                      onClick={(event) => event.stopPropagation()}
                      className="mt-0.5 text-xs font-medium text-aiko-green-600 hover:underline">
                      Profile
                    </Link>
                  </button>
                </li>
              ))
            )}
          </ul>
        </Card>
      </div>
    </>
  );
}
