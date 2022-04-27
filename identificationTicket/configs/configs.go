package configs

import (
	"github.com/spf13/viper"
)

func InitializeEnv() error {
	viper.SetConfigFile(".env")
	return viper.ReadInConfig()
}
