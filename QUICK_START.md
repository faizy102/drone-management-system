# 🚀 Quick Start Guide

## ✅ Fixed: "Too Many Requests" Error

The rate limit has been increased from 100 to **200 requests per minute** to support rapid testing and auto-refresh functionality.

**What changed:**
- Rate limit window: 15 minutes → **1 minute**
- Max requests: 100 → **200**
- Health check endpoint is now exempt from rate limiting
- Better error messages with retry timing

## 🗺️ Google Maps Setup (Optional)

Google Maps is **optional** for testing the API. You have **three tracking options**:

### Option 1: Simple Tracking (No Google Maps) ✅ RECOMMENDED FOR TESTING
- **URL:** `http://localhost:3000/simple-tracking.html`
- **Features:** Full order tracking, status updates, location coordinates
- **Pros:** Works immediately, no API key needed
- **Cons:** No visual map, just text/tables

### Option 2: Google Maps Tracking 🗺️ (Requires API Key)
- **URL:** `http://localhost:3000/tracking.html`
- **Features:** Real-time map visualization, route lines, ETA calculations
- **Requires:** Google Maps API key (free tier available)

### Option 3: Main API Interface
- **URL:** `http://localhost:3000/`
- **Features:** Direct API testing, all endpoints available
- **Best for:** API development and debugging

---

## 🎯 Quick API Key Setup (5 Minutes)

If you want to enable Google Maps visualization:

### Step 1: Get API Key
1. Go to https://console.cloud.google.com/
2. Click **Create Project** (or select existing)
3. Click **Enable APIs and Services**
4. Search for "**Maps JavaScript API**"
5. Click **Enable**
6. Go to **Credentials** → **Create Credentials** → **API Key**
7. Copy your API key (starts with `AIza...`)

### Step 2: Add API Key to Files

Open these two files and replace `YOUR_API_KEY`:

**File 1:** `public/tracking.html` (bottom of file)
```html
<!-- FIND THIS LINE (near line 980): -->
<script async defer
    src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap">
</script>

<!-- REPLACE YOUR_API_KEY WITH YOUR ACTUAL KEY: -->
<script async defer
    src="https://maps.googleapis.com/maps/api/js?key=AIzaSyD...YOUR_REAL_KEY...&callback=initMap">
</script>
```

**File 2:** `public/test-maps.html` (same location)
```html
<script async defer
    src="https://maps.googleapis.com/maps/api/js?key=AIzaSyD...YOUR_REAL_KEY...&callback=initMap">
</script>
```

### Step 3: Test Your API Key
1. Save both files
2. Open `http://localhost:3000/test-maps.html`
3. You should see:
   - ✅ **Success message** if working
   - ❌ **Error message** with solution if not working

### Step 4: Use Tracking Page
Once test page shows success:
- Open `http://localhost:3000/tracking.html`
- Map should load automatically
- Login and test tracking features

---

## 🔧 Common Issues & Solutions

### Issue 1: "google is not defined"
**Cause:** API key not added or invalid

**Solution:**
1. Open `public/tracking.html` in text editor (VS Code, Notepad++, etc.)
2. Press Ctrl+F and search for `YOUR_API_KEY`
3. Replace with your actual API key
4. Save file and refresh browser (Ctrl+F5)

**Verification:**
- Open `http://localhost:3000/test-maps.html`
- Should show ✅ success message

### Issue 2: "Too many requests"
**Cause:** Making requests too fast

**Solution:**
- Already fixed! Limit increased to 200 requests/minute
- Wait 60 seconds if you hit the limit
- Use simple-tracking.html for rapid testing

### Issue 3: Map shows "For development purposes only"
**Cause:** Billing not enabled on Google Cloud

**Solution:**
1. Go to Google Cloud Console
2. Enable billing (free $300 credit)
3. Maps API is free up to 28,000 loads/month

### Issue 4: "RefererNotAllowedMapError"
**Cause:** API key restrictions blocking localhost

**Solution:**
1. Go to Google Cloud Console → Credentials
2. Click your API key
3. Under "Application restrictions" → Select "HTTP referrers"
4. Add: `http://localhost:3000/*`
5. Save

---

## 📊 Feature Comparison

| Feature | Simple Tracking | Maps Tracking | Main Interface |
|---------|----------------|---------------|----------------|
| Works without API key | ✅ Yes | ❌ No | ✅ Yes |
| Setup time | 0 minutes | 5 minutes | 0 minutes |
| Shows order details | ✅ Yes | ✅ Yes | ✅ Yes |
| Shows coordinates | ✅ Yes | ✅ Yes | ✅ Yes |
| Visual map | ❌ No | ✅ Yes | ❌ No |
| Route visualization | ❌ No | ✅ Yes | ❌ No |
| ETA countdown | ✅ Yes | ✅ Yes | ❌ No |
| Auto-refresh | ✅ Yes | ✅ Yes | ❌ No |
| Best for | Testing | Production | Development |

---

## ⚡ Recommended Workflow

1. **Start here:** Use `simple-tracking.html` to test all API functionality
2. **Test APIs:** Use main `index.html` to debug specific endpoints
3. **Add Maps:** When ready for visualization, add Google Maps API key
4. **Verify Maps:** Test with `test-maps.html` before using tracking page
5. **Production:** Use `tracking.html` with proper API key

---

## 🎓 Need More Help?

- **Full setup guide:** See `GOOGLE_MAPS_SETUP.md`
- **API examples:** See `API_EXAMPLES.md`
- **Flow diagrams:** See `FLOW_DIAGRAMS.md`
- **Tracking features:** See `TRACKING_FEATURES.md`

---

## 📝 Summary

✅ **Rate limit fixed** - 200 requests/minute now
✅ **Simple tracking available** - Works without Google Maps
✅ **Test page added** - Diagnose API key issues
✅ **Better error messages** - Know exactly what's wrong

**You can start testing immediately** using `http://localhost:3000/simple-tracking.html`!

No Google API key needed to test the full functionality. 🎉
