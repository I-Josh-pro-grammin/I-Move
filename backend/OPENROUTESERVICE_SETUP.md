# OpenRouteService Setup Guide

## Getting Your Free API Key

OpenRouteService provides a free API key without requiring a credit card. Here's how to get one:

1. **Visit OpenRouteService**: Go to https://openrouteservice.org/dev/#/login
2. **Sign up**: Create a free account (no credit card required)
3. **Get your API key**: Once logged in, you'll find your API key in your dashboard
4. **Free Tier Limits**:
   - 40 requests per minute
   - 5,000 requests per day
   - Perfect for development and small-scale applications

## Adding Your API Key

Add your OpenRouteService API key to your `.env` file:

```env
OPENROUTESERVICE_API_KEY=your-api-key-here
```

## What Happens Without an API Key?

If you don't provide an API key, the system will:

- Still work perfectly using the Haversine formula for distance calculations
- Use straight-line distances (as-the-crow-flies) instead of road distances
- All core features will function normally

With an API key, you get:

- **More accurate road distances** using actual routing
- **Estimated travel times** for each rider
- **Geocoding support** (address to coordinates conversion)
- **Reverse geocoding** (coordinates to address conversion)

## Features Available

### Distance Calculations

- **Without API key**: Uses Haversine formula (straight-line distance)
- **With API key**: Uses OpenRouteService Matrix API (road distance, more accurate)

### Geocoding

- Convert addresses to coordinates: `POST /api/passengers/geocode`
- Convert coordinates to addresses: `POST /api/passengers/reverse-geocode`

## Testing

You can test the integration even without an API key - the system will automatically fall back to Haversine calculations.
