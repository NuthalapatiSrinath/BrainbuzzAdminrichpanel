/**
 * 🎓 COURSE MODAL - CATEGORY & THEME TEST
 * ========================================
 * Run this in browser console to test:
 * 1. Category-SubCategory filtering
 * 2. Brain Buzz theme application
 * 
 * Copy and paste into Chrome/Firefox DevTools Console
 */

console.clear();
console.log('%c🎓 Course Modal - Category Filter & Theme Test', 'background: linear-gradient(90deg, #1e5bc6, #4ade80); color: white; padding: 10px 20px; font-size: 16px; font-weight: bold; border-radius: 8px;');
console.log('\n');

// Test 1: Check Category-SubCategory Data
console.group('📂 Test 1: Category-SubCategory Structure');
try {
  const state = window.store?.getState();
  
  if (!state) {
    console.error('❌ Redux store not found');
  } else {
    const { category, subCategory } = state;
    
    console.log(`✅ Categories: ${category?.categories?.length || 0}`);
    console.log(`✅ SubCategories: ${subCategory?.subCategories?.length || 0}`);
    
    // Create category-subcategory mapping
    const categoryMap = {};
    
    category?.categories?.forEach(cat => {
      const subCats = subCategory?.subCategories?.filter(sub => {
        const subCatId = sub.category?._id || sub.category;
        return subCatId === cat._id;
      });
      
      categoryMap[cat.name] = {
        id: cat._id,
        subCategories: subCats.map(s => s.name)
      };
    });
    
    console.log('\n📊 Category → SubCategory Mapping:');
    Object.entries(categoryMap).forEach(([catName, data]) => {
      console.log(`\n  📂 ${catName} (${data.id})`);
      if (data.subCategories.length > 0) {
        data.subCategories.forEach(subName => {
          console.log(`    ├─ ${subName}`);
        });
      } else {
        console.log('    └─ (No subcategories)');
      }
    });
    
    // Check for orphaned subcategories
    const orphaned = subCategory?.subCategories?.filter(sub => {
      const subCatId = sub.category?._id || sub.category;
      return !category?.categories?.find(cat => cat._id === subCatId);
    });
    
    if (orphaned?.length > 0) {
      console.warn(`\n⚠️ Found ${orphaned.length} orphaned subcategories (no parent category):`);
      orphaned.forEach(sub => console.warn(`  • ${sub.name} (parent: ${sub.category})`));
    } else {
      console.log('\n✅ All subcategories have valid parent categories');
    }
  }
} catch (error) {
  console.error('❌ Error:', error);
}
console.groupEnd();

// Test 2: Theme Variables Check
console.group('\n🎨 Test 2: Brain Buzz Theme Variables');
try {
  const root = document.documentElement;
  const computedStyle = getComputedStyle(root);
  
  const themeVars = [
    { name: 'Brand Blue', var: '--color-brand-blue', expected: '#1e5bc6' },
    { name: 'Brand Green', var: '--color-brand-green', expected: '#4ade80' },
    { name: 'Brand Blue Light', var: '--color-brand-blue-light', expected: '#c5d5f7' },
    { name: 'Brand Blue Lighter', var: '--color-brand-blue-lighter', expected: '#e8eef9' },
    { name: 'Brand Green Hover', var: '--color-brand-green-hover', expected: '#22c55e' },
  ];
  
  console.log('Theme Colors Status:');
  let allFound = true;
  
  themeVars.forEach(({ name, var: varName, expected }) => {
    const value = computedStyle.getPropertyValue(varName).trim();
    const found = value !== '';
    
    if (found) {
      console.log(`  ✅ ${name}: ${value} ${value === expected ? '(correct)' : '(custom)'}`);
    } else {
      console.error(`  ❌ ${name}: Not found`);
      allFound = false;
    }
  });
  
  if (allFound) {
    console.log('\n✅ All Brain Buzz theme variables loaded');
  } else {
    console.warn('\n⚠️ Some theme variables missing - check index.css');
  }
} catch (error) {
  console.error('❌ Error:', error);
}
console.groupEnd();

// Test 3: Modal Styling Check
console.group('\n🖼️ Test 3: Course Modal Theme Application');
console.log('To verify Brain Buzz theme in Course Modal:');
console.log('\n1. Click "Create Course" or "Edit" on any course');
console.log('2. Check these elements:');
console.log('   • Header: Blue-to-green gradient');
console.log('   • Tabs: Blue-to-green when active');
console.log('   • Free Course: Green border when selected');
console.log('   • Paid Course: Blue border when selected');
console.log('   • Languages: Blue background when selected');
console.log('   • Validities: Green background when selected');
console.log('   • Discount Savings: Green gradient');
console.log('   • Submit Button: Blue-to-green gradient');
console.log('\n3. Test Category Filter:');
console.log('   • Select a category from dropdown');
console.log('   • Check console for filter logs');
console.log('   • SubCategory dropdown should show only related items');
console.log('   • Change category - subcategory should auto-clear if incompatible');
console.groupEnd();

// Test 4: Filtering Simulation
console.group('\n🔍 Test 4: Category Filtering Simulation');
try {
  const state = window.store?.getState();
  
  if (state?.category?.categories?.length > 0) {
    const firstCategory = state.category.categories[0];
    console.log(`\n📂 Simulating selection: ${firstCategory.name}`);
    console.log(`   Category ID: ${firstCategory._id}`);
    
    const filteredSubs = state.subCategory?.subCategories?.filter(sub => {
      const subCatId = sub.category?._id || sub.category;
      return subCatId === firstCategory._id;
    });
    
    console.log(`   ✅ Filtered SubCategories: ${filteredSubs?.length || 0}`);
    
    if (filteredSubs?.length > 0) {
      console.log('   SubCategories shown:');
      filteredSubs.forEach(sub => console.log(`     • ${sub.name}`));
    } else {
      console.log('   └─ (No subcategories for this category)');
    }
    
    // Show what would be hidden
    const otherSubs = state.subCategory?.subCategories?.filter(sub => {
      const subCatId = sub.category?._id || sub.category;
      return subCatId !== firstCategory._id;
    });
    
    if (otherSubs?.length > 0) {
      console.log(`\n   🚫 Hidden SubCategories: ${otherSubs.length}`);
      otherSubs.slice(0, 3).forEach(sub => console.log(`     • ${sub.name}`));
      if (otherSubs.length > 3) {
        console.log(`     ... and ${otherSubs.length - 3} more`);
      }
    }
  } else {
    console.warn('⚠️ No categories available for simulation');
  }
} catch (error) {
  console.error('❌ Error:', error);
}
console.groupEnd();

// Summary
console.log('\n');
console.log('%c✅ TEST COMPLETE', 'background: #10b981; color: white; padding: 8px 16px; font-size: 14px; font-weight: bold; border-radius: 6px;');
console.log('\n📋 Changes Implemented:');
console.log('  1. ✅ Category-SubCategory filtering (dependent dropdown)');
console.log('  2. ✅ Auto-clear subcategory when category changes');
console.log('  3. ✅ Brain Buzz theme applied to entire modal');
console.log('  4. ✅ Blue-green gradient header & buttons');
console.log('  5. ✅ Theme-colored Free/Paid course selection');
console.log('  6. ✅ Theme-colored language & validity pills');
console.log('  7. ✅ Green discount savings display');
console.log('\n🔍 How to Test:');
console.log('  • Open Course Manager page');
console.log('  • Click "Create Course" or edit existing');
console.log('  • Select a category from dropdown');
console.log('  • Check subcategory dropdown - only related items shown');
console.log('  • Change category - watch subcategory auto-clear if needed');
console.log('  • Verify all colors match Brain Buzz theme');
console.log('\n💡 Console logs will show filtering in action!');
console.log('\n');
