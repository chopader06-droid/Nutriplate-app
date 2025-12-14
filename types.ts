export interface FamilyComposition {
  adultMales: number;
  adultFemales: number;
  children: number;
}

export interface NutritionItem {
  name: string;
  quantityEstimate: string;
  calories: number;
  protein: number;
}

export interface AnalysisResult {
  foodItems: NutritionItem[];
  totalCalories: number;
  totalProtein: number;
  consumptionUnits: number;
  intakePerCU: {
    calories: number;
    protein: number;
  };
  standardPerCU: {
    calories: number;
    protein: number;
    source: string;
  };
  gap: {
    caloriesPercent: number;
    proteinPercent: number;
    status: 'Surplus' | 'Deficit' | 'Adequate';
  };
  summary: string;
}
