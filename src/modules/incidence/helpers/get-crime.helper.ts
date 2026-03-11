const CRIME_DATA_BY_SUBTYPOLOGY: any = new Map([
  [
    2127,
    {
      name: 'Homicidio',
      crime_id: 'c7f157ae-e343-4403-8df8-62cd12a6fdd6',
    },
  ],
  [
    2178,
    {
      name: 'Sicariato',
      crime_id: '743c5298-4cd6-4691-8f8e-96e882ec9817',
    },
  ],
  [
    2179,
    {
      name: 'Lesiones Leves y Graves',
      crime_id: '13b90d38-5b43-4b76-a49b-b1fb65a5d074',
    },
  ],
  [
    2130,
    {
      name: 'Secuestro',
      crime_id: '356e95d6-e25a-4c66-b0e5-de604897ca3e',
    },
  ],
  [
    2134,
    {
      name: 'Robo a Persona',
      crime_id: '09e3cfad-e42b-499a-a5b3-7802b5c2033e',
    },
  ],
  [
    2185,
    {
      name: 'Robo a Persona',
      crime_id: '09e3cfad-e42b-499a-a5b3-7802b5c2033e',
    },
  ],
  [
    2135,
    {
      name: 'Robo a Vehiculo',
      crime_id: '3b15aa6e-4574-4986-8b36-7aa146cc7aa6',
    },
  ],
  [
    2137,
    {
      name: 'Robo a Accesorios y Autopartes',
      crime_id: '39a76381-0c4f-41ce-aac9-4b67b1bab9df',
    },
  ],
  [
    2131,
    {
      name: 'Extorsion',
      crime_id: '177e8bf2-a0a1-491d-9de5-112f1fb7ec30',
    },
  ],
  [
    2193,
    {
      name: 'Consumo de Drogas',
      crime_id: '0d6b0846-5f02-480c-9597-7364127129d7',
    },
  ],
  [
    12199,
    {
      name: 'Accidente Vehicular',
      crime_id: 'f77499b0-06e2-490d-91e7-ff8ee10a671f',
    },
  ],
  [
    12200,
    {
      name: 'Accidente Vehicular',
      crime_id: 'f77499b0-06e2-490d-91e7-ff8ee10a671f',
    },
  ],
  [
    2147,
    {
      name: 'Incendio',
      crime_id: '361bb3ad-473a-48c0-b704-3d2f4ab7d3a5',
    },
  ],
]);

export function getCrimeDataBySubtypology(id: number): any {
  return CRIME_DATA_BY_SUBTYPOLOGY.get(Number(id)) ?? null;
}
