package domain

type Ticket struct {
	ID       string                 `json:"id"`
	Url      string                 `json:"url"`
	Class    string                 `json:"class"`
	SubClass string                 `json:"subclass"`
	Metadata map[string]interface{} `json:"metadata"`
}

type TicketUseCase interface {
	SendTicket(payload *Ticket) (string, error)
}
