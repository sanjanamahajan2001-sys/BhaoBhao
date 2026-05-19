export function formatDateTimeCustom(date) {
  const d = new Date(date);

  const day = String(d.getDate()).padStart(2, '0');
  const month = d.toLocaleString('en-IN', { month: 'long' });
  const year = d.getFullYear();

  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12 || 12;

  return `${day}-${month}-${year}, ${hours}:${minutes}:${seconds} ${ampm}`;
}

export function formatUtcToIst(dateUtc) {
  const d = new Date(dateUtc);

  // IST offset = +5:30 hours = 330 minutes
  const istOffset = 5.5 * 60; // minutes
  const utcOffset = d.getTimezoneOffset(); // minutes in local timezone
  const istTime = new Date(d.getTime() + (istOffset + utcOffset) * 60 * 1000);

  const day = String(istTime.getDate()).padStart(2, '0');
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const month = monthNames[istTime.getMonth()];
  const year = istTime.getFullYear();

  let hours = istTime.getHours();
  const minutes = String(istTime.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  return `${day}-${month}-${year}, ${hours}:${minutes} ${ampm}`;
}
