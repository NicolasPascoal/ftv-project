from app.extensions import db
from sqlalchemy import Numeric

class Pagamento(db.Model):
    __tablename__ = "pagamentos"

    id = db.Column(db.Integer, primary_key=True)
    valor = db.Column(Numeric(10, 2), nullable=False)
    pago = db.Column(db.Boolean, default=False) # 0 para Pendente, 1 para Pago
    
    data_pagamento = db.Column(db.DateTime, nullable=True)
    data_vencimento = db.Column(db.DateTime, nullable=False)
    criado_em = db.Column(db.DateTime, server_default=db.func.now())
    
    praticante_id = db.Column(db.Integer, db.ForeignKey("praticantes.id"), nullable=False)
    plano_id = db.Column(db.Integer, db.ForeignKey("planos.id"), nullable=False)