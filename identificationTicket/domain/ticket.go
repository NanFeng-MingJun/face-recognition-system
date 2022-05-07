package domain

type Ticket struct {
	ID           string                 `json:"id"`
	Url          string                 `json:"url"`
	Organization string                 `json:"organization"`
	Department   string                 `json:"department"`
	Metadata     map[string]interface{} `json:"metadata"`
}

type TicketUseCase interface {
	SendTicket(payload *Ticket) (string, error)
}
