package database

import (
	"KNDI_E-LEARNING/internal/config"
	"context"
	"fmt"
	"log"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

func NewPool(ctx context.Context, cfg *config.Config) *pgxpool.Pool {
	poolCfg, err := pgxpool.ParseConfig(cfg.DSN())
	if err != nil {
		log.Fatalf("[DB] Failed to parse DSN: %q", err)
	}

	/* DATABASE CONNECTION POOL */
	poolCfg.MaxConns = cfg.DBMaxConns
	poolCfg.MinConns = cfg.DBMinConns
	poolCfg.MaxConnIdleTime = cfg.DBMaxIdleTime
	poolCfg.MaxConnLifetime = cfg.DBMaxLifeTime
	poolCfg.HealthCheckPeriod = 30 * time.Second
	poolCfg.ConnConfig.ConnectTimeout = 5 * time.Second

	pool, err := pgxpool.NewWithConfig(ctx, poolCfg)
	if err != nil {
		log.Fatalf("[DB] Failed to create pool: %q", err)
	}

	pingCtx, cancel := context.WithTimeout(ctx, 5 * time.Second)
	defer cancel()
	if err := pool.Ping(pingCtx); err != nil {
		log.Fatalf("[DB] Database unreachable: %v", err)
	}

	stat := pool.Stat()
	fmt.Printf("[DB] Pool ready - max_conns=%d idle=%d\n", stat.MaxConns(), stat.IdleConns())

	return pool
}