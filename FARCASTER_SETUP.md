# Based Springs - Farcaster Mini App Setup

This guide explains how to set up and deploy the Based Springs hot springs database as a Farcaster Mini App.

## What's Been Implemented

### 1. Farcaster Mini App SDK Integration
- ✅ SDK installed and initialized (`@farcaster/miniapp-sdk`)
- ✅ Proper `sdk.actions.ready()` call to hide splash screen
- ✅ Error handling for SDK initialization

### 2. Manifest Configuration
- ✅ `farcaster.json` manifest file with proper schema
- ✅ Account association with domain signature
- ✅ Frame configuration with app metadata

### 3. Embed Metadata
- ✅ `fc:miniapp` meta tag in layout
- ✅ OpenGraph metadata for sharing
- ✅ Proper image URLs and button configuration

### 4. Sharing Functionality
- ✅ Share buttons on individual hot spring cards
- ✅ Share functionality in detailed view modal
- ✅ Native share API with clipboard fallback

## Files Modified

### Core Files
- `app/page.tsx` - Added SDK initialization and sharing functionality
- `app/layout.tsx` - Added Farcaster embed metadata
- `farcaster.json` - Updated with proper Mini App manifest
- `public/.well-known/farcaster.json` - Created for endpoint serving

## Deployment Requirements

### 1. Domain Configuration
The app is configured for deployment at:
```
https://based-hot-springs-8cqsqoqab-vmf-coin.vercel.app
```

### 2. Required Assets
Ensure these assets are available at the specified URLs:
- Icon: `/placeholder-logo.png` (200x200px recommended)
- Splash Image: `/placeholder-logo.png` (200x200px)
- Background Image: `/Mono_Hot_Springs_Background.jpg` (3:2 aspect ratio)

### 3. Manifest Endpoint
The manifest must be accessible at:
```
https://your-domain.com/.well-known/farcaster.json
```

## Testing Your Mini App

### 1. Preview Tool
Test your app using the Farcaster preview tool:
```
https://farcaster.xyz/~/developers/mini-apps/preview?url=https://your-domain.com
```

### 2. Manifest Validation
Verify your manifest is accessible:
```bash
curl -s https://your-domain.com/.well-known/farcaster.json | jq .
```

### 3. Embed Metadata Check
Verify embed metadata is present:
```bash
curl -s https://your-domain.com | grep -E 'fc:miniapp|fc:frame'
```

## Farcaster Mini App Features

### Current Features
- **Complete US Hot Springs Database** - Over 100+ hot springs with detailed information
- **GPS Coordinates** - Direct navigation to each location
- **Detailed Information** - Temperature, facilities, accessibility, and more
- **Search & Filter** - Find springs by state, country, or features
- **Sharing** - Share individual hot springs with friends
- **Responsive Design** - Works on mobile and desktop

### User Experience
- Users can discover hot springs through the Farcaster client
- Share specific hot springs with detailed information
- Access GPS coordinates for navigation
- View comprehensive facility and accessibility information

## Publishing to Farcaster

### 1. Enable Developer Mode
1. Go to https://farcaster.xyz/~/settings/developer-tools
2. Toggle on "Developer Mode"

### 2. Create Manifest
1. Use the developer tools to create your manifest
2. Verify the domain signature matches your deployment
3. Test the preview functionality

### 3. Submit for Review
1. Ensure all assets are properly configured
2. Test sharing functionality
3. Verify the app loads correctly in the preview tool

## Troubleshooting

### Common Issues

1. **Infinite Loading Screen**
   - Ensure `sdk.actions.ready()` is called after app initialization
   - Check console for SDK errors

2. **Manifest Not Found**
   - Verify `.well-known/farcaster.json` is accessible
   - Check domain signature matches deployment URL

3. **Share Not Working**
   - Test on mobile devices (native share API)
   - Verify fallback clipboard functionality

4. **Images Not Loading**
   - Ensure all image URLs are accessible
   - Check image dimensions and formats

### Support
If you encounter issues:
- Check the [Farcaster Mini Apps documentation](https://miniapps.farcaster.xyz/docs/getting-started)
- Reach out to the Farcaster team (@pirosb3, @linda, @deodad) on Farcaster

## Next Steps

### Potential Enhancements
- Add user favorites functionality
- Implement location-based recommendations
- Add weather integration for visit planning
- Create user reviews and ratings system
- Add offline capability for downloaded data

### International Expansion
- Add hot springs from other countries
- Implement multi-language support
- Add region-specific information

---

**Based Springs** - The most comprehensive hot springs database, now available as a Farcaster Mini App! 🌊✨
