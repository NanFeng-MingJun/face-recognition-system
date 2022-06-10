package usecase

import (
	"request-service/domain"

	"github.com/confluentinc/confluent-kafka-go/kafka"
)

type messengerUseCase struct {
	producer *kafka.Producer
}

func New(producer *kafka.Producer) domain.MessengerUseCase {
	return &messengerUseCase{
		producer: producer,
	}
}

func (uc *messengerUseCase) SendMessage(message []byte, topic string) error {
	return uc.producer.Produce(&kafka.Message{
		TopicPartition: kafka.TopicPartition{Topic: &topic, Partition: kafka.PartitionAny},
		Value:          message,
	}, nil)
}
