import { Random } from 'ponczek/math';

const prefix = [
  '',
  'New ',
  'Lake ',
  'Port ',
  'Fort ',
  'San ',
  'Los ',
  'Pine ',
  'North ',
  'West ',
  'East ',
  'South ',
  'Oak ',
  'Mount ',
  'Mc',
];

const postfix = [
  '',
  ' Hills',
  ' City',
  ' Falls',
  ' Valley',
  ' Hole',
  'ville',
  'town',
  'land',
];

const names = [
  'Panama',
  'Taylor',
  'Burn',
  'Independence',
  'Freedom',
  'Orange',
  'Bedford',
  'Collins',
  'Grove',
  'Bowie',
  'Bluff',
  'Head',
  'Young',
  'Culver',
  'Tustin',
  'Oldwark',
  'Jackson',
];

export function generateCityName(): string {
  const r = Random.default;
  return r.pickOne(prefix) + r.pickOne(names) + r.pickOne(postfix);
}
