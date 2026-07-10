from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.notifications.routes import router as notifications_router
from backend.integrations.routes import router as integrations_router

app = FastAPI(title='Person 3 Backend', version='0.1.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(notifications_router, prefix='/api/notifications')
app.include_router(integrations_router, prefix='/api/integrations')


@app.get('/health')
def health_check():
    return {'status': 'ok'}
