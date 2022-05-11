import aiokafka
import asyncio

async def test():
    loop = asyncio.get_event_loop()
    global consumer
    global producer

    consumer = aiokafka.AIOKafkaConsumer('test', loop=loop, bootstrap_servers='0.tcp.jp.ngrok.io:10536')
    producer = aiokafka.AIOKafkaProducer(loop=loop, bootstrap_servers='0.tcp.jp.ngrok.io:10536')
    # get cluster layout and join group
    await consumer.start()

    # get cluster layout and initial topic/partition leadership information
    await producer.start()

    try:
        # Consume messages
        async for msg in consumer:
            print("consumed: ", msg.topic, msg.partition, msg.offset,
                  msg.key, msg.value, msg.timestamp)
    finally:
        # Will leave consumer group; perform autocommit if enabled.
        await consumer.stop()

asyncio.run(test())