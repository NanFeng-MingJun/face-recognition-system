package main

import (
	"log"
	"request-service/configs"
	"request-service/middlewares"
	messengerusecase "request-service/pkg/messenger/usecase"
	ticketdelivery "request-service/pkg/ticket/delivery"
	ticketusecase "request-service/pkg/ticket/usecase"

	"github.com/kataras/iris/v12"
)

func main() {
	if err := configs.InitializeEnv(); err != nil {
		log.Fatalln(err)
	}

	kafkaProducer, err := configs.CreateKafkaProducer()
	if err != nil {
		log.Fatalln(err)
	}

	app := iris.New()
	app.Use(middlewares.GetUser)

	messengerUC := messengerusecase.New(kafkaProducer)
	requestUC := ticketusecase.New(messengerUC)
	ticketdelivery.New(app, requestUC)

	app.Listen(":3002")
}
