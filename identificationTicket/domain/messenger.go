package domain

type MessengerUseCase interface {
	SendMessage(message []byte, topic string) error
}
