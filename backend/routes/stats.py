from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database.models import Match
from database.config import get_db
from backend.services.auth import get_current_user
from datetime import datetime
from uuid import UUID

router = APIRouter(prefix="/stats")

class StatsResponse(BaseModel):
    total_matches: int
    wins: int
    losses: int
    draws: int
    last_match_date: datetime | None

@router.get("/", response_model=StatsResponse, operation_id="get_stats")
async def get_stats(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user.id

    # Query matches for the current user
    matches = db.query(Match).filter(Match.user_id == user_id).all()

    if not matches:
        return StatsResponse(
            total_matches=0,
            wins=0,
            losses=0,
            draws=0,
            last_match_date=None
        )

    total_matches = len(matches)
    wins = sum(1 for match in matches if match.result == "win")
    losses = sum(1 for match in matches if match.result == "loss")
    draws = sum(1 for match in matches if match.result == "draw")
    last_match_date = max(match.created_at for match in matches)

    return StatsResponse(
        total_matches=total_matches,
        wins=wins,
        losses=losses,
        draws=draws,
        last_match_date=last_match_date
    )