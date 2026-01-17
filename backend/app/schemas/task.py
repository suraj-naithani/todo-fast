from pydantic import BaseModel

class TaskBase(BaseModel):
    title: str
    description: str | None = None
    completed: bool = False

class TaskCreate(TaskBase):
    pass

class TaskUpdate(TaskBase):
    title: str | None = None
    description: str | None = None
    completed: bool | None = None

class Task(TaskBase):
    id: int

    class Config:
        orm_mode = True