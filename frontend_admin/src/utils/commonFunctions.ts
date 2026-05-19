import { Address } from '../types';

export function formatDate(dateString?: string | null): string {
  if (!dateString) return 'N/A';

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatAddress(address?: Address | null): string {
  if (!address) return '—';

  const parts = [];

  const flat = address.flat_no?.trim();
  const floor = address.floor?.trim();
  const apartment = address.apartment_name?.trim();

  // Combine flat, floor, and apartment name for the first part
  let buildingInfo = '';
  if (flat) buildingInfo += flat;
  if (floor) buildingInfo += (buildingInfo ? `, ${floor}` : floor);
  if (apartment)
    buildingInfo += (buildingInfo ? `, ${apartment}` : apartment);

  if (buildingInfo) parts.push(buildingInfo);

  if (address.full_address?.trim()) {
    parts.push(address.full_address.trim());
  }

  if (address.pincode?.trim()) {
    parts.push(address.pincode.trim());
  }

  return parts.length > 0 ? parts.join(', ') : '—';
}
