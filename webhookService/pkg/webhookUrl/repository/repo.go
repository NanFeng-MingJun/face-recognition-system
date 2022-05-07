package repository

import (
	"context"
	"webhook/apperrors"
	"webhook/domain"

	"cloud.google.com/go/firestore"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type webhookURLRepo struct {
	db *firestore.Client
}

func New(db *firestore.Client) domain.WebhookURLRepo {
	return &webhookURLRepo{
		db: db,
	}
}

func (rp *webhookURLRepo) SetURL(ctx context.Context, webhookUrl *domain.WebhookURL) error {
	_, err := rp.db.Collection("webhook").Doc(webhookUrl.Organization).
		Set(ctx, map[string]interface{}{
			"url": webhookUrl.Url,
		})

	return err
}

func (re *webhookURLRepo) GetURL(ctx context.Context, organization string) (string, error) {
	dsnap, err := re.db.Collection("webhook").Doc(organization).Get(ctx)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return "", apperrors.ErrDataNotFound
		}
		return "", err
	}

	data := dsnap.Data()

	return data["url"].(string), nil
}
