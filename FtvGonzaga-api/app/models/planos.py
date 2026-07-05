# app/models/planos.py
from app.extensions import db
from sqlalchemy import Numeric

class Plano(db.Model):
    __tablename__ = "planos"

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(50), nullable=False, unique=True)
    valor = db.Column(Numeric(10, 2), nullable=False)
