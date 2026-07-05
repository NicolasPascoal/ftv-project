from app.extensions import db
from app.models.planos import Plano

def criar_plano(nome, valor):
    plano = Plano(
        nome=nome,
        valor=valor,
    )
    db.session.add(plano)
    db.session.commit()
    return plano


def listar_planos():
    return Plano.query.all()


def buscar_plano(plano_id):
    return Plano.query.get(plano_id)


def atualizar_plano(plano_id, dados):
    plano = buscar_plano(plano_id)
    if not plano:
        return None

    plano.nome = dados.get("nome", plano.nome)
    plano.valor = dados.get("valor", plano.valor)

    db.session.commit()
    return plano


def deletar_plano(plano_id):
    plano = buscar_plano(plano_id)
    if not plano:
        return False

    db.session.delete(plano)
    db.session.commit()
    return True
