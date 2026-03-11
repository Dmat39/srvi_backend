export function getZone(jurisdiction_id: number) {
  return [1, 2, 3].includes(jurisdiction_id)
    ? '44610b84-b615-42e7-83e1-9ae036810933'
    : [4, 5].includes(jurisdiction_id)
      ? '9d60e2d3-1969-4aaf-b801-71ade998aa46'
      : 'ec82c69e-f25f-4fac-bbce-fd6a905c3fe7';
}
