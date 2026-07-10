from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import models, database, schemas, security

# Create the database tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Monitoring Platform API")

# Dependency
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Configure CORS so the Next.js frontend can communicate with this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # Add your frontend URL here
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Monitoring Platform API!"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/users/", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = security.get_password_hash(user.password)
    new_user = models.User(email=user.email, hashed_password=hashed_password)
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user
