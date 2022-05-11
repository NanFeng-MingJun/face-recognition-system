package usecase

import (
	"context"
	"encoding/json"
	"request-service/domain"

	"github.com/pkg/errors"

	"github.com/google/uuid"
)

type ticketUseCase struct {
	messagerUC domain.MessengerUseCase
	repo       domain.TicketRepository
}

func New(messagerUC domain.MessengerUseCase, repo domain.TicketRepository) domain.TicketUseCase {
	return &ticketUseCase{
		messagerUC: messagerUC,
		repo:       repo,
	}
}

func (uc *ticketUseCase) SendTicket(payload *domain.Ticket) (string, error) {
	payload.TicketID = uuid.NewString()
	jsonBytes, err := json.Marshal(&payload)
	if err != nil {
		return "", errors.Wrap(err, "JSON Marshal in SendTicket usecase")
	}

	err = uc.messagerUC.SendMessage(jsonBytes)
	if err != nil {
		return "", errors.Wrap(err, "SendMessage in SendTicket usecase")
	}

	return payload.TicketID, nil
}

func (uc *ticketUseCase) GetTicketResult(ctx context.Context, ticketID string) (*domain.TicketResult, error) {
	return uc.repo.GetTicketResult(ctx, ticketID)
}
