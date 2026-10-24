// src/utils/destinationImages.js
// Maps destination & category keywords to high-resolution curated Unsplash images.
// Falls back to high-quality travel visuals if no direct match is found.

const DESTINATION_MAP = [
  // ── Indian destinations ────────────────────────────────────────────
  { keywords: ['kochi', 'cochin', 'fort kochi'], url: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=1600&auto=format&fit=crop' },
  { keywords: ['goa'], url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1600&auto=format&fit=crop' },
  { keywords: ['manali', 'himachal'], url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=1600&auto=format&fit=crop' },
  { keywords: ['kerala', 'backwater', 'munnar', 'alleppey'], url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=1600&auto=format&fit=crop' },
  { keywords: ['jaipur', 'rajasthan', 'jodhpur', 'udaipur', 'fort', 'palace'], url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=1600&auto=format&fit=crop' },
  { keywords: ['kashmir', 'srinagar', 'gulmarg'], url: 'https://images.unsplash.com/photo-1577735934-98c42a4ba2b8?q=80&w=1600&auto=format&fit=crop' },
  { keywords: ['meghalaya', 'shillong', 'cherrapunji'], url: 'https://images.unsplash.com/photo-1506461883276-594a12b11cf3?q=80&w=1600&auto=format&fit=crop' },
  { keywords: ['rishikesh', 'haridwar', 'uttarakhand', 'ganga', 'temple'], url: 'https://images.unsplash.com/photo-1588083949404-c4f1ed1323b3?q=80&w=1600&auto=format&fit=crop' },
  { keywords: ['andaman', 'port blair', 'havelock', 'beach', 'sea'], url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600&auto=format&fit=crop' },
  { keywords: ['mumbai', 'bombay'], url: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=1600&auto=format&fit=crop' },
  { keywords: ['delhi', 'new delhi', 'india gate', 'red fort'], url: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=1600&auto=format&fit=crop' },
  { keywords: ['varanasi', 'banaras', 'ghat'], url: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?q=80&w=1600&auto=format&fit=crop' },
  { keywords: ['coorg', 'kodagu'], url: 'https://images.unsplash.com/photo-1595658658481-d53d3f999875?q=80&w=1600&auto=format&fit=crop' },
  // ── International ─────────────────────────────────────────────────
  { keywords: ['bali', 'indonesia'], url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1600&auto=format&fit=crop' },
  { keywords: ['tokyo', 'japan', 'kyoto', 'osaka'], url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1600&auto=format&fit=crop' },
  { keywords: ['paris', 'france', 'eiffel'], url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1600&auto=format&fit=crop' },
  { keywords: ['santorini', 'greece', 'athens'], url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=1600&auto=format&fit=crop' },
  { keywords: ['swiss', 'switzerland', 'zurich', 'alps'], url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1600&auto=format&fit=crop' },
  { keywords: ['dubai', 'uae'], url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1600&auto=format&fit=crop' },
  { keywords: ['maldives'], url: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=1600&auto=format&fit=crop' },
  { keywords: ['new york', 'nyc', 'usa', 'san francisco'], url: 'https://images.unsplash.com/photo-1490644658840-3f2e3f8c5625?q=80&w=1600&auto=format&fit=crop' },
  { keywords: ['london', 'uk', 'england'], url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1600&auto=format&fit=crop' },
  { keywords: ['rome', 'italy', 'milan', 'colosseum'], url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=1600&auto=format&fit=crop' },
  { keywords: ['thailand', 'bangkok', 'phuket', 'chiang mai'], url: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=1600&auto=format&fit=crop' },
];

const CATEGORY_MAP = [
  { keywords: ['fort', 'jail', 'heritage', 'monument', 'ruins', 'castle', 'history'], url: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=1200&auto=format&fit=crop' },
  { keywords: ['beach', 'sea', 'coast', 'island', 'lighthouse', 'water'], url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop' },
  { keywords: ['museum', 'gallery', 'art', 'exhibit'], url: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?q=80&w=1200&auto=format&fit=crop' },
  { keywords: ['temple', 'shrine', 'church', 'cathedral', 'mosque', 'spiritual'], url: 'https://images.unsplash.com/photo-1544885935-98dd03b09034?q=80&w=1200&auto=format&fit=crop' },
  { keywords: ['park', 'garden', 'nature', 'forest', 'waterfall', 'lake', 'wildlife'], url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop' },
  { keywords: ['palace', 'mansion', 'haveli'], url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=1200&auto=format&fit=crop' },
  { keywords: ['market', 'bazaar', 'street', 'food', 'dining'], url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop' },
];

const FALLBACK = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1600&auto=format&fit=crop';

export function getDestinationImage(destination = '') {
  if (!destination) return FALLBACK;
  const lower = destination.toLowerCase();
  for (const entry of DESTINATION_MAP) {
    if (entry.keywords.some(kw => lower.includes(kw))) {
      return entry.url;
    }
  }
  return FALLBACK;
}

/**
 * Returns a high-definition real landmark photo for a place attraction.
 */
export function getPlacePhoto(place = {}, destination = '') {
  if (place.imageUrl && place.imageUrl.trim().startsWith('http')) {
    return place.imageUrl;
  }
  
  const searchStr = `${place.name || ''} ${place.category || ''} ${place.description || ''} ${destination || ''}`.toLowerCase();
  
  // 1. Check place category / name keywords
  for (const entry of CATEGORY_MAP) {
    if (entry.keywords.some(kw => searchStr.includes(kw))) {
      return entry.url;
    }
  }

  // 2. Check destination fallback
  return getDestinationImage(destination);
}

export { FALLBACK as DEFAULT_TRAVEL_IMAGE };
