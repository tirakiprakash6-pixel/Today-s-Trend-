/**
 * Indian PIN Code Lookup & City/District/State Auto-Detection Service
 * Uses the India Post Pincode API (https://api.postalpincode.in/pincode/)
 * with fast offline fallback, twin-city/alias awareness, and transliteration tolerance.
 */

export interface PincodeInfo {
  isValid: boolean;
  city: string;
  district: string;
  state: string;
  places: string[]; // List of post office / locality names under this PIN
  aliases?: string[]; // Alternate recognized names (e.g. Banahatti <-> Rabkavi Banhatti)
  error?: string;
}

// Built-in offline mapping for instant response and guaranteed accuracy for known regional hubs
const KNOWN_PINCODES: Record<string, Partial<PincodeInfo>> = {
  // Rabkavi Banhatti & Bagalkot region
  '587311': {
    city: 'Banhatti',
    district: 'Bagalkot',
    state: 'Karnataka',
    places: ['Banhatti', 'Banahatti', 'Rabkavi Banhatti', 'Rabkavi Banahatti', 'Rampura', 'Hosur', 'Tamadaddi', 'Konnur'],
    aliases: ['Banhatti', 'Banahatti', 'Rabkavi Banhatti', 'Rabkavi Banahatti', 'Rabkavi', 'Bagalkot'],
  },
  '587314': {
    city: 'Rabkavi',
    district: 'Bagalkot',
    state: 'Karnataka',
    places: ['Rabkavi', 'Rabkavi Banhatti', 'Banhatti', 'Banahatti', 'Halingali', 'Asangi', 'Rampura'],
    aliases: ['Rabkavi', 'Rabkavi Banhatti', 'Rabkavi Banahatti', 'Banhatti', 'Banahatti', 'Bagalkot'],
  },
  '587315': {
    city: 'Terdal',
    district: 'Bagalkot',
    state: 'Karnataka',
    places: ['Terdal', 'Golabhavi', 'Hanamapur', 'Kankanawadi'],
    aliases: ['Terdal', 'Bagalkot'],
  },
  '587313': {
    city: 'Mahalingpur',
    district: 'Bagalkot',
    state: 'Karnataka',
    places: ['Mahalingpur', 'Saidapur', 'Nandagaon', 'Bisanal'],
    aliases: ['Mahalingpur', 'Mahalingapura', 'Bagalkot'],
  },
  '587301': {
    city: 'Jamkhandi',
    district: 'Bagalkot',
    state: 'Karnataka',
    places: ['Jamkhandi', 'Kavalagi', 'Hunshikatti', 'Konnur', 'Alagundi'],
    aliases: ['Jamkhandi', 'Jamakhandi', 'Bagalkot'],
  },
  '587101': {
    city: 'Bagalkot',
    district: 'Bagalkot',
    state: 'Karnataka',
    places: ['Bagalkot', 'Navanagar', 'Vidyagiri', 'Kalligudda', 'Simikeri'],
    aliases: ['Bagalkot', 'Bagalkote'],
  },
  '587118': {
    city: 'Guledgudd',
    district: 'Bagalkot',
    state: 'Karnataka',
    places: ['Guledgudd', 'Guledgudda', 'Kotikal', 'Asangi'],
    aliases: ['Guledgudd', 'Guledgudda', 'Bagalkot'],
  },
  '587201': {
    city: 'Badami',
    district: 'Bagalkot',
    state: 'Karnataka',
    places: ['Badami', 'Adagal', 'Kendur', 'Anagawadi'],
    aliases: ['Badami', 'Bagalkot'],
  },
  '587115': {
    city: 'Mudhol',
    district: 'Bagalkot',
    state: 'Karnataka',
    places: ['Mudhol', 'Lokapur', 'Malali', 'Melligeri'],
    aliases: ['Mudhol', 'Bagalkot'],
  },
  '587116': {
    city: 'Ilkal',
    district: 'Bagalkot',
    state: 'Karnataka',
    places: ['Ilkal', 'Balkundi', 'Gaddanakeri', 'Gorbal'],
    aliases: ['Ilkal', 'Bagalkot'],
  },
};

// Common Indian city name aliases / variations
const CITY_ALIASES: Record<string, string[]> = {
  banhatti: ['banahatti', 'rabkavi', 'rabkavibanhatti', 'rabkavibanahatti', 'bagalkot'],
  banahatti: ['banhatti', 'rabkavi', 'rabkavibanhatti', 'rabkavibanahatti', 'bagalkot'],
  rabkavi: ['banhatti', 'banahatti', 'rabkavibanhatti', 'rabkavibanahatti', 'bagalkot'],
  rabkavibanhatti: ['banhatti', 'banahatti', 'rabkavi', 'bagalkot'],
  bangalore: ['bengaluru', 'bangaloreurban', 'bangalorerural'],
  bengaluru: ['bangalore', 'bangaloreurban', 'bangalorerural'],
  bombay: ['mumbai', 'mumbaisuburban'],
  mumbai: ['bombay', 'mumbaisuburban', 'navimumbai', 'thane'],
  calcutta: ['kolkata'],
  kolkata: ['calcutta'],
  madras: ['chennai'],
  chennai: ['madras'],
  poona: ['pune'],
  pune: ['poona'],
  baroda: ['vadodara'],
  vadodara: ['baroda'],
  hubli: ['hubballi', 'dharwad', 'hublidharwad'],
  hubballi: ['hubli', 'dharwad', 'hublidharwad'],
  belgaum: ['belagavi'],
  belagavi: ['belgaum'],
  mysore: ['mysuru'],
  mysuru: ['mysore'],
  mangalore: ['mangaluru'],
  mangaluru: ['mangalore'],
  gulbarga: ['kalaburagi'],
  kalaburagi: ['gulbarga'],
  bijapur: ['vijayapura'],
  vijayapura: ['bijapur'],
  bellary: ['ballari'],
  ballari: ['bellary'],
  shimoga: ['shivamogga'],
  shivamogga: ['shimoga'],
  gurgaon: ['gurugram'],
  gurugram: ['gurgaon'],
};

// In-memory cache for fast instant lookups during user session
const pincodeCache = new Map<string, PincodeInfo>();

/**
 * Normalizes Indian town / city strings for robust transliteration comparison
 * Handles 'aa' -> 'a', 'ee' -> 'i', 'oo' -> 'u', 'w' -> 'v', strips punctuation
 */
function normalizePlaceString(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '')
    .replace(/w/g, 'v')
    .replace(/aa/g, 'a')
    .replace(/ee/g, 'i')
    .replace(/oo/g, 'u')
    .replace(/h/g, ''); // Handles transliteration aspirates e.g. Banhatti vs Banatti
}

/**
 * Fetch official postal details for a 6-digit Indian PIN Code
 */
export async function lookupPincode(pincode: string): Promise<PincodeInfo> {
  const cleanPin = pincode.replace(/\D/g, '');
  if (cleanPin.length !== 6) {
    return {
      isValid: false,
      city: '',
      district: '',
      state: '',
      places: [],
      error: 'PIN code must be 6 digits',
    };
  }

  // Check in-memory cache first
  if (pincodeCache.has(cleanPin)) {
    return pincodeCache.get(cleanPin)!;
  }

  // Check known regional directory for instant response
  const known = KNOWN_PINCODES[cleanPin];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

    const response = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Postal API error ${response.status}`);
    }

    const data = await response.json();

    if (Array.isArray(data) && data.length > 0 && data[0].Status === 'Success') {
      const postOffices = data[0].PostOffice || [];
      if (postOffices.length > 0) {
        const primary = postOffices[0];
        const state = primary.State || known?.state || '';
        const district = primary.District || known?.district || '';

        // Collect all distinct post office / village / town names
        const placesSet = new Set<string>();
        if (known?.places) {
          known.places.forEach((p) => placesSet.add(p));
        }

        postOffices.forEach((po: any) => {
          if (po.Name) {
            const cleanName = po.Name.replace(/\s+(SO|BO|HO|S\.O|B\.O|H\.O)$/i, '').trim();
            if (cleanName) placesSet.add(cleanName);
          }
          if (po.Block && po.Block !== 'NA') placesSet.add(po.Block.trim());
        });

        const places = Array.from(placesSet);

        // Best primary town / city
        let townName = known?.city || '';
        if (!townName) {
          townName = primary.Name || primary.Block || primary.District || '';
          townName = townName.replace(/\s+(SO|BO|HO|S\.O|B\.O|H\.O)$/i, '').trim();
        }

        const result: PincodeInfo = {
          isValid: true,
          city: townName,
          district,
          state,
          places,
          aliases: known?.aliases || [townName, district],
        };

        pincodeCache.set(cleanPin, result);
        return result;
      }
    }

    // If API returned failure but we have known fallback
    if (known) {
      const result: PincodeInfo = {
        isValid: true,
        city: known.city || '',
        district: known.district || '',
        state: known.state || '',
        places: known.places || [known.city || ''],
        aliases: known.aliases || [],
      };
      pincodeCache.set(cleanPin, result);
      return result;
    }

    // Invalid PIN code returned by postal directory
    const invalidResult: PincodeInfo = {
      isValid: false,
      city: '',
      district: '',
      state: '',
      places: [],
      error: 'PIN code not found in Indian Postal records',
    };
    pincodeCache.set(cleanPin, invalidResult);
    return invalidResult;
  } catch (err) {
    console.warn('Pincode lookup network error or timeout:', err);
    // Use known fallback or permissive fallback
    if (known) {
      return {
        isValid: true,
        city: known.city || '',
        district: known.district || '',
        state: known.state || '',
        places: known.places || [known.city || ''],
        aliases: known.aliases || [],
      };
    }
    return {
      isValid: true,
      city: '',
      district: '',
      state: '',
      places: [],
    };
  }
}

/**
 * Checks if user's entered city matches the places/district/aliases for the given PIN code
 * Accounts for transliterations (e.g. Banhatti vs Banahatti, Rabkavi vs Rabkavi Banhatti)
 */
export function isCityBelongingToPincode(
  userCity: string,
  pincodeInfo: PincodeInfo
): { matches: boolean; suggestedCity?: string } {
  if (!pincodeInfo || !pincodeInfo.isValid) {
    return { matches: true };
  }

  const rawUser = userCity.trim().toLowerCase();
  const cleanUser = rawUser.replace(/[^a-z0-9]/g, '');
  if (!cleanUser || cleanUser.length < 2) return { matches: true };

  const normUser = normalizePlaceString(userCity);

  // 1. Direct match with all postal places under this PIN
  const matchDirect = (pincodeInfo.places || []).some((place) => {
    const cleanPlace = place.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normPlace = normalizePlaceString(place);
    return (
      cleanUser.includes(cleanPlace) ||
      cleanPlace.includes(cleanUser) ||
      normUser.includes(normPlace) ||
      normPlace.includes(normUser)
    );
  });

  if (matchDirect) return { matches: true };

  // 2. Direct match with primary District or City or State
  const cleanDistrict = (pincodeInfo.district || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanCity = (pincodeInfo.city || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const normDistrict = normalizePlaceString(pincodeInfo.district || '');
  const normCity = normalizePlaceString(pincodeInfo.city || '');

  if (
    (cleanDistrict && (cleanUser.includes(cleanDistrict) || cleanDistrict.includes(cleanUser) || normUser.includes(normDistrict) || normDistrict.includes(normUser))) ||
    (cleanCity && (cleanUser.includes(cleanCity) || cleanCity.includes(cleanUser) || normUser.includes(normCity) || normCity.includes(normUser)))
  ) {
    return { matches: true };
  }

  // 3. Match with known aliases
  if (pincodeInfo.aliases && pincodeInfo.aliases.length > 0) {
    const matchAlias = pincodeInfo.aliases.some((alias) => {
      const cleanAlias = alias.toLowerCase().replace(/[^a-z0-9]/g, '');
      const normAlias = normalizePlaceString(alias);
      return (
        cleanUser.includes(cleanAlias) ||
        cleanAlias.includes(cleanUser) ||
        normUser.includes(normAlias) ||
        normAlias.includes(normUser)
      );
    });
    if (matchAlias) return { matches: true };
  }

  // 4. Global dictionary aliases (e.g. banahatti -> banhatti)
  for (const [key, aliasList] of Object.entries(CITY_ALIASES)) {
    const normKey = normalizePlaceString(key);
    if (normUser.includes(normKey) || normKey.includes(normUser)) {
      // Check if any alias is in pincode places or district
      const foundInPin = aliasList.some((alias) => {
        const normAlias = normalizePlaceString(alias);
        return (
          normCity.includes(normAlias) ||
          normDistrict.includes(normAlias) ||
          (pincodeInfo.places || []).some((p) => normalizePlaceString(p).includes(normAlias))
        );
      });
      if (foundInPin) return { matches: true };
    }
  }

  // If no match found, flag mismatch with suggested city
  return {
    matches: false,
    suggestedCity: pincodeInfo.city || pincodeInfo.places?.[0] || pincodeInfo.district,
  };
}

/**
 * Checks if entered district or state conflicts severely with the postal data
 */
export function isLocationMatchingPincode(
  userDistrict: string,
  userState: string,
  pincodeInfo: PincodeInfo
): { matches: boolean; suggestedDistrict?: string; suggestedState?: string } {
  if (!pincodeInfo || !pincodeInfo.isValid) {
    return { matches: true };
  }

  const cleanUserDist = userDistrict.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanPinDist = (pincodeInfo.district || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');

  if (cleanUserDist && cleanPinDist && !cleanUserDist.includes(cleanPinDist) && !cleanPinDist.includes(cleanUserDist)) {
    return {
      matches: false,
      suggestedDistrict: pincodeInfo.district,
      suggestedState: pincodeInfo.state,
    };
  }

  return { matches: true };
}

