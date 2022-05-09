package main

import (
	"context"
	"log"
	"webhook/configs"
	"webhook/middlewares"

	_resultDelivery "webhook/pkg/identificationResult/delivery"
	_resultUC "webhook/pkg/identificationResult/usecase"
	_webhookUrlDelivery "webhook/pkg/webhookUrl/delivery"
	_webhookUrlRepo "webhook/pkg/webhookUrl/repository"
	_webhookUrlUC "webhook/pkg/webhookUrl/usecase"

	"github.com/kataras/iris/v12"
)

func main() {
	// Setup environment
	if err := configs.SetupEnv(); err != nil {
		log.Panic(err)
	}

	// Setup firestore
	firestoreClient, err := configs.FirestoreInit(context.Background())
	if err != nil {
		log.Panicln(err)
	}
	defer firestoreClient.Close()

	// Setup kafka app
	kafkaApp, err := configs.KafkaConsumeInit()
	if err != nil {
		log.Panicln(err)
	}
	defer kafkaApp.Close()

	webhookUrlRepo := _webhookUrlRepo.New(firestoreClient)
	webhookUrlUC := _webhookUrlUC.New(webhookUrlRepo)

	resultUC := _resultUC.New(webhookUrlUC)
	_resultDelivery.New(kafkaApp, resultUC)

	// Setup Iris app
	app := iris.New()

	app.Use(middlewares.GetOrganization)

	_webhookUrlDelivery.New(app, webhookUrlUC)
	app.Listen(":3003")
}
