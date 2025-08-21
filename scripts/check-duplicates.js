#!/usr/bin/env node

/**
 * Duplicate ID Checker for Hot Springs Data
 * 
 * This script checks for duplicate IDs in the hot springs data file
 * and can be run before commits to prevent duplicate entries.
 */

const fs = require('fs');
const path = require('path');

function checkForDuplicates() {
  console.log('🔍 Checking for duplicate hot spring IDs...\n');
  
  try {
    // Read the hot springs data file
    const dataFilePath = path.join(__dirname, '../lib/hot-springs-data.ts');
    const fileContent = fs.readFileSync(dataFilePath, 'utf8');
    
    // Extract all ID values using regex
    const idMatches = fileContent.match(/id:\s*["']([^"']+)["']/g);
    
    if (!idMatches) {
      console.log('❌ No IDs found in the data file');
      process.exit(1);
    }
    
    // Extract just the ID values
    const ids = idMatches.map(match => {
      const idMatch = match.match(/id:\s*["']([^"']+)["']/);
      return idMatch ? idMatch[1] : null;
    }).filter(Boolean);
    
    // Find duplicates
    const duplicates = [];
    const seen = new Set();
    
    for (const id of ids) {
      if (seen.has(id)) {
        if (!duplicates.includes(id)) {
          duplicates.push(id);
        }
      } else {
        seen.add(id);
      }
    }
    
    // Report results
    console.log(`📊 Total hot springs found: ${ids.length}`);
    console.log(`🔑 Unique IDs: ${seen.size}`);
    
    if (duplicates.length === 0) {
      console.log('✅ No duplicate IDs found! All IDs are unique.');
      process.exit(0);
    } else {
      console.log(`\n🚨 Found ${duplicates.length} duplicate ID(s):`);
      duplicates.forEach((id, index) => {
        console.log(`  ${index + 1}. "${id}"`);
      });
      
      console.log('\n💡 Please fix these duplicates before committing.');
      console.log('   You can run this script anytime with: node scripts/check-duplicates.js');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Error reading the data file:', error.message);
    process.exit(1);
  }
}

// Run the check
checkForDuplicates();
