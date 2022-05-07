package delivery

import (
	"context"
	"log"
	"webhook/apperrors"
	"webhook/domain"

	"github.com/kataras/iris/v12"
)

type webhookUrlHandler struct {
	uc domain.WebhookURLUsecase
}

func New(app *iris.Application, uc domain.WebhookURLUsecase) {
	h := &webhookUrlHandler{
		uc: uc,
	}

	app.Get("/webhook", h.getWebhookURL)
	app.Post("/webhook", h.setWebhookURL)
}

func (h *webhookUrlHandler) getWebhookURL(ctx iris.Context) {
	organization := ctx.Values().GetString("organization")
	url, err := h.uc.GetURL(context.Background(), organization)

	if err != nil {
		if err == apperrors.ErrDataNotFound {
			ctx.StopWithStatus(iris.StatusNotFound)
		} else {
			log.Print(err)
			ctx.StopWithStatus(iris.StatusInternalServerError)
		}

		return
	}

	ctx.JSON(map[string]interface{}{
		"url": url,
	})
}

func (h *webhookUrlHandler) setWebhookURL(ctx iris.Context) {
	webhookUrl := new(domain.WebhookURL)

	if err := ctx.ReadJSON(webhookUrl); err != nil {
		ctx.StopWithError(iris.StatusBadRequest, err)
		return
	}

	webhookUrl.Organization = ctx.Values().GetString("organization")

	if err := h.uc.SetURL(context.Background(), webhookUrl); err != nil {
		log.Println(err)
		ctx.StopWithStatus(iris.StatusInternalServerError)
	}

	ctx.StatusCode(iris.StatusOK)
	ctx.JSON(map[string]interface{}{
		"status": "ok",
	})
}
