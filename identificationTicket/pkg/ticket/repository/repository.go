package repository

import (
	"context"
	"encoding/json"
	"fmt"
	"request-service/apperrors"
	"request-service/domain"

	"github.com/go-redis/redis/v8"
)

type tickerRepo struct {
	db *redis.Client
}

func New(db *redis.Client) domain.TicketRepository {
	return &tickerRepo{
		db: db,
	}
}

func (r *tickerRepo) GetTicketResult(ctx context.Context, ticketID string) (*domain.TicketResult, error) {
	resultJson, err := r.db.Get(ctx, ticketID).Bytes()

	if err != nil {
		if err == redis.Nil {
			return nil, apperrors.ErrDataNotFound
		} else {
			return nil, err
		}
	}

	result := new(domain.TicketResult)

	if err := json.Unmarshal(resultJson, result); err != nil {
		return nil, fmt.Errorf("bad result format: %w", err)
	}

	return result, nil
}
