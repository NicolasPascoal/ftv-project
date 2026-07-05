import os
import requests

WHATSAPP_SERVICE_URL = os.getenv("WHATSAPP_SERVICE_URL", "http://localhost:3001/send")

def enviar_mensagem_whatsapp(telefone, mensagem):
    """
    Envia uma mensagem de WhatsApp comunicando-se com o microserviço Node.js.
    """
    try:
        response = requests.post(WHATSAPP_SERVICE_URL, json={
            "phone": telefone,
            "message": mensagem
        })
        
        if response.status_code == 200:
            print(f"Mensagem enviada com sucesso para {telefone}")
            return True
        else:
            print(f"Erro ao enviar mensagem para {telefone}: {response.json()}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"Falha de comunicação com o serviço de WhatsApp: {e}")
        return False
