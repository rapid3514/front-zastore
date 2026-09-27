// Authentication deliberately has no browser-storage helpers: tokens remain in memory only.
export const storage = {
  clearAppData() {
    // Reserved for non-sensitive, device-local preferences in later modules.
  },
}
