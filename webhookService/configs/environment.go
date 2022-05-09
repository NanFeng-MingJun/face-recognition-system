package configs

import (
	"fmt"

	"github.com/spf13/viper"
)

func SetupEnv() error {
	// Set environment variables
	viper.SetConfigFile(".env")
	if err := viper.ReadInConfig(); err != nil {
		return fmt.Errorf("SetupEnv failed: %w", err)
	}

	return nil
}
