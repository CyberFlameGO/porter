package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/porter-dev/porter/api/server/router"
	"github.com/porter-dev/porter/api/server/shared/config/loader"
)

// Version will be linked by an ldflag during build
var Version string = "dev-ce"

func main() {
	var versionFlag bool
	flag.BoolVar(&versionFlag, "version", false, "print version and exit")
	flag.Parse()

	// Exit safely when version is used
	if versionFlag {
		fmt.Println(Version)
		os.Exit(0)
	}

	cl := loader.NewEnvLoader(Version)

	config, err := cl.LoadConfig()

	if err != nil {
		log.Fatal("Config loading failed: ", err)
	}

	appRouter := router.NewAPIRouter(config)

	address := fmt.Sprintf(":%d", config.ServerConf.Port)

	config.Logger.Info().Msgf("Starting server %v", address)

	s := &http.Server{
		Addr:         address,
		Handler:      appRouter,
		ReadTimeout:  config.ServerConf.TimeoutRead,
		WriteTimeout: config.ServerConf.TimeoutWrite,
		IdleTimeout:  config.ServerConf.TimeoutIdle,
	}

	if err := s.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		config.Logger.Fatal().Err(err).Msg("Server startup failed")
	}
}
