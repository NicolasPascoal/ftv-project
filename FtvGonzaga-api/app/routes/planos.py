from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.controllers.planos import (
    criar_plano,
    listar_planos,
    buscar_plano,
    atualizar_plano,
    deletar_plano
)

planos_bp = Blueprint("planos", __name__)

@planos_bp.route("/planos", methods=["POST"])
@jwt_required()
def criar_plano_route():
    data = request.json
    plano = criar_plano(
        nome=data["nome"],
        valor=data["valor"]
    )

    return jsonify({
        "id": plano.id,
        "nome": plano.nome,
        "valor": float(plano.valor)
    }), 201

@planos_bp.route("/planos", methods=["GET"])
@jwt_required()
def listar_planos_route():
    planos = listar_planos()

    return jsonify([
        {
            "id": p.id,
            "nome": p.nome,
            "valor": float(p.valor)
        } for p in planos
    ]), 200

@planos_bp.route("/planos/<int:plano_id>", methods=["GET"])
@jwt_required()
def buscar_plano_route(plano_id):
    plano = buscar_plano(plano_id)

    if not plano:
        return jsonify({"erro": "N�o encontrado"}), 404

    return jsonify({
        "id": plano.id,
        "nome": plano.nome,
        "valor": float(plano.valor)
    }), 200

@planos_bp.route("/planos/<int:plano_id>", methods=["PUT"])
@jwt_required()
def atualizar_plano_route(plano_id):
    data = request.json

    plano = atualizar_plano(plano_id, data)

    if not plano:
        return jsonify({"erro": "N�o encontrado"}), 404

    return jsonify({"mensagem": "Atualizado com sucesso"}), 200

@planos_bp.route("/planos/<int:plano_id>", methods=["DELETE"])
@jwt_required()
def deletar_plano_route(plano_id):
    try:
        sucesso = deletar_plano(plano_id)

        if not sucesso:
            return jsonify({"erro": "N�o encontrado"}), 404

        return jsonify({"mensagem": "Deletado com sucesso"}), 200

    except Exception:
        return jsonify({
            "erro": "N�o � poss�vel excluir um plano que possui alunos vinculados"
        }), 400