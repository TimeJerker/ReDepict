from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from src.redepict.db.base import get_db
from src.redepict.api import schemas
from src.redepict.core.security import create_access_token
import src.redepict.db.crud as crud

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=schemas.UserResponse)
def register_user(user_data: schemas.UserCreate, db: Session = Depends(get_db)):

    existing_user = crud.get_user_by_email(db, email=user_data.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Этот email уже зарегистрирован")
    
    new_user = crud.create_user(
        db=db,
        username=user_data.username,
        email=user_data.email,
        password=user_data.password,
        role="user"
    )
    return new_user


@router.post("/login", response_model=schemas.TokenResponse)
def login_user(user_data: schemas.UserLogin, db: Session = Depends(get_db)):
    try:
        user = crud.login_user(db, email=user_data.email, password=user_data.password)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный email или пароль",
        )

    token_response = schemas.TokenResponse(
        access_token=create_access_token({"sub": user.id}),
        token_type="bearer"
    )

    return token_response