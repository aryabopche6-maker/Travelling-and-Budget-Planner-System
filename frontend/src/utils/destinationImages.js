// src/utils/destinationImages.js
// Maps destination keywords to curated Unsplash images.
// Falls back to a premium travel landscape if no match found.

const DESTINATION_MAP = [
  // ── Indian destinations ────────────────────────────────────────────
  { keywords: ['goa'], url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1600&auto=format&fit=crop' },
  { keywords: ['manali', 'himachal'], url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=1600&auto=format&fit=crop' },
  { keywords: ['kerala', 'backwater', 'munnar', 'alleppey'], url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=1600&auto=format&fit=crop' },
  { keywords: ['jaipur', 'rajasthan', 'jodhpur', 'udaipur'], url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=1600&auto=format&fit=crop' },
  { keywords: ['kashmir', 'srinagar', 'gulmarg'], url: 'https://images.unsplash.com/photo-1577735934-98c42a4ba2b8?q=80&w=1600&auto=format&fit=crop' },
  { keywords: ['meghalaya', 'shillong', 'cherrapunji'], url: 'https://images.unsplash.com/photo-1506461883276-594a12b11cf3?q=80&w=1600&auto=format&fit=crop' },
  { keywords: ['rishikesh', 'haridwar', 'uttarakhand'], url: 'https://images.unsplash.com/photo-1588083949404-c4f1ed1323b3?q=80&w=1600&auto=format&fit=crop' },
  { keywords: ['andaman', 'port blair', 'havelock'], url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600&auto=format&fit=crop' },
  { keywords: ['mumbai', 'bombay'], url: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=1600&auto=format&fit=crop' },
  { keywords: ['delhi', 'new delhi'], url: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=1600&auto=format&fit=crop' },
  { keywords: ['varanasi', 'banaras'], url: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?q=80&w=1600&auto=format&fit=crop' },
  { keywords: ['coorg', 'kodagu', 'coorg'], url: 'https://images.unsplash.com/photo-1595658658481-d53d3f999875?q=80&w=1600&auto=format&fit=crop' },
  // ── International ─────────────────────────────────────────────────
  { keywords: ['bali', 'indonesia'], url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1600&auto=format&fit=crop' },
  { keywords: ['tokyo', 'japan', 'kyoto', 'osaka'], url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1600&auto=format&fit=crop' },
  { keywords: ['paris', 'france'], url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1600&auto=format&fit=crop' },
  { keywords: ['santorini', 'greece', 'athens'], url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=1600&auto=format&fit=crop' },
  { keywords: ['swiss', 'switzerland', 'zurich', 'alps'], url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1600&auto=format&fit=crop' },
  { keywords: ['dubai', 'uae'], url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1600&auto=format&fit=crop' },
  { keywords: ['maldives'], url: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=1600&auto=format&fit=crop' },
  { keywords: ['new york', 'nyc', 'usa', 'san francisco', 'america'], url: 'https://images.unsplash.com/photo-1490644658840-3f2e3f8c5625?q=80&w=1600&auto=format&fit=crop' },
  { keywords: ['london', 'uk', 'england'], url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1600&auto=format&fit=crop' },
  { keywords: ['rome', 'italy', 'milan', 'florence'], url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=1600&auto=format&fit=crop' },
  { keywords: ['thailand', 'bangkok', 'phuket', 'chiang mai'], url: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=1600&auto=format&fit=crop' },
];

const FALLBACK = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1600&auto=format&fit=crop';

/**
 * Returns the best matching Unsplash image URL for a destination string.
 * @param {string} destination e.g. "Paris, France" or "Goa"
 * @returns {string} image URL
 */
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

export { FALLBACK as DEFAULT_TRAVEL_IMAGE };
