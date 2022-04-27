package domain

type MessengerUseCase interface {
	SendMessage(message []byte) error
}
