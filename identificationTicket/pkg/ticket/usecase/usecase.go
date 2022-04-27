package usecase

import (
	"encoding/json"
	"request-service/domain"

	"github.com/pkg/errors"

	"github.com/google/uuid"
)

type ticketUseCase struct {
	messagerUC domain.MessengerUseCase
}

func New(messagerUC domain.MessengerUseCase) domain.TicketUseCase {
	return &ticketUseCase{
		messagerUC: messagerUC,
	}
}

func (uc *ticketUseCase) SendTicket(payload *domain.Ticket) (string, error) {
	payload.ID = uuid.NewString()
	jsonBytes, err := json.Marshal(&payload)
	if err != nil {
		return "", errors.Wrap(err, "JSON Marshal in SendTicket usecase")
	}

	err = uc.messagerUC.SendMessage(jsonBytes)
	if err != nil {
		return "", errors.Wrap(err, "SendMessage in SendTicket usecase")
	}

	return payload.ID, nil
}
