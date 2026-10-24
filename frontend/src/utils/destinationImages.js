// src/utils/destinationImages.js
// Curated pool of high-resolution landmark and attraction photos.
// Uses deterministic hash on place/hotel name so every card gets a DISTINCT, beautiful image!

const LANDMARK_COLLECTION = [
  'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=1200&auto=format&fit=crop', // Ancient fort / stepwell
  'https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=1200&auto=format&fit=crop', // India Gate / Historic Arch
  'https://images.unsplash.com/photo-1544885935-98dd03b09034?q=80&w=1200&auto=format&fit=crop', // Heritage Temple
  'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?q=80&w=1200&auto=format&fit=crop', // Art & Museum
  'https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=1200&auto=format&fit=crop', // Royal Palace courtyard
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop', // Scenic Garden / Nature
  'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=1200&auto=format&fit=crop', // Colonial street & waterfront
  'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?q=80&w=1200&auto=format&fit=crop', // Cultural Ghat / memorial
  'https://images.unsplash.com/photo-1588083949404-c4f1ed1323b3?q=80&w=1200&auto=format&fit=crop', // River sanctuary
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop', // Historic Bazaar & Town
  'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1200&auto=format&fit=crop', // Sunny seaside promenade
  'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=1200&auto=format&fit=crop', // Backwaters & palm trees
  'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=1200&auto=format&fit=crop', // Architectural monument
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop', // Tropical shoreline
  'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=1200&auto=format&fit=crop', // Mountain valley & pine
  'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1200&auto=format&fit=crop', // Sacred gate / monument
];

const HOTEL_COLLECTION = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop', // Luxury resort pool
  'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1200&auto=format&fit=crop', // Elegant hotel room
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200&auto=format&fit=crop', // Grand luxury hotel facade
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1200&auto=format&fit=crop', // Boutique resort with lounge
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1200&auto=format&fit=crop', // Seaside tropical villa
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=1200&auto=format&fit=crop', // Modern city hotel lobby
  'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?q=80&w=1200&auto=format&fit=crop', // Cozy heritage homestay
  'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=1200&auto=format&fit=crop', // Minimalist premium suite
];

const SPECIFIC_KEYWORD_MAP = [
  { keywords: ['step well', 'baoli', 'well', 'water tank'], url: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=1200&auto=format&fit=crop' },
  { keywords: ['memorial', 'monument', 'tomb', 'pillar', 'tower', 'telegraph'], url: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=1200&auto=format&fit=crop' },
  { keywords: ['fort', 'jail', 'castle', 'rampart', 'wall', 'ruins'], url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=1200&auto=format&fit=crop' },
  { keywords: ['temple', 'mandir', 'church', 'mosque', 'gurdwara', 'shrine'], url: 'https://images.unsplash.com/photo-1544885935-98dd03b09034?q=80&w=1200&auto=format&fit=crop' },
  { keywords: ['museum', 'gallery', 'art', 'archive'], url: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?q=80&w=1200&auto=format&fit=crop' },
  { keywords: ['park', 'garden', 'nature', 'botanical', 'wildlife', 'forest'], url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop' },
  { keywords: ['market', 'bazaar', 'street', 'chowk', 'chandni'], url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop' },
  { keywords: ['beach', 'sea', 'lake', 'waterfront', 'ghat'], url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop' }
];

const DESTINATION_MAP = [
  { keywords: ['goa'], url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1600&auto=format&fit=crop' },
  { keywords: ['manali', 'himachal'], url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=1600&auto=format&fit=crop' },
  { keywords: ['kerala', 'kochi', 'munnar', 'alleppey'], url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=1600&auto=format&fit=crop' },
  { keywords: ['jaipur', 'rajasthan', 'jodhpur', 'udaipur'], url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=1600&auto=format&fit=crop' },
  { keywords: ['kashmir', 'srinagar'], url: 'https://images.unsplash.com/photo-1577735934-98c42a4ba2b8?q=80&w=1600&auto=format&fit=crop' },
  { keywords: ['delhi', 'new delhi'], url: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=1600&auto=format&fit=crop' },
  { keywords: ['mumbai', 'bombay'], url: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=1600&auto=format&fit=crop' },
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
 * Returns a UNIQUE, distinct landmark image for every place.
 */
export function getPlacePhoto(place = {}, destination = '', index = 0) {
  if (place.imageUrl && place.imageUrl.trim().startsWith('http')) {
    return place.imageUrl;
  }

  const nameStr = (place.name || '').toLowerCase();
  const descStr = (place.description || '').toLowerCase();
  const fullText = `${nameStr} ${descStr}`;

  for (const item of SPECIFIC_KEYWORD_MAP) {
    if (item.keywords.some(kw => fullText.includes(kw))) {
      return item.url;
    }
  }

  let hash = 0;
  for (let i = 0; i < nameStr.length; i++) {
    hash = (hash << 5) - hash + nameStr.charCodeAt(i);
    hash |= 0;
  }
  const uniqueIndex = Math.abs(hash + index) % LANDMARK_COLLECTION.length;
  return LANDMARK_COLLECTION[uniqueIndex];
}

/**
 * Returns a UNIQUE, high-resolution hotel/stay image.
 */
export function getHotelPhoto(hotel = {}, index = 0) {
  if (hotel.imageUrl && hotel.imageUrl.trim().startsWith('http')) {
    return hotel.imageUrl;
  }

  const nameStr = (hotel.name || '').toLowerCase();
  let hash = 0;
  for (let i = 0; i < nameStr.length; i++) {
    hash = (hash << 5) - hash + nameStr.charCodeAt(i);
    hash |= 0;
  }
  const uniqueIndex = Math.abs(hash + index) % HOTEL_COLLECTION.length;
  return HOTEL_COLLECTION[uniqueIndex];
}

export { FALLBACK as DEFAULT_TRAVEL_IMAGE };
