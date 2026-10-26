export const referralSources = [
  { value: 'instagram', sk: 'Instagram', en: 'Instagram' },
  { value: 'facebook', sk: 'Facebook', en: 'Facebook' },
  { value: 'google', sk: 'Google / vyhľadávanie', en: 'Google / search' },
  { value: 'youtube', sk: 'YouTube', en: 'YouTube' },
  { value: 'recommendation', sk: 'Odporúčanie od známeho', en: 'Recommendation from a friend' },
  { value: 'in-person', sk: 'Osobné stretnutie / podujatie', en: 'In person / event' },
  { value: 'manufacturer', sk: 'Cargobike of Sweden', en: 'Cargobike of Sweden' },
  { value: 'other', sk: 'Inak', en: 'Other' },
] as const;
export const referralLabel = (value?: string) => referralSources.find(source => source.value === value)?.sk ?? 'Neuvedené';
