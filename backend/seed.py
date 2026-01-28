import random
from faker import Faker
from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.models.tool_data import Dataset, ExperimentRun, LabelingTask, Deployment, DeploymentLog
from datetime import datetime, timedelta
import uuid

fake = Faker()

def init_db():
    Base.metadata.create_all(bind=engine)

def seed_data():
    db = SessionLocal()
    
    # Clear existing data
    db.query(Dataset).delete()
    db.query(ExperimentRun).delete()
    db.query(LabelingTask).delete()
    db.query(Deployment).delete()
    db.query(DeploymentLog).delete()
    db.commit()

    print("Seeding Datasets...")
    for _ in range(5):
        dataset = Dataset(
            id=str(uuid.uuid4()),
            project_id="default-project",
            name=fake.file_name(extension="csv"),
            file_path=f"/data/{fake.file_name(extension='csv')}",
            columns=[fake.word() for _ in range(5)],
            row_count=random.randint(100, 10000)
        )
        db.add(dataset)

    print("Seeding Experiments...")
    for i in range(20):
        run = ExperimentRun(
            id=f"run_{uuid.uuid4().hex[:8]}",
            project_id="default-project",
            name=f"Model_{fake.word()}_{i}",
            status=random.choice(["FINISHED", "RUNNING", "FAILED"]),
            metrics={"accuracy": random.uniform(0.7, 0.99), "loss": random.uniform(0.01, 0.5)},
            params={"learning_rate": random.uniform(0.001, 0.1), "batch_size": random.choice([16, 32, 64])},
            timestamp=fake.date_time_between(start_date="-30d", end_date="now")
        )
        db.add(run)

    print("Seeding Labeling Tasks...")
    classes = ["Cat", "Dog", "Bird", "Car", "Person"]
    for _ in range(50):
        task = LabelingTask(
            id=str(uuid.uuid4()),
            project_id="default-project",
            image_url=f"https://placehold.co/600x400?text={random.choice(classes)}",
            predicted_label=random.choice(classes),
            confidence=random.uniform(0.5, 0.99),
            status="pending"
        )
        db.add(task)

    print("Seeding Deployments...")
    deployments = []
    for i in range(3):
        dep = Deployment(
            id=f"dep_{uuid.uuid4().hex[:6]}",
            project_id="default-project",
            name=f"Deployment {i+1}",
            model_name=f"Model-v{i+1}",
            status=random.choice(["healthy", "warning", "error"]),
            uptime=f"{random.randint(1, 100)}h",
            requests_per_min=random.randint(10, 1000),
            latency_ms=random.randint(20, 500),
            endpoint_url=f"https://api.example.com/v1/model_{i}"
        )
        db.add(dep)
        deployments.append(dep)

    print("Seeding Logs...")
    for dep in deployments:
        for _ in range(20):
            log = DeploymentLog(
                deployment_id=dep.id,
                level=random.choice(["INFO", "WARNING", "ERROR"]),
                message=fake.sentence(),
                timestamp=fake.date_time_between(start_date="-1d", end_date="now")
            )
            db.add(log)

    db.commit()
    db.close()
    print("Seeding Complete!")

if __name__ == "__main__":
    init_db()
    seed_data()
