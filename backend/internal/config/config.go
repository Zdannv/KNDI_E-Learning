package config

import (
	"fmt"
	"log"
	"os"
	"strconv"
	"time"
)

type Config struct {
	AppPort			string
	AppEnv			string

	DBHost			string
	DBPort			string
	DBUser			string
	DBName			string
	DBPassword		string
	DBSSLMode		string

	DBMaxConns		int32
	DBMinConns		int32
	DBMaxIdleTime	time.Duration
	DBMaxLifeTime	time.Duration

	JWTSecret		string
	JWTExpiry		time.Duration

	AllowedOrigins	string
}

func Load() *Config {
	return &Config{
		AppPort: 		getEnv("DB_PORT"),
		AppEnv: 		getEnv("APP_ENV"),

		DBHost: 		getEnv("DB_HOST"),
		DBPort: 		getEnv("DB_PORT"),
		DBUser: 		getEnv("DB_USER"),
		DBName: 		getEnv("DB_NAME"),
		DBPassword: 	getEnv("DB_PASSWORD"),
		DBSSLMode: 		getEnv("DB_SSL_MODE"),

		DBMaxConns: 	int32(getEnvInt("DB_MAX_CONNS")),
		DBMinConns: 	int32(getEnvInt("DB_MIN_CONNS")),
		DBMaxIdleTime: 	time.Duration(getEnvInt("DB_MAX_IDLE_TIME")) * time.Minute,
		DBMaxLifeTime: 	time.Duration(getEnvInt("DB_MAX_LIFE_TIME")) * time.Hour,

		JWTSecret: 		getEnv("JWT_SECRET"),
		JWTExpiry: 		time.Duration(getEnvInt("JWT_EXPIRY")) * time.Hour,

		AllowedOrigins: getEnv("ALLOWED_ORIGINS"),
	}
}

func (c *Config) DSN() string {
	return fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		c.DBHost, c.DBPort,c.DBUser, c.DBPassword, c.DBName, c.DBSSLMode,
	)
}

func (c *Config) IsProduction() bool {
	return c.AppEnv == "production"
}

func getEnv(key string) string {
	v, ok := os.LookupEnv(key)
	if !ok || v == "" {
		log.Fatalf("[config] Requirement environment variable: %q is not set", key)
	}

	return v
}

func getEnvInt(key string) int {
	s, _ := os.LookupEnv(key)

	n, err := strconv.Atoi(s)
	if err != nil {
		log.Fatalf("[config] Requirement environment variable: %q is not set", key)
	}
	
	return n
}