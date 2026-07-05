from app.extensions import db

class Praticante(db.Model):
    __tablename__ = 'praticantes'
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    telefone = db.Column(db.String(20))
    plano_id = db.Column(db.Integer, db.ForeignKey('planos.id'))
    status = db.Column(db.String(20), default='Ativo')
    data_nascimento = db.Column(db.Date, nullable=True)
    data_inicio = db.Column(db.Date, default=db.func.current_date())
    ativo = db.Column(db.Integer, default=1)