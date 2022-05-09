package delivery

import (
	"encoding/json"
	"log"
	"time"
	"webhook/configs"
	"webhook/domain"

	"github.com/spf13/viper"
	"golang.org/x/net/context"
)

type resultHandler struct {
	uc domain.ResultUsecase
}

func New(kafkaApp *configs.KafkaApp, resultUC domain.ResultUsecase) {
	h := &resultHandler{
		uc: resultUC,
	}

	topic := viper.GetString("KAFKA_RESULT_TOPIC")
	kafkaApp.Consume(topic, h.receiveResult)
}

func (h *resultHandler) receiveResult(data []byte) {
	result := new(domain.IdentificationResult)

	if err := json.Unmarshal(data, &result); err != nil {
		log.Println(err)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := h.uc.SendResult(ctx, result); err != nil {
		log.Println(err)
	}
}
