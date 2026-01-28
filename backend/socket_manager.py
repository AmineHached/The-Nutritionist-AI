from fastapi import WebSocket
from typing import List
import logging

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.logger = logging.getLogger("TheNutritionist.Monitor")

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        self.logger.info("Monitor connected")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        self.logger.info("Monitor disconnected")

    async def broadcast(self, message: str):
        self.logger.info(f"Broadcast: {message}")
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                # Handle broken pipes
                pass

manager = ConnectionManager()
