package domain

import "context"

// type boundingBox struct {
// 	X      int `json:"x"`
// 	Y      int `json:"y"`
// 	Width  int `json:"width"`
// 	Height int `json:"height"`
// }

type IdentificationResult struct {
	ID           string      `json:"ID"`
	Organization string      `json:"organization"`
	Department   string      `json:"department"`
	TicketID     string      `json:"ticketID"`
	BoundingBox  [4]float64  `json:"boundingBox"`
	Timestamp    uint64      `json:"timestamp"`
	Metadata     interface{} `json:"metadata"`
}

type ResultUsecase interface {
	SendResult(ctx context.Context, result *IdentificationResult) error
}
