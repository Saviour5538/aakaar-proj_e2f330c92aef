from typing import Optional, List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, UUID4
from database.models import Match
from database.config import get_db
from backend.routes.auth import get_current_user

router = APIRouter(prefix="/api/matches")

class MatchResponse(BaseModel):
    id: Optional[UUID4] = None
    user_id: Optional[UUID4] = None
    result: str
    winner: Optional[str] = None
    moves: int
    created_at: Optional[datetime] = None
    class Config:
        from_attributes = True

def create_match(db: Session, match_data: MatchResponse, user_id: UUID4) -> MatchResponse:
    new_match = Match(
        user_id=user_id,
        result=match_data.result,
        winner=match_data.winner,
        moves=match_data.moves,
        created_at=datetime.utcnow()
    )
    db.add(new_match)
    db.commit()
    db.refresh(new_match)
    return MatchResponse.from_orm(new_match)

def get_user_matches(db: Session, user_id: UUID4) -> List[MatchResponse]:
    matches = db.query(Match).filter(Match.user_id == user_id).all()
    return [MatchResponse.from_orm(match) for match in matches]

@router.post("/", response_model=MatchResponse, operation_id="create_match", status_code=status.HTTP_201_CREATED)
async def create_match_endpoint(
    match_data: MatchResponse,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    try:
        match = create_match(db, match_data, current_user.id)
        return match
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/", response_model=List[MatchResponse], operation_id="get_matches", status_code=status.HTTP_200_OK)
async def get_matches_endpoint(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    try:
        matches = get_user_matches(db, current_user.id)
        return matches
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))