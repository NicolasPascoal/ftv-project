from app.extensions import db
from app.models.pagamentos import Pagamento
from app.models.praticante import Praticante
from app.models.planos import Plano
from sqlalchemy import func
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta


def relatorio_geral():

    hoje = datetime.now()

    faturamento_mes = db.session.query(
        func.sum(Pagamento.valor)
    ).filter(
        Pagamento.pago == True
    ).filter(
        func.extract('month', Pagamento.data_pagamento) == hoje.month
    ).filter(
        func.extract('year', Pagamento.data_pagamento) == hoje.year
    ).scalar() or 0


    planos_query = db.session.query(
        Plano.nome,
        func.count(Praticante.id).label("total")
    ).join(
        Praticante, Praticante.plano_id == Plano.id
    ).group_by(
        Plano.nome
    ).order_by(
        func.count(Praticante.id).desc()
    ).all()
    
    # Busca faturamento dos ultimos 6 meses para o Gráfico
    historico_faturamento = []
    for i in range(5, -1, -1):
        mes_alvo = hoje - relativedelta(months=i)
        
        faturamento_daquele_mes = db.session.query(
            func.sum(Pagamento.valor)
        ).filter(
            Pagamento.pago == True,
            func.extract('month', Pagamento.data_pagamento) == mes_alvo.month,
            func.extract('year', Pagamento.data_pagamento) == mes_alvo.year
        ).scalar() or 0
        
        # Formata o mes ex: "Jan", "Fev"
        nome_mes = mes_alvo.strftime("%b")
        meses_pt = {
            "Jan": "Jan", "Feb": "Fev", "Mar": "Mar", "Apr": "Abr",
            "May": "Mai", "Jun": "Jun", "Jul": "Jul", "Aug": "Ago",
            "Sep": "Set", "Oct": "Out", "Nov": "Nov", "Dec": "Dez"
        }
        
        historico_faturamento.append({
            "mes": meses_pt.get(nome_mes, nome_mes),
            "valor": float(faturamento_daquele_mes)
        })

    return {
        "faturamento_mes": float(faturamento_mes),
        "planos": [
            {
                "nome": p.nome,
                "quantidade": p.total
            }
            for p in planos_query
        ],
        "historico": historico_faturamento
    }
