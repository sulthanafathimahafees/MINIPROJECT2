/**
 * OptiBuy Rule-Based Product Match Scoring Engine
 * 
 * Transparent, explainable rule-based scoring method based on customer preferences
 * and product attributes.
 * Normalized to 0–100 scale:
 *  - Category Match: 25%
 *  - Brand Match: 15%
 *  - Budget Match: 30%
 *  - Preferred Features Match: 20%
 *  - Rating / Quality Bonus: 10%
 */

export function calculateMatchScore(product, specifications = [], preferences = {}) {
  const details = {};
  let totalScore = 0;
  let maxPossibleScore = 0;

  // 1. Category Match (Weight: 25%)
  maxPossibleScore += 25;
  const productCategory = (product.category_name || product.category || '').toLowerCase();
  const preferredCategory = (preferences.preferred_category || preferences.preferredCategory || '').toLowerCase();
  if (preferredCategory && productCategory === preferredCategory) {
    details.category = { score: 25, max: 25, reason: `Category matches preference (${preferences.preferred_category || preferences.preferredCategory})` };
    totalScore += 25;
  } else if (preferredCategory) {
    details.category = { score: 0, max: 25, reason: `Category is ${productCategory || 'N/A'}, preferred is ${preferences.preferred_category || preferences.preferredCategory}` };
  } else {
    details.category = { score: 15, max: 25, reason: 'No category preference set' };
    totalScore += 15;
  }

  // 2. Brand Match (Weight: 15%)
  maxPossibleScore += 15;
  const productBrand = (product.brand_name || product.brand || '').toLowerCase();
  const preferredBrand = (preferences.preferred_brand || preferences.preferredBrand || '').toLowerCase();
  if (preferredBrand && preferredBrand !== 'all brands' && productBrand === preferredBrand) {
    details.brand = { score: 15, max: 15, reason: `Brand matches preference (${preferences.preferred_brand || preferences.preferredBrand})` };
    totalScore += 15;
  } else if (preferredBrand && preferredBrand !== 'all brands') {
    details.brand = { score: 0, max: 15, reason: `Brand is ${productBrand || 'N/A'}, preferred is ${preferences.preferred_brand || preferences.preferredBrand}` };
  } else {
    details.brand = { score: 10, max: 15, reason: 'No specific brand restriction set' };
    totalScore += 10;
  }

  // 3. Budget Match (Weight: 30%)
  maxPossibleScore += 30;
  const price = parseFloat(product.price_inr || product.price || 0);
  const minBudget = parseFloat(preferences.minimum_budget_inr || preferences.minimumBudgetINR || 10000);
  const maxBudget = parseFloat(preferences.maximum_budget_inr || preferences.maximumBudgetINR || 200000);

  if (price >= minBudget && price <= maxBudget) {
    details.budget = { score: 30, max: 30, reason: `Price ${formatCurrency(price)} is within budget (${formatCurrency(minBudget)} - ${formatCurrency(maxBudget)})` };
    totalScore += 30;
  } else if (price < minBudget) {
    const pct = minBudget > 0 ? (price / minBudget) * 30 : 15;
    details.budget = { score: Math.round(pct), max: 30, reason: `Price ${formatCurrency(price)} is below minimum budget of ${formatCurrency(minBudget)}` };
    totalScore += Math.round(pct);
  } else {
    const overBudget = price - maxBudget;
    const pct = maxBudget > 0 ? Math.max(0, 30 - (overBudget / maxBudget) * 30) : 0;
    details.budget = { score: Math.round(pct), max: 30, reason: `Price ${formatCurrency(price)} exceeds maximum budget of ${formatCurrency(maxBudget)}` };
    totalScore += Math.round(pct);
  }

  // 4. Preferred Features Match (Weight: 20%)
  maxPossibleScore += 20;
  const rawFeatures = preferences.preferred_features || preferences.preferredFeatures || [];
  const preferredFeatures = Array.isArray(rawFeatures)
    ? rawFeatures
    : (typeof rawFeatures === 'string' ? JSON.parse(rawFeatures) : []);

  if (preferredFeatures.length > 0 && specifications.length > 0) {
    let matchedFeatures = 0;
    const specText = specifications.map(s => `${s.name || s.specification_name || ''} ${s.value || s.specification_value || ''}`).join(' ').toLowerCase();

    preferredFeatures.forEach(feature => {
      const featureLower = feature.toLowerCase();
      if (specText.includes(featureLower)) {
        matchedFeatures++;
      }
    });

    const featureScore = Math.round((matchedFeatures / preferredFeatures.length) * 20);
    details.features = {
      score: featureScore,
      max: 20,
      reason: `${matchedFeatures} of ${preferredFeatures.length} preferred features found in product specifications`
    };
    totalScore += featureScore;
  } else if (preferredFeatures.length > 0) {
    details.features = { score: 0, max: 20, reason: 'No product specifications available to match features' };
  } else {
    details.features = { score: 10, max: 20, reason: 'No preferred features specified' };
    totalScore += 10;
  }

  // 5. Rating/Quality Bonus (Weight: 10%)
  maxPossibleScore += 10;
  const rating = parseFloat(product.rating || 4.5);
  if (rating >= 4.5) {
    details.rating = { score: 10, max: 10, reason: `Excellent customer rating (${rating}/5)` };
    totalScore += 10;
  } else if (rating >= 4.0) {
    details.rating = { score: 7, max: 10, reason: `Good rating (${rating}/5)` };
    totalScore += 7;
  } else if (rating >= 3.5) {
    details.rating = { score: 4, max: 10, reason: `Average rating (${rating}/5)` };
    totalScore += 4;
  } else {
    details.rating = { score: 1, max: 10, reason: `Below average rating (${rating}/5)` };
    totalScore += 1;
  }

  details.budgetFit = details.budget;
  details.categoryFit = details.category;
  details.brandFit = details.brand;
  details.featureFit = details.features;
  details.ratingBonus = details.rating;

  // Normalize to 0-100
  const normalizedScore = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;

  return {
    totalScore: normalizedScore,
    details
  };
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}
