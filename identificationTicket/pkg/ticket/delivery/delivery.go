package delivery

import (
	"context"
	"log"
	"request-service/apperrors"
	"request-service/domain"

	"github.com/kataras/iris/v12"
)

type ticketHandler struct {
	uc domain.TicketUseCase
}

func New(app *iris.Application, uc domain.TicketUseCase) {
	h := &ticketHandler{uc: uc}

	app.Post("/", h.SendTicket)
	app.Get("/{ticketID:string}/result", h.GetTicketResult)
}

func (h *ticketHandler) _SendTicket(ctx iris.Context) {
	ticket := new(domain.Ticket)

	err := ctx.ReadJSON(ticket)
	if err != nil {
		ctx.StopWithError(iris.StatusBadRequest, err)
		return
	}

	ticket.Organization = ctx.Values().GetString("organization")

	id, err := h.uc.SendTicket(ticket)
	if err != nil {
		ctx.StopWithError(iris.StatusInternalServerError, err)
		return
	}

	ctx.JSON(map[string]interface{}{
		"ticketID": id,
	})
}

func (h *ticketHandler) _SendEmbedTicket(ctx iris.Context) {
	ticket := new(domain.EmbedTicket)

	err := ctx.ReadJSON(ticket)
	if err != nil {
		ctx.StopWithError(iris.StatusBadRequest, err)
		return
	}

	ticket.Organization = ctx.Values().GetString("organization")

	id, err := h.uc.SendEmbedTicket(ticket)
	if err != nil {
		ctx.StopWithError(iris.StatusInternalServerError, err)
		return
	}

	ctx.JSON(map[string]interface{}{
		"ticketID": id,
	})
}

func (h *ticketHandler) SendTicket(ctx iris.Context) {
	platform := ctx.URLParamDefault("platform", "app")

	if platform == "embed" {
		h._SendEmbedTicket(ctx)
	} else {
		h._SendTicket(ctx)
	}
}

func (h *ticketHandler) GetTicketResult(ctx iris.Context) {
	ticketID := ctx.Params().Get("ticketID")
	result, err := h.uc.GetTicketResult(context.Background(), ticketID)

	if err != nil {
		if err == apperrors.ErrDataNotFound {
			ctx.StopWithStatus(iris.StatusNotFound)
			return
		} else {
			log.Println(err)
			ctx.StopWithStatus(iris.StatusInternalServerError)
			return
		}
	}

	ctx.JSON(result)
}
