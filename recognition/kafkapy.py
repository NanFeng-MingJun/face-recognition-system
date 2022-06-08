from time import sleep
import aiokafka
import asyncio
import json
import sys
import os
import datetime

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
    global consumerServer
    global consumerMobile
    global producer
    retry = 0
    
    # Create consumer
    while True:
        try:
            consumerServer = aiokafka.AIOKafkaConsumer('new_ticket_received', loop=loop, bootstrap_servers=os.getenv('KAFKA_BROKER_SERVER'), value_deserializer=deserializer, group_id='recognition')
            # get cluster layout and join group
            await consumerServer.start()
            retry = 0
            break
        except Exception as e:
            print(e)
            print("Create consumerServer: Reconnect to kafka")
            if retry == 20:
                print("Create consumerServer: Can not connect to kafka")
                return e
            sleep(5)
            retry += 1
            
            
    while True:
        try:
            consumerMobile = aiokafka.AIOKafkaConsumer('new_ticket_received_mobile', loop=loop, bootstrap_servers=os.getenv('KAFKA_BROKER_SERVER'), value_deserializer=deserializer, group_id='recognitionMobile')
            # get cluster layout and join group
            await consumerMobile.start()
            retry = 0
            break
        except Exception as e:
            print(e)
            print("Create consumerMobile: Reconnect to kafka")
            if retry == 20:
                print("Create consumerMobile: Can not connect to kafka")
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
            print("Create producer: Reconnect to kafka")
            if retry == 20:
                print("Create producer: Can not connect to kafka")
                return e
            sleep(5)
            retry += 1
            
    # Restore message 
    
    partitions: Set[TopicPartition] = consumerServer.assignment()
    nr_partitions = len(partitions)
    if nr_partitions != 1:
        print(f'Found {nr_partitions} partitions for topic new_ticket_received. Expecting ' f'only one, remaining partitions will be ignored!')
    for tp in partitions:

        # get the log_end_offset
        end_offset_dict = await consumerServer.end_offsets([tp])
        end_offset = end_offset_dict[tp]

        if end_offset == 0:
            print(f'Topic new_ticket_received has no messages (log_end_offset: ' f'{end_offset}), skipping initialization ...')
            return

        print(f'Found log_end_offset: {end_offset} seeking to {end_offset-1}')
        consumerServer.seek(tp, end_offset-1)
        msg = await consumerServer.getone()
        print(f'Initializing API with data from msg: {msg}')
        
        
    partitions: Set[TopicPartition] = consumerMobile.assignment()
    nr_partitions = len(partitions)
    if nr_partitions != 1:
        print(f'Found {nr_partitions} partitions for topic new_ticket_received_mobile. Expecting ' f'only one, remaining partitions will be ignored!')
    for tp in partitions:

        # get the log_end_offset
        end_offset_dict = await consumerMobile.end_offsets([tp])
        end_offset = end_offset_dict[tp]

        if end_offset == 0:
            print(f'Topic new_ticket_received_mobile has no messages (log_end_offset: ' f'{end_offset}), skipping initialization ...')
            return

        print(f'Found log_end_offset: {end_offset} seeking to {end_offset-1}')
        consumerMobile.seek(tp, end_offset-1)
        msg = await consumerMobile.getone()
        print(f'Initializing API with data from msg: {msg}')

        return


async def consume():
    print("Consume function")
    #global consumer_task
    #consumer_task = asyncio.create_task(consume_message(consumer))
    await consume_message(consumerServer)
    await consume_message_mobile(consumerMobile)
    
    
async def consume_message(consumer):
    
    try:
        # consume messages
        async for msg in consumer:
            #print(type(msg.value), msg.value)
            
            # input_msg = [["https://haha.png"], "HCMUS", "cs101"]
            tmp = msg.value
            if "department" in tmp:
                input_msg = [[tmp.get("imageUrl")],tmp.get("organization"), tmp.get("department")]
            else:
                input_msg = [[tmp.get("imageUrl")],tmp.get("organization"), "_default"]
             

            result = IdentifyService.identify(input_msg, model_serialized, db)
            
            if "department" in tmp:
                return_dict = {"ID": str(result.get("identity")), 
                               "ticketID": tmp.get("ticketID"), 
                               "organization": tmp.get("organization"), 
                               "department": tmp.get("department"), 
                               "boundingBox": result.get("bbox"),
                               "timestamp": result.get("time"),
                               "metadata": tmp.get("metadata")
                               }
            else:
                return_dict = {"ID": str(result.get("identity")), 
                               "ticketID": tmp.get("ticketID"), 
                               "organization": tmp.get("organization"), 
                               "department": "_default", 
                               "boundingBox": result.get("bbox"),
                               "timestamp": result.get("time"),
                               "metadata": tmp.get("metadata")
                               }
                
            #print(return_dict)
            
            await producer.send("identification_task_done", return_dict, key=serializerKey(tmp.get("ticketID")))
            
    except Exception as e:
        print(e)         
        return {"ID": "-1", 
                "ticketID": "-1", 
                "organization": tmp.get("organization"), 
                "department": "_default", 
                "boundingBox": [-1,-1,-1,-1],
                "timestamp": int(datetime.datetime.now().timestamp() * 1000),
                "metadata": "-1"
                }
        
    finally:
        # will leave consumer group; perform autocommit if enabled
        print("consumerServer Stop.........")
        await consumer.stop()


async def consume_message_mobile(consumer):
    try:
        # consume messages
        async for msg in consumer:
            #print(type(msg.value), msg.value)
            
            # input_msg = [[[0.23, 0.15, 0.4,...]], "HCMUS", "cs101"]
            tmp = msg.value
            if "department" in tmp:
                input_msg = [tmp.get("embedding"),tmp.get("organization"), tmp.get("department")]
            else:
                input_msg = [tmp.get("embedding"),tmp.get("organization"), "_default"]
             

            result = IdentifyService.identifyMobile(input_msg, model_serialized, db)
            
            if "department" in tmp:
                return_dict = {"ID": str(result.get("identity")), 
                               "ticketID": tmp.get("ticketID"), 
                               "organization": tmp.get("organization"), 
                               "department": tmp.get("department"), 
                               "boundingBox": [None,None,None,None],
                               "timestamp": result.get("time"),
                               "metadata": tmp.get("metadata")
                               }
            else:
                return_dict = {"ID": str(result.get("identity")), 
                               "ticketID": tmp.get("ticketID"), 
                               "organization": tmp.get("organization"), 
                               "department": "_default", 
                               "boundingBox": [None,None,None,None],
                               "timestamp": result.get("time"),
                               "metadata": tmp.get("metadata")
                               }
                
            #print(return_dict)
            
            await producer.send("identification_task_done", return_dict, key=serializerKey(tmp.get("ticketID")))
            
    except Exception as e:
        print(e)         
        return {"ID": "-1", 
                "ticketID": "-1", 
                "organization": tmp.get("organization"), 
                "department": "_default", 
                "boundingBox": [-1,-1,-1,-1],
                "timestamp": int(datetime.datetime.now().timestamp() * 1000),
                "metadata": "-1"
                }
        
    finally:
        # will leave consumer group; perform autocommit if enabled
        print("consumerMobile Stop.........")
        await consumer.stop()

def serializer(value):
    return json.dumps(value).encode()


def serializerKey(value):
    return value.encode('utf-8')
       
        
def deserializer(serialized):
    return json.loads(serialized)


asyncio.run(startup_event())