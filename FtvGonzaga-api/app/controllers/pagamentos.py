from app.extensions import db
from app.models.pagamentos import Pagamento
from app.models.praticante import Praticante
from datetime import datetime, timedelta, date

from dateutil.relativedelta import relativedelta
from app.services.whatsapp import enviar_mensagem_whatsapp

def baixar_pagamento(pagamento_id):
    try:
        pagamento = Pagamento.query.get(pagamento_id)
        if not pagamento:
            return False

        # 1. Marca como pago no banco de dados
        pagamento.pago = True
        pagamento.data_pagamento = datetime.now()

        # 2. Busca o praticante para checar o status
        praticante = Praticante.query.get(pagamento.praticante_id)
        
        # 3. RECORRÊNCIA: Se estiver Ativo, gera o mês seguinte automaticamente
        if praticante and praticante.status == 'Ativo':
            # Usa relativedelta para somar exatamente 1 mês caindo no mesmo dia
            proxima_data = pagamento.data_vencimento + relativedelta(months=1)
            
            nova_mensalidade = Pagamento(
                praticante_id=praticante.id,
                plano_id=pagamento.plano_id,
                valor=pagamento.valor,
                data_vencimento=proxima_data,
                pago=False
            )
            db.session.add(nova_mensalidade)
            
        db.session.commit()
        
        # 4. Envia RECIBO por WhatsApp se o aluno tiver telefone
        if praticante and praticante.telefone:
            valor_formatado = f"R$ {pagamento.valor:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
            mensagem = (
                f"✅ Pagamento Confirmado!\n\n"
                f"Olá {praticante.nome}, recebemos o pagamento do seu plano no valor de {valor_formatado}.\n\n"
                f"Muito obrigado por treinar com a FtvGonzaga!"
            )
            enviar_mensagem_whatsapp(praticante.telefone, mensagem)
            
        return True
    except Exception as e:
        db.session.rollback()
        print(f"Erro na recorrência: {e}")
        return False
    
from app.extensions import db
from app.models.pagamentos import Pagamento
from datetime import datetime

def criar_pagamento(data):

    pagamento = Pagamento(
        praticante_id=data["praticante_id"],
        plano_id=data["plano_id"],
        valor=data["valor"],
        data_vencimento=datetime.strptime(data["data_vencimento"], "%Y-%m-%d"),
        pago=False
    )

    db.session.add(pagamento)
    db.session.commit()

    return pagamento


def listar_pagamentos():

    pagamentos = Pagamento.query.all()

    return [
        {
            "id": p.id,
            "valor": float(p.valor),
            "pago": p.pago,
            "data_vencimento": p.data_vencimento.strftime("%Y-%m-%d"),
            "data_pagamento": p.data_pagamento.strftime("%Y-%m-%d") if p.data_pagamento else None
        }
        for p in pagamentos
    ]


def buscar_pagamento(pagamento_id):

    pagamento = db.session.get(Pagamento, pagamento_id)

    if not pagamento:
        return None

    return {
        "id": pagamento.id,
        "valor": float(pagamento.valor),
        "pago": pagamento.pago,
        "data_vencimento": pagamento.data_vencimento.strftime("%Y-%m-%d"),
        "data_pagamento": pagamento.data_pagamento.strftime("%Y-%m-%d") if pagamento.data_pagamento else None
    }


def atualizar_pagamento(pagamento_id, data):

    pagamento = db.session.get(Pagamento, pagamento_id)

    if not pagamento:
        return None

    if "valor" in data:
        pagamento.valor = data["valor"]

    if "data_vencimento" in data:
        pagamento.data_vencimento = datetime.strptime(data["data_vencimento"], "%Y-%m-%d")

    db.session.commit()

    return pagamento


def deletar_pagamento(pagamento_id):

    pagamento = db.session.get(Pagamento, pagamento_id)

    if not pagamento:
        return False

    db.session.delete(pagamento)
    db.session.commit()

    return True

def listar_pendentes(busca=""):

    hoje = date.today()

    query = db.session.query(
        Pagamento.id,
        Pagamento.valor,
        Pagamento.data_vencimento,
        Praticante.nome
    ).join(
        Praticante, Pagamento.praticante_id == Praticante.id
    ).filter(
        Pagamento.pago == False
    ).filter(
        Pagamento.data_vencimento < hoje
    )

    if busca:
        query = query.filter(
            Praticante.nome.ilike(f"%{busca}%")
        )

    resultados = query.order_by(
        Pagamento.data_vencimento.asc()
    ).all()

    return [
        {
            "id": r.id,
            "valor": float(r.valor),
            "data_vencimento": r.data_vencimento.strftime("%Y-%m-%d"),
            "praticante_nome": r.nome
        }
        for r in resultados
    ]

def listar_historico():

    resultados = db.session.query(
        Pagamento.id,
        Pagamento.valor,
        Pagamento.data_pagamento,
        Praticante.nome
    ).join(
        Praticante, Pagamento.praticante_id == Praticante.id
    ).filter(
        Pagamento.pago == True
    ).order_by(
        Pagamento.data_pagamento.desc()
    ).all()

    return [
        {
            "id": r.id,
            "valor": float(r.valor),
            "data_pagamento": r.data_pagamento.strftime("%Y-%m-%d") if r.data_pagamento else None,
            "praticante_nome": r.nome
        }
        for r in resultados
    ]