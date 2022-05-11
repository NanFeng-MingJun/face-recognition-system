from fastapi import FastAPI
from fastapi.params import Depends
from typing import Set
from fastapi.middleware.cors import CORSMiddleware
from kafka import TopicPartition

import sys
import os
import aiokafka
import asyncio
import json
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from config.db_config import get_db, get_model
from controllers.RegisterController import RegisterController
from controllers.VerifyController import VerifyController
#from controllers.IdentityController import IdentityController
from services.IdentifyService import IdentifyService

app = FastAPI()

# global variables
consumer_task = None
consumer = None
producer = None


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(RegisterController.router)
app.include_router(VerifyController.router)
#app.include_router(IdentityController.router)

@app.on_event("startup")
async def startup_event():
    await initialize()
    await consume()


@app.on_event("shutdown")
async def shutdown_event():
    consumer_task.cancel()
    await consumer.stop()
    await producer.stop()
    
    
async def initialize():
    loop = asyncio.get_event_loop()
    global consumer
    global producer
    
    consumer = aiokafka.AIOKafkaConsumer('new_ticket_received', loop=loop, bootstrap_servers='localhost:9092', value_deserializer=deserializer)
    producer = aiokafka.AIOKafkaProducer(loop=loop, bootstrap_servers='localhost:9092', value_serializer=serializer)
    # get cluster layout and join group
    await consumer.start()
    
    # get cluster layout and initial topic/partition leadership information
    await producer.start()

    partitions: Set[TopicPartition] = consumer.assignment()
    nr_partitions = len(partitions)
    if nr_partitions != 1:
        print(f'Found {nr_partitions} partitions for topic new_ticket_received. Expecting ' f'only one, remaining partitions will be ignored!')
    for tp in partitions:

        # get the log_end_offset
        end_offset_dict = await consumer.end_offsets([tp])
        end_offset = end_offset_dict[tp]

        if end_offset == 0:
            print(f'Topic new_ticket_received has no messages (log_end_offset: ' f'{end_offset}), skipping initialization ...')
            return

        print(f'Found log_end_offset: {end_offset} seeking to {end_offset-1}')
        consumer.seek(tp, end_offset-1)
        msg = await consumer.getone()
        print(f'Initializing API with data from msg: {msg}')

        return


async def consume():
    global consumer_task
    consumer_task = asyncio.create_task(consume_message(consumer))
    
    
async def consume_message(consumer):
    try:
        # consume messages
        async for msg in consumer:
            print(type(msg.value), msg.value)
            tmp = msg.value
            if "department" in tmp:
                input_msg = [[tmp["imageUrl"]],tmp["organization"], tmp["department"]]
            else:
                input_msg = [[tmp["imageUrl"]],tmp["organization"], "_default"]
                
            model = Depends(get_model)
            db = Depends(get_db)
            result = IdentifyService.identify(input_msg, model,db)
            
            if "department" in tmp:
                return_dict = {"ID": result["identity"], 
                               "ticketID": tmp["ticketID"], 
                               "organization": tmp["organization"], 
                               "department": tmp["department"], 
                               "boundingBox": result["bbox"],
                               "timestamp": result["time"],
                               "metadata": tmp["metadata"]
                               }
            else:
                return_dict = {"ID": result["identity"], 
                               "ticketID": tmp["ticketID"], 
                               "organization": tmp["organization"], 
                               "department": "_default", 
                               "boundingBox": result["bbox"],
                               "timestamp": result["time"],
                               "metadata": tmp["metadata"]
                               }
            
            await producer.send("identification_task_done", return_dict)
            

    finally:
        # will leave consumer group; perform autocommit if enabled
        await consumer.stop()


def serializer(value):
    return json.dumps(value).encode()      
       
        
def deserializer(serialized):
    return json.loads(serialized)
