from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.routes import task

Base.metadata.create_all(bind=engine)

app = FastAPI()


@app.get("/")
def root():
    return {"message": "FastAPI Backend is running", "docs": "/docs"}


# ✅ Add CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://todo-fast-frontend.vercel.app/",
        "http://localhost:3000",  # For local development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(task.router)
