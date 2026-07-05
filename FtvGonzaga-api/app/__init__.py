from flask import Flask
from flask_cors import CORS 
from flask_apscheduler import APScheduler
from flask_jwt_extended import JWTManager

from app.routes.praticantes import praticantes_bp
from app.routes.pagamentos import pagamentos_bp
from app.routes.planos import planos_bp
from app.routes.relatorios import relatorios_bp
from app.routes.auth import auth_bp

from app.config import Config
from app.extensions import db

scheduler = APScheduler()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app) 

    db.init_app(app)
    jwt.init_app(app)
    
    scheduler.init_app(app)
    scheduler.start()

    from app.services.scheduler import verificar_pagamentos_atrasados
    
    @scheduler.task('cron', id='check_pagamentos', hour=9, minute=0)
    #@scheduler.task('interval', id='check_pagamentos', seconds=10) #para teste
    def job_pagamentos():
        verificar_pagamentos_atrasados(scheduler.app)

    app.register_blueprint(auth_bp)
    app.register_blueprint(praticantes_bp)
    app.register_blueprint(pagamentos_bp)
    app.register_blueprint(planos_bp)
    app.register_blueprint(relatorios_bp)

    # Cria tabelas e admin padrão se não existir
    with app.app_context():
        db.create_all()
        import os
        from app.controllers.auth import criar_usuario_admin
        admin_user = os.getenv("ADMIN_USERNAME", "admin")
        admin_pass = os.getenv("ADMIN_PASSWORD", "123")
        criar_usuario_admin(admin_user, admin_pass)

    return app