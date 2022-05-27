from time import sleep
import aiokafka
import asyncio
import json
import sys
import os

from dotenv import load_dotenv
from typing import Set
from kafka import TopicPartition

load_dotenv(os.getenv('ENV_PROD_FILE') or '.env.dev')

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from services.IdentifyService import IdentifyService
from config.db_config import db, model_serialized

async def startup_event():
    await initialize()
    await consume()
    
    
async def initialize():
    loop = asyncio.get_event_loop()
    global consumer
    global producer
    retry = 0
    
    # Create consumer
    while True:
        try:
            consumer = aiokafka.AIOKafkaConsumer('new_ticket_received', loop=loop, bootstrap_servers=os.getenv('KAFKA_BROKER_SERVER'), value_deserializer=deserializer, group_id='recognition')
            # get cluster layout and join group
            await consumer.start()
            retry = 0
            break
        except Exception as e:
            print(e)
            print("Reconnect to kafka")
            if retry == 20:
                print("Can not connect to kafka")
                return e
            sleep(5)
            retry += 1
        
    # Create producer
    while True:
        try:
            producer = aiokafka.AIOKafkaProducer(loop=loop, bootstrap_servers=os.getenv('KAFKA_BROKER_SERVER'), value_serializer=serializer)
            # get cluster layout and initial topic/partition leadership information
            await producer.start()
            retry = 0
            break
        except Exception as e:
            print(e)
            print("Reconnect to kafka")
            if retry == 20:
                print("Can not connect to kafka")
                return e
            sleep(5)
            retry += 1
            

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
    print("Consume function")
    global consumer_task
    #consumer_task = asyncio.create_task(consume_message(consumer))
    await consume_message(consumer)
    
    
async def consume_message(consumer):
    try:
        # consume messages
        async for msg in consumer:
            #print(type(msg.value), msg.value)
            tmp = msg.value
            if "department" in tmp:
                input_msg = [[tmp["imageUrl"]],tmp["organization"], tmp["department"]]
            else:
                input_msg = [[tmp["imageUrl"]],tmp["organization"], "_default"]
             

            result = IdentifyService.identify(input_msg, model_serialized, db)
            
            if "department" in tmp:
                return_dict = {"ID": str(result["identity"]), 
                               "ticketID": tmp["ticketID"], 
                               "organization": tmp["organization"], 
                               "department": tmp["department"], 
                               "boundingBox": result["bbox"],
                               "timestamp": result["time"],
                               "metadata": tmp["metadata"]
                               }
            else:
                return_dict = {"ID": str(result["identity"]), 
                               "ticketID": tmp["ticketID"], 
                               "organization": tmp["organization"], 
                               "department": "_default", 
                               "boundingBox": result["bbox"],
                               "timestamp": result["time"],
                               "metadata": tmp["metadata"]
                               }
                
            print(return_dict)
            
            await producer.send("identification_task_done", return_dict, key=serializerKey(tmp["ticketID"]))
            
    except Exception as e:
        print(e)         

    finally:
        # will leave consumer group; perform autocommit if enabled
        print("Stop.........")
        await consumer.stop()


def serializer(value):
    return json.dumps(value).encode()


def serializerKey(value):
    return value.encode('utf-8')
       
        
def deserializer(serialized):
    return json.loads(serialized)


asyncio.run(startup_event())