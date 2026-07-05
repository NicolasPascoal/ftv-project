from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.extensions import db
from app.models.praticante import Praticante
from app.models.planos import Plano
from app.models.pagamentos import Pagamento 
from datetime import datetime
from app.controllers.praticantes import *

praticantes_bp = Blueprint('praticante_bp', __name__)

@praticantes_bp.route("/praticantes", methods=["POST"])
@jwt_required()
def criar_praticante_route():

    data = request.json

    praticante = criar_praticante(data)

    return jsonify({
        "id": praticante.id,
        "nome": praticante.nome,
        "telefone": praticante.telefone
    }), 201

@praticantes_bp.route("/praticantes", methods=["GET"])
@jwt_required()
def listar_praticantes_route():

    status_filtro = int(request.args.get("status_filtro", 1))
    busca = request.args.get("busca", "").strip()

    praticantes = listar_praticantes(status_filtro, busca)

    return jsonify(praticantes), 200


@praticantes_bp.route("/praticantes/<int:id>", methods=["PUT"])
@jwt_required()
def atualizar_praticante_route(id):

    data = request.json

    praticante = atualizar_praticante(id, data)

    if not praticante:
        return jsonify({"erro": "Praticante não encontrado"}), 404

    return jsonify({"msg": "Praticante atualizado"}), 200


@praticantes_bp.route("/praticantes/<int:id>", methods=["DELETE"])
@jwt_required()
def deletar_praticante_route(id):

    sucesso = deletar_praticante(id)

    if not sucesso:
        return jsonify({"erro": "Praticante n�o encontrado"}), 404

    return jsonify({"msg": "Praticante deletado"}), 200

@praticantes_bp.route("/praticantes/dashboard", methods=["GET"])
@jwt_required()
def dashboard_praticantes_route():
    busca = request.args.get("busca", "").strip()
    status_filtro = int(request.args.get("status_filtro", 1))
    
    dados = listar_alunos_com_status(busca=busca, status_filtro=status_filtro)
    
    return jsonify({
        "success": True,
        "data": dados
    }), 200
