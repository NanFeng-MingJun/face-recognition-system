package configs

import (
	"github.com/go-redis/redis/v8"
	"github.com/spf13/viper"
)

func RedisInit() *redis.Client {
	client := redis.NewClient(&redis.Options{
		Addr:     viper.GetString("REDIS_ADDR"),
		Password: "",
		DB:       viper.GetInt("REDIS_DB"),
	})

	return client
}
