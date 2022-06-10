package domain

import "context"

type Ticket struct {
	TicketID     string                 `json:"ticketID"`
	ImageUrl     string                 `json:"imageUrl"`
	Organization string                 `json:"organization"`
	Department   string                 `json:"department"`
	Metadata     map[string]interface{} `json:"metadata"`
}

type EmbedTicket struct {
	TicketID     string                 `json:"ticketID"`
	Embedding    [1][512]float64        `json:"embedding"`
	Organization string                 `json:"organization"`
	Department   string                 `json:"department"`
	Metadata     map[string]interface{} `json:"metadata"`
}

// type boundingBox struct {
// 	X      int `json:"x"`
// 	Y      int `json:"y"`
// 	Width  int `json:"width"`
// 	Height int `json:"height"`
// }

type TicketResult struct {
	ID           string      `json:"ID"`
	Organization string      `json:"organization"`
	Department   string      `json:"department"`
	TicketID     string      `json:"ticketID"`
	BoundingBox  [4]float64  `json:"boundingBox"`
	Timestamp    uint64      `json:"timestamp"`
	Metadata     interface{} `json:"metadata"`
}

type TicketRepository interface {
	GetTicketResult(ctx context.Context, ticketID string) (*TicketResult, error)
}

type TicketUseCase interface {
	SendTicket(payload *Ticket) (string, error)
	SendEmbedTicket(payload *EmbedTicket) (string, error)
	GetTicketResult(ctx context.Context, ticketID string) (*TicketResult, error)
}
