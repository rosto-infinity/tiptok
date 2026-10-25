export interface CountryCode {
  name: string
  code: string
  dialCode: string
  flag: string
}

export const countryCodes: CountryCode[] = [
  { name: 'Cameroun', code: 'CM', dialCode: '+237', flag: '🇨🇲' },
  { name: 'France', code: 'FR', dialCode: '+33', flag: '🇫🇷' },
  { name: 'États-Unis', code: 'US', dialCode: '+1', flag: '🇺🇸' },
  { name: 'Canada', code: 'CA', dialCode: '+1', flag: '🇨🇦' },
  { name: 'Belgique', code: 'BE', dialCode: '+32', flag: '🇧🇪' },
  { name: 'Suisse', code: 'CH', dialCode: '+41', flag: '🇨🇭' },
  { name: 'Côte d\'Ivoire', code: 'CI', dialCode: '+225', flag: '🇨🇮' },
  { name: 'Sénégal', code: 'SN', dialCode: '+221', flag: '🇸🇳' },
  { name: 'Mali', code: 'ML', dialCode: '+223', flag: '🇲🇱' },
  { name: 'Gabon', code: 'GA', dialCode: '+241', flag: '🇬🇦' },
  { name: 'Congo-Brazzaville', code: 'CG', dialCode: '+242', flag: '🇨🇬' },
  { name: 'Congo-Kinshasa', code: 'CD', dialCode: '+243', flag: '🇨🇩' },
  { name: 'Maroc', code: 'MA', dialCode: '+212', flag: '🇲🇦' },
  { name: 'Algérie', code: 'DZ', dialCode: '+213', flag: '🇩🇿' },
  { name: 'Tunisie', code: 'TN', dialCode: '+216', flag: '🇹🇳' },
  { name: 'Royaume-Uni', code: 'GB', dialCode: '+44', flag: '🇬🇧' },
  { name: 'Allemagne', code: 'DE', dialCode: '+49', flag: '🇩🇪' },
  { name: 'Italie', code: 'IT', dialCode: '+39', flag: '🇮🇹' },
  { name: 'Espagne', code: 'ES', dialCode: '+34', flag: '🇪🇸' },
  { name: 'Nigeria', code: 'NG', dialCode: '+234', flag: '🇳🇬' },
  { name: 'Ghana', code: 'GH', dialCode: '+233', flag: '🇬🇭' },
  { name: 'Kenya', code: 'KE', dialCode: '+254', flag: '🇰🇪' },
  { name: 'Afrique du Sud', code: 'ZA', dialCode: '+27', flag: '🇿🇦' },
  { name: 'Togo', code: 'TG', dialCode: '+228', flag: '🇹🇬' },
  { name: 'Bénin', code: 'BJ', dialCode: '+229', flag: '🇧🇯' },
  { name: 'Burkina Faso', code: 'BF', dialCode: '+226', flag: '🇧🇫' },
  { name: 'Guinée', code: 'GN', dialCode: '+224', flag: '🇬🇳' },
  { name: 'Madagascar', code: 'MG', dialCode: '+261', flag: '🇲🇬' },
]
