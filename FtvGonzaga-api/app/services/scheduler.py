from app.extensions import db
from app.models.pagamentos import Pagamento
from app.models.praticante import Praticante
from app.services.whatsapp import enviar_mensagem_whatsapp
from datetime import datetime, timedelta

def verificar_pagamentos_atrasados(app):
    """
    Verifica no banco de dados os pagamentos vencidos e a vencer, e envia WhatsApp
    para os praticantes correspondentes.
    """
    with app.app_context():
        hoje = datetime.now().date()
        amanha = hoje + timedelta(days=1)
        
        # 1. COBRANÇA ATRASADA
        pagamentos_atrasados = db.session.query(Pagamento, Praticante).join(
            Praticante, Pagamento.praticante_id == Praticante.id
        ).filter(
            Pagamento.pago == False,
            db.func.date(Pagamento.data_vencimento) < hoje,
            Praticante.ativo == 1
        ).all()

        for pagamento, praticante in pagamentos_atrasados:
            if not praticante.telefone:
                continue
                
            valor_formatado = f"R$ {pagamento.valor:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
            data_venc = pagamento.data_vencimento.strftime("%d/%m/%Y")
            
            mensagem = (
                f"Olá {praticante.nome},\n\n"
                f"Consta em nosso sistema que o pagamento do seu plano na academia FtvGonzaga "
                f"no valor de {valor_formatado} com vencimento em {data_venc} está atrasado.\n\n"
                f"Por favor, regularize sua situação o mais breve possível. Se você já realizou "
                f"o pagamento, desconsidere esta mensagem.\n\n"
                f"Pix: futevoleigonzaga@gmail.com"
            )
            enviar_mensagem_whatsapp(praticante.telefone, mensagem)
            
        # 2. LEMBRETE PRÉ-VENCIMENTO (AMANHÃ)
        pagamentos_amanha = db.session.query(Pagamento, Praticante).join(
            Praticante, Pagamento.praticante_id == Praticante.id
        ).filter(
            Pagamento.pago == False,
            db.func.date(Pagamento.data_vencimento) == amanha,
            Praticante.ativo == 1
        ).all()

        for pagamento, praticante in pagamentos_amanha:
            if not praticante.telefone:
                continue
                
            valor_formatado = f"R$ {pagamento.valor:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
            data_venc = pagamento.data_vencimento.strftime("%d/%m/%Y")
            
            mensagem = (
                f"Olá {praticante.nome}!\n\n"
                f"Passando para lembrar que o seu plano na academia FtvGonzaga "
                f"vence amanhã ({data_venc}) no valor de {valor_formatado}.\n\n"
                f"Você pode realizar o pagamento através da nossa chave pix:\n"
                f"Pix: futevoleigonzaga@gmail.com\n\n"
                f"Agradecemos por treinar com a gente!"
            )
            enviar_mensagem_whatsapp(praticante.telefone, mensagem)
