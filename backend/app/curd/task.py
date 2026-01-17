from sqlalchemy.orm import Session
from app.models.task import Task
import app.schemas.task as schemas


def get_tasks(db: Session) -> list[Task]:
    return db.query(Task).all()


def get_task(db: Session, task_id: int) -> Task | None:
    return db.query(Task).filter(Task.id == task_id).first()


def create_task(db: Session, task: schemas.TaskCreate) -> Task:
    db_task = Task(**task.model_dump())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


def update_task(db: Session, task_id: int, task: schemas.TaskUpdate) -> Task | None:
    updated_task = db.query(Task).filter(Task.id == task_id).first()
    if not updated_task:
        return None

    update_data = task.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(updated_task, key, value)

    db.commit()
    db.refresh(updated_task)
    return updated_task


def delete_task(db: Session, task_id: int) -> bool:
    db_task = db.query(Task).filter(Task.id == task_id).first()

    if not db_task:
        return False

    db.delete(db_task)
    db.commit()
    return True
