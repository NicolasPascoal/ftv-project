from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from app.controllers.relatorios import relatorio_geral

relatorios_bp = Blueprint("relatorios", __name__)


@relatorios_bp.route("/relatorios/geral", methods=["GET"])
@jwt_required()
def relatorio_geral_route():

    dados = relatorio_geral()

    return jsonify(dados), 200
