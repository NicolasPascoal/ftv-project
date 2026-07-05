from app.extensions import db
from app.models.praticante import Praticante
from app.models.planos import Plano 
from app.models.pagamentos import Pagamento 
from datetime import datetime, timedelta, date
from sqlalchemy import func, case

def criar_praticante(data):
    try:
        nome = data.get("nome")
        telefone = data.get("telefone")
        plano_id = data.get("plano_id")
        data_vencimento_str = data.get("data_vencimento")
        data_nascimento_str = data.get("data_nascimento")

        if not nome:
            raise ValueError("Nome é obrigatório")

        if not plano_id:
            raise ValueError("Plano é obrigatório")

        if not data_vencimento_str:
            raise ValueError("Data de vencimento é obrigatória")

        data_vencimento = datetime.strptime(data_vencimento_str, "%Y-%m-%d")
        
        data_nascimento = None
        if data_nascimento_str:
            data_nascimento = datetime.strptime(data_nascimento_str, "%Y-%m-%d").date()

        praticante = Praticante(
            nome=nome,
            telefone=telefone,
            plano_id=plano_id,
            data_nascimento=data_nascimento,
            ativo=1
        )

        db.session.add(praticante)
        db.session.flush() 

        plano = Plano.query.get(plano_id)

        if plano:
            nova_mensalidade = Pagamento(
                praticante_id=praticante.id,
                plano_id=plano.id,
                valor=plano.valor,
                data_vencimento=data_vencimento,
                pago=False,
                data_pagamento=None 
            )
            db.session.add(nova_mensalidade)

        db.session.commit()

        return praticante

    except Exception as e:
        db.session.rollback()
        print(f"ERRO CRÍTICO NO CADASTRO: {str(e)}")
        raise e


def listar_praticantes(status_filtro=1, busca=""):

    query = db.session.query(
        Praticante, Plano.nome
    ).join(
        Plano, Praticante.plano_id == Plano.id
    )

    if status_filtro == 0:
        query = query.filter(Praticante.ativo.in_([0, 2]))
    else:
        query = query.filter(Praticante.ativo == status_filtro)

    if busca:
        query = query.filter(
            Praticante.nome.ilike(f"%{busca}%")
        )

    praticantes = query.all()

    lista = []

    for p, plano_nome in praticantes:
        lista.append({
            "id": p.id,
            "nome": p.nome,
            "telefone": p.telefone,
            "plano_id": p.plano_id,
            "plano_nome": plano_nome,
            "ativo": int(p.ativo),
            "data_nascimento": p.data_nascimento.strftime("%Y-%m-%d") if p.data_nascimento else None
        })

    return lista


def atualizar_praticante(id, dados):

    praticante = Praticante.query.get(id)

    if not praticante:
        return None

    praticante.nome = dados.get("nome", praticante.nome)
    praticante.telefone = dados.get("telefone", praticante.telefone)
    praticante.plano_id = dados.get("plano_id", praticante.plano_id)

    if "ativo" in dados:
        praticante.ativo = int(dados.get("ativo"))

    db.session.commit()

    return praticante


def deletar_praticante(id):

    praticante = Praticante.query.get(id)

    if not praticante:
        return False

    Pagamento.query.filter_by(praticante_id=id).delete()

    db.session.delete(praticante)

    db.session.commit()

    return True

def listar_alunos_com_status(busca="", status_filtro=1):

    hoje = datetime.now()

    subquery = db.session.query(
        Pagamento.praticante_id,
        func.max(Pagamento.data_vencimento).label("ultima_data")
    ).group_by(Pagamento.praticante_id).subquery()

    query = db.session.query(
        Praticante.id,
        Praticante.nome,
        Praticante.telefone,
        Plano.nome.label("plano_nome"),
        Plano.valor.label("plano_valor"),
        Pagamento.data_vencimento,
        Pagamento.pago,
        Pagamento.id.label("pagamento_id")
    ).outerjoin(
        Plano, Praticante.plano_id == Plano.id
    ).outerjoin(
        subquery, subquery.c.praticante_id == Praticante.id
    ).outerjoin(
        Pagamento,
        (Pagamento.praticante_id == Praticante.id) &
        (Pagamento.data_vencimento == subquery.c.ultima_data)
    )

    if busca:
        query = query.filter(
            Praticante.nome.ilike(f"%{busca}%")
        )

    # Filtro de status: 1=Ativo, 2=Pausa, 0=Inativo (0 mostra 0 e 2)
    if status_filtro == 0:
        query = query.filter(Praticante.ativo.in_([0, 2]))
    else:
        query = query.filter(Praticante.ativo == status_filtro)

    status_order = case(
        (Pagamento.data_vencimento.is_(None), 2),
        ((Pagamento.data_vencimento < hoje) & (Pagamento.pago == False), 0),
        else_=1
    )

    resultados = query.order_by(
        status_order,
        Plano.valor.desc()
    ).all()

    lista = []

    for r in resultados:
        if r.data_vencimento is None:
            status = "Sem pagamento"
            atrasado = False
        elif r.pago:
            status = "Pago"
            atrasado = False
        elif r.data_vencimento < hoje:
            status = "Atrasado"
            atrasado = True
        else:
            status = "Em dia"
            atrasado = False

        lista.append({
            "id": r.id,
            "nome": r.nome,
            "telefone": r.telefone,
            "plano_nome": r.plano_nome,
            "plano_valor": float(r.plano_valor) if r.plano_valor is not None else 0.0,
            "data_vencimento": r.data_vencimento.strftime("%Y-%m-%d") if r.data_vencimento else None,
            "pago": r.pago if r.pago is not None else False,
            "atrasado": atrasado,
            "status": status,
            "pagamento_id": r.pagamento_id
        })

    return lista