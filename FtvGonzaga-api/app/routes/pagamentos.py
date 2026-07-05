from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.models.praticante import Praticante
from app.models.pagamentos import Pagamento
from app.models.planos import Plano 
from app.extensions import db
from datetime import datetime
from sqlalchemy import func 
from app.controllers.pagamentos import *
pagamentos_bp = Blueprint("pagamentos", __name__)


@pagamentos_bp.route("/pagamentos", methods=["POST"])
@jwt_required()
def criar_pagamento_route():
    data = request.json

    pagamento = criar_pagamento(data)

    return jsonify({
        "id": pagamento.id,
        "valor": float(pagamento.valor),
        "pago": pagamento.pago
    }), 201


@pagamentos_bp.route("/pagamentos", methods=["GET"])
@jwt_required()
def listar_pagamentos_route():

    pagamentos = listar_pagamentos()

    return jsonify(pagamentos), 200


@pagamentos_bp.route("/pagamentos/<int:id>", methods=["GET"])
@jwt_required()
def buscar_pagamento_route(id):

    pagamento = buscar_pagamento(id)

    if not pagamento:
        return jsonify({"erro": "Pagamento não encontrado"}), 404

    return jsonify(pagamento), 200


@pagamentos_bp.route("/pagamentos/<int:id>", methods=["PUT"])
@jwt_required()
def atualizar_pagamento_route(id):

    data = request.json

    pagamento = atualizar_pagamento(id, data)

    if not pagamento:
        return jsonify({"erro": "Pagamento não encontrado"}), 404

    return jsonify({"msg": "Pagamento atualizado"}), 200


@pagamentos_bp.route("/pagamentos/<int:id>", methods=["DELETE"])
@jwt_required()
def deletar_pagamento_route(id):

    sucesso = deletar_pagamento(id)

    if not sucesso:
        return jsonify({"erro": "Pagamento não encontrado"}), 404

    return jsonify({"msg": "Pagamento deletado"}), 200

@pagamentos_bp.route("/pagamentos/<int:id>/baixar", methods=["PUT"])
@jwt_required()
def baixar_pagamento_route(id):

    sucesso = baixar_pagamento(id)

    if sucesso:
        return jsonify({"msg": "Pagamento baixado com sucesso"}), 200

    return jsonify({"erro": "Pagamento não encontrado"}), 404

@pagamentos_bp.route("/pagamentos/pendentes", methods=["GET"])
@jwt_required()
def listar_pendentes_route():

    busca = request.args.get("busca", "").strip()

    resultados = listar_pendentes(busca)

    return jsonify(resultados), 200


@pagamentos_bp.route("/pagamentos/historico", methods=["GET"])
@jwt_required()
def listar_historico_route():

    resultados = listar_historico()

    return jsonify(resultados), 200
