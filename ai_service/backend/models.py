from pydantic import BaseModel
from typing import List, Optional

class MacroNutrients(BaseModel):
    calories_kcal: float
    protein_g: float
    carbs_g: float
    fat_g: float
    sugar_g: Optional[float] = 0.0
    fiber_g: Optional[float] = 0.0

class FoodItem(BaseModel):
    name: str
    confidence: float
    portion_desc: str
    weight_g: Optional[float] = None
    nutrition: MacroNutrients
    health_rating: Optional[str] = "Moderate" # e.g., Healthy, Moderate, Unhealthy

class AnalysisResponse(BaseModel):
    food_items: List[FoodItem]
    total_nutrition: MacroNutrients
    health_score: int # 0-100
    health_summary: str
    recommendations: List[str]
    warnings: List[str] # e.g., "High Sugar", "Contains Peanuts"

class CoachRequest(BaseModel):
    message: str
    history: List[dict] = [] # List of {"role": "user"/"assistant", "content": "str"}
    context_data: Optional[str] = None # Previous analysis context
    user_email: Optional[str] = "user@example.com"
    session_id: Optional[int] = None

class CoachResponse(BaseModel):
    reply: str
    session_id: Optional[int] = None

class TitleRequest(BaseModel):
    history: List[dict]
    session_id: Optional[int] = None

class TitleResponse(BaseModel):
    title: str
