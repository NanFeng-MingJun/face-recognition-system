package usecase

import (
	"context"
	"webhook/domain"
)

type webhookURLUsecase struct {
	repo domain.WebhookURLRepo
}

func New(repo domain.WebhookURLRepo) domain.WebhookURLUsecase {
	return &webhookURLUsecase{
		repo: repo,
	}
}

func (uc *webhookURLUsecase) GetURL(ctx context.Context, organization string) (string, error) {
	url, err := uc.repo.GetURL(ctx, organization)
	if err != nil {
		return "", err
	}

	return url, nil
}

func (uc *webhookURLUsecase) SetURL(ctx context.Context, webhookUrl *domain.WebhookURL) error {
	return uc.repo.SetURL(ctx, webhookUrl)
}
