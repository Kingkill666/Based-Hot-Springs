# Duplicate Prevention System

This project includes several mechanisms to prevent duplicate hot spring IDs from being added to the database.

## 🛡️ Prevention Mechanisms

### 1. Development-Time Detection
- **Automatic console warnings** when duplicates are detected during development
- **Real-time feedback** in the browser console if duplicates exist

### 2. Manual Checking
```bash
# Check for duplicates anytime
npm run check-duplicates

# Or run the script directly
node scripts/check-duplicates.js
```

### 3. Build-Time Validation
- **Automatic duplicate checking** before every build
- **Build fails** if duplicates are found
- Prevents deployment of corrupted data

### 4. Git Pre-Commit Hook (Optional)
```bash
# Set up the pre-commit hook to block commits with duplicates
git config core.hooksPath .githooks
```

## 🔧 Utility Functions

The following functions are available in `lib/hot-springs-data.ts`:

```typescript
// Check if the data has any duplicate IDs
validateUniqueIds(): { isValid: boolean; duplicates: string[] }

// Get a list of duplicate IDs
findDuplicateIds(): string[]

// Check if a specific ID already exists
checkForDuplicateId(id: string): boolean
```

## 📋 Usage Examples

### Before Adding New Hot Springs
```typescript
import { checkForDuplicateId } from './lib/hot-springs-data';

const newId = "my-new-hot-spring";
if (checkForDuplicateId(newId)) {
  console.error(`ID "${newId}" already exists!`);
  // Handle the conflict
} else {
  // Safe to add the new hot spring
}
```

### Validating the Entire Dataset
```typescript
import { validateUniqueIds } from './lib/hot-springs-data';

const validation = validateUniqueIds();
if (!validation.isValid) {
  console.error('Duplicates found:', validation.duplicates);
}
```

## 🚨 What Happens if Duplicates are Found?

1. **Development**: Console warnings appear
2. **Build**: Build process fails with error message
3. **Manual Check**: Script lists all duplicate IDs
4. **Pre-commit**: Commit is blocked until duplicates are fixed

## 🔄 Fixing Duplicates

If duplicates are found:

1. **Identify**: Run `npm run check-duplicates` to see which IDs are duplicated
2. **Locate**: Search the data file for the duplicate entries
3. **Choose**: Keep the most complete/accurate entry
4. **Remove**: Delete the duplicate entry
5. **Verify**: Run the checker again to confirm the fix

## 💡 Best Practices

- **Always run** `npm run check-duplicates` before committing
- **Use descriptive IDs** that are unlikely to conflict
- **Include state/country codes** in IDs for clarity (e.g., `hot-springs-ca` vs `hot-springs-nv`)
- **Check existing IDs** before adding new entries

## 📊 Current Status

- ✅ **607 hot springs** in the database
- ✅ **607 unique IDs** - no duplicates
- ✅ **All prevention mechanisms** active
