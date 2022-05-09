package configs

import (
	"fmt"
	"log"
	"time"

	"github.com/confluentinc/confluent-kafka-go/kafka"
	"github.com/spf13/viper"
)

type KafkaApp struct {
	c     *kafka.Consumer
	close chan struct{}
}

func KafkaConsumeInit() (*KafkaApp, error) {
	c, err := kafka.NewConsumer(&kafka.ConfigMap{
		"bootstrap.servers": viper.GetString("KAFKA_BOOTSTRAP_SERVER"),
		"group.id":          "webhook",
		"auto.offset.reset": "earliest",
	})

	if err != nil {
		return nil, fmt.Errorf("connect kafka error: %w", err)
	}

	return &KafkaApp{
		c:     c,
		close: make(chan struct{}, 1),
	}, nil
}

func (app *KafkaApp) Consume(topic string, cb func(data []byte)) {
	app.c.SubscribeTopics([]string{topic}, nil)

	go func() {
		run := true

		for run {
			select {
			case <-app.close:
				log.Println("Kafka closed")
				run = false
			default:
				msg, err := app.c.ReadMessage(time.Second * 30)
				if err == nil {
					go cb(msg.Value)
				} else if err.(kafka.Error).Code() == kafka.ErrTimedOut {
					continue
				} else {
					// The client will automatically try to recover from all errors.
					log.Printf("Consumer error: %v (%v)\n", err, msg)
				}
			}
		}

		app.c.Close()
	}()
}

func (app *KafkaApp) Close() {
	app.c.Assign(nil)
	app.c.Unsubscribe()
	app.close <- struct{}{}
}
