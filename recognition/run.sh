#! /bin/bash
python kafkapy.py & 
uvicorn app:app --port 3000 --host 0.0.0.0 & 
wait
