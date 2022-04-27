package delivery

import (
	"request-service/domain"

	"github.com/kataras/iris/v12"
)

type ticketHandler struct {
	uc domain.TicketUseCase
}

func New(app *iris.Application, uc domain.TicketUseCase) {
	h := &ticketHandler{uc: uc}

	api := app.Party("/tickets")
	api.Post("/", h.SendTicket)
}

func (h *ticketHandler) SendTicket(ctx iris.Context) {
	ticket := new(domain.Ticket)
	// read request body
	err := ctx.ReadJSON(ticket)
	if err != nil {
		ctx.StopWithError(iris.StatusBadRequest, err)
		return
	}
	// read username as ticket class
	ticket.Class = ctx.Values().GetString("username")
	// Send to necessary services
	id, err := h.uc.SendTicket(ticket)
	if err != nil {
		ctx.StopWithError(iris.StatusInternalServerError, err)
		return
	}

	ctx.JSON(map[string]interface{}{
		"ticketID": id,
	})
}
