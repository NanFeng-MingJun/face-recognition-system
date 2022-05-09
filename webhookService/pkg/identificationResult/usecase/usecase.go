package usecase

import (
	"bytes"
	"context"
	"encoding/json"
	"log"
	"net/http"
	"webhook/domain"
)

var httpClient http.Client

type resultUsecase struct {
	webhookUrlUC domain.WebhookURLUsecase
}

func New(webhookUrlUC domain.WebhookURLUsecase) domain.ResultUsecase {
	return &resultUsecase{
		webhookUrlUC: webhookUrlUC,
	}
}

func (uc *resultUsecase) SendResult(ctx context.Context, result *domain.IdentificationResult) error {
	url, err := uc.webhookUrlUC.GetURL(context.Background(), result.Organization)
	if err != nil {
		return err
	}

	buffer := new(bytes.Buffer)
	encoder := json.NewEncoder(buffer)
	encoder.Encode(result)

	req, _ := http.NewRequestWithContext(ctx, "POST", url, buffer)
	req.Header.Add("content-type", "application/json")

	res, err := httpClient.Do(req)
	if err != nil {
		return err
	}

	log.Println(res.StatusCode)
	return nil
}
