from fastapi import APIRouter, UploadFile, File, HTTPException, WebSocket, WebSocketDisconnect
from backend.services.vision_service import analyze_image
from backend.models import AnalysisResponse
from backend.socket_manager import manager

router = APIRouter()

@router.websocket("/ws/monitor")
async def websocket_endpoint(websocket: WebSocket):
    try:
        await manager.connect(websocket)
        while True:
            # Keep connection alive, maybe handle client messages if needed
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        import traceback
        traceback.print_exc()
        try:
            await websocket.close()
        except:
            pass

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_food(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        contents = await file.read()
        result = await analyze_image(contents, media_type=file.content_type)
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
