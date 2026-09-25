# Fix: Home.tsx Choking Button Routing

Changed the Choking quick-access button on the Home dashboard to navigate directly to the live camera AR scanner with the choking protocol.

**File:** `src/pages/Home.tsx`

**Change:**
```diff
- onClick={() => navigate('/first-aid/pregnancy')}
+ onClick={() => navigate('/emergency-scan?protocol=choking')}
```

This ensures the Choking button opens the EmergencyScan page with `protocol=choking` in the URL, which the EmergencyScan component reads to immediately show choking guidance over the camera feed.