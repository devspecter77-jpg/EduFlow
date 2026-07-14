// Local storage keys
export const STORAGE_KEYS = {
  // Auth
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  USER: "user",
  
  // Theme
  THEME: "theme",
  SIDEBAR_COLLAPSED: "sidebar_collapsed",
  
  // Preferences
  LANGUAGE: "language",
  TABLE_PAGE_SIZE: "table_page_size",
  
  // Temporary data
  LAST_VISIT: "last_visit",
  DRAFT_DATA: "draft_data",
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
