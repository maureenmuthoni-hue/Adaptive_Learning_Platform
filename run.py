#!/usr/bin/env python3
import uvicorn

if __name__ == "__main__":
    print("""
    
            AI-Powered Adaptive Learning System 
            Backend Server Starting...                             
            Server: http://localhost:8000                         
            API Docs: http://localhost:8000/docs                  
            Press Ctrl+C to stop      
    """)
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )