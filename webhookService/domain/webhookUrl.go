package domain

import "context"

type WebhookURL struct {
	Organization string `json:"organization"`
	Url          string `json:"url"`
}

type WebhookURLUsecase interface {
	SetURL(ctx context.Context, webhookUrl *WebhookURL) error
	GetURL(ctx context.Context, organization string) (string, error)
}

type WebhookURLRepo interface {
	SetURL(ctx context.Context, webhookUrl *WebhookURL) error
	GetURL(ctx context.Context, organization string) (string, error)
}
