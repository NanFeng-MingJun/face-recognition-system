package usecase

import (
	"request-service/domain"

	"github.com/confluentinc/confluent-kafka-go/kafka"
	"github.com/spf13/viper"
)

type messengerUseCase struct {
	producer *kafka.Producer
}

func New(producer *kafka.Producer) domain.MessengerUseCase {
	return &messengerUseCase{
		producer: producer,
	}
}

func (uc *messengerUseCase) SendMessage(message []byte) error {
	topic := viper.GetString("KAFKA_TICKET_TOPIC")

	return uc.producer.Produce(&kafka.Message{
		TopicPartition: kafka.TopicPartition{Topic: &topic, Partition: kafka.PartitionAny},
		Value:          message,
	}, nil)
}
