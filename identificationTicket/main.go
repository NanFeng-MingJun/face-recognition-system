package main

import (
	"log"
	"request-service/configs"
	"request-service/middlewares"
	messengerusecase "request-service/pkg/messenger/usecase"
	ticketdelivery "request-service/pkg/ticket/delivery"
	ticketrepo "request-service/pkg/ticket/repository"
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

	redisClient := configs.RedisInit()

	app := iris.New()
	app.Use(middlewares.GetUser)

	messengerUC := messengerusecase.New(kafkaProducer)
	ticketRepo := ticketrepo.New(redisClient)
	ticketUC := ticketusecase.New(messengerUC, ticketRepo)
	ticketdelivery.New(app, ticketUC)

	log.Println("Running on 3002")
	app.Listen(":3002")
}
